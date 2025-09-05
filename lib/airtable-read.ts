// All Airtable operations now go through secure server-side API at /api/cases

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

export async function fetchCasesFromAirtable(): Promise<any[]> {
  try {
    console.log("[v0] Fetching cases from secure server API")

    const response = await fetch("/api/cases")

    if (!response.ok) {
      console.warn("[v0] Server API error, using static data fallback")
      return []
    }

    const data = await response.json()
    console.log("[v0] Successfully fetched cases from server API:", data.cases?.length || 0)

    return data.cases || []
  } catch (error) {
    console.error("[v0] Error fetching from server API:", error)
    console.warn("[v0] Using static data fallback")
    return []
  }
}

export function getDefendantId(firstName: string, lastName?: string): string {
  return `${firstName}${lastName ? `-${lastName}` : ""}`.toLowerCase().replace(/\s+/g, "-")
}
