import { type NextRequest, NextResponse } from "next/server"

interface AirtableCase {
  id: string
  fields: {
    case_id: string
    case_type: "evidence" | "experience"
    plaintiff_first_name: string
    plaintiff_last_name: string
    defendant_first_name: string
    defendant_last_name: string
    defendant_city: string
    defendant_state: string
    case_title: string
    case_summary: string
    relationship: string
    submitted_at: string
    files_count?: number
  }
}

interface AirtableResponse {
  records: AirtableCase[]
}

export async function GET(request: NextRequest) {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableId = process.env.AIRTABLE_TABLE_ID
    const apiKey = process.env.AIRTABLE_API_KEY

    if (!baseId || !tableId || !apiKey) {
      console.warn("[v0] Airtable configuration missing on server")

      // Try to get locally stored cases from the request headers or query params
      const url = new URL(request.url)
      const includeLocal = url.searchParams.get("includeLocal") === "true"

      if (includeLocal) {
        // Return a placeholder structure that the client can populate with local storage data
        return NextResponse.json({
          cases: [],
          airtableConfigured: false,
          shouldCheckLocalStorage: true,
        })
      }

      return NextResponse.json({ cases: [], airtableConfigured: false })
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}?sort%5B0%5D%5Bfield%5D=submitted_at&sort%5B0%5D%5Bdirection%5D=desc`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`)
    }

    const data: AirtableResponse = await response.json()

    const cases = data.records.map((record) => ({
      caseId: record.fields.case_id,
      case_id: record.fields.case_id, // Add both formats for compatibility
      type: record.fields.case_type,
      case_type: record.fields.case_type,
      relationship: record.fields.relationship,
      plaintiff_first_name: record.fields.plaintiff_first_name,
      plaintiff_last_name: record.fields.plaintiff_last_name,
      defendant_first_name: record.fields.defendant_first_name,
      defendant_last_name: record.fields.defendant_last_name,
      defendant_city: record.fields.defendant_city,
      defendant_state: record.fields.defendant_state,
      case_title: record.fields.case_title,
      case_summary: record.fields.case_summary,
      submitted_at: record.fields.submitted_at,
      plaintiff: {
        firstName: record.fields.plaintiff_first_name,
        lastName: record.fields.plaintiff_last_name,
        alias: record.fields.plaintiff_first_name,
      },
      defendant: {
        firstName: record.fields.defendant_first_name,
        lastName: record.fields.defendant_last_name,
        city: record.fields.defendant_city,
        state: record.fields.defendant_state,
      },
      meta: {
        title: record.fields.case_title,
        summaryOneLine: record.fields.case_summary?.substring(0, 120) + "..." || "",
        createdAt: record.fields.submitted_at,
        publishedAt: record.fields.submitted_at,
      },
      status: {
        stage: "published",
        label: "Published",
      },
      displayNameLine: `${record.fields.plaintiff_first_name} vs ${record.fields.defendant_first_name} ${record.fields.defendant_last_name}`,
      evidence: record.fields.files_count
        ? Array.from({ length: record.fields.files_count }, (_, i) => ({
            id: `file_${i}`,
            filename: `Evidence_${i + 1}`,
            authenticity: "Authentic" as const,
          }))
        : [],
      flags: {
        followed: false,
        pinned: false,
      },
      lifecycleStage: "PUBLISHED",
      stageStartedAt: record.fields.submitted_at,
      isDemoRandomized: false,
      showDeletedInExploreDemo: false,
    }))

    return NextResponse.json({ cases, airtableConfigured: true })
  } catch (error) {
    console.error("[v0] Error fetching from Airtable:", error)
    return NextResponse.json({ cases: [], airtableConfigured: false, error: error.message })
  }
}
