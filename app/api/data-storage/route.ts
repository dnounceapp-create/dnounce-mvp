import { type NextRequest, NextResponse } from "next/server"
import submitCaseViaMake from "../../../lib/make-webhook"

// Server-side environment variables (secure)
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID

interface WaitlistSignup {
  email: string
  consent: boolean
  source: string
  case_id?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  created_at: string
}

interface PostSubmitSurvey {
  email: string
  case_id?: string
  ease_of_use: "Yes" | "Somewhat" | "No"
  understood_purpose: "Yes" | "Somewhat" | "No"
  future_use: "Very Likely" | "Maybe" | "No"
  liked_most?: string
  improve_one_thing?: string
  consent: boolean
  created_at: string
}

interface CaseSubmission {
  case_id: string
  plaintiff_first_name: string
  plaintiff_last_name: string
  plaintiff_email: string
  defendant_first_name: string
  defendant_last_name: string
  defendant_alias: string
  defendant_organization: string
  defendant_city: string
  defendant_state: string
  defendant_email: string
  defendant_phone: string
  case_title: string
  case_summary: string
  relationship: string
  case_type: string
  files_count: number
  submitted_at: string
}

async function writeToAirtable(tableName: string, records: any[]) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error("Airtable configuration missing")
  }

  const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      records: records.map((record) => ({ fields: record })),
    }),
  })

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.statusText}`)
  }

  return await response.json()
}

async function checkEmailExists(email: string): Promise<boolean> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return false
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/waitlist_signups?filterByFormula={email}="${email.toLowerCase()}"`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      },
    )

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.records && data.records.length > 0
  } catch (error) {
    console.error("Error checking email existence:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "upsert_waitlist": {
        const emailExists = await checkEmailExists(data.email)

        if (emailExists) {
          return NextResponse.json({ success: true, message: "Email already registered" })
        }

        const record: WaitlistSignup = {
          ...data,
          email: data.email.toLowerCase(),
          created_at: new Date().toISOString(),
        }

        await writeToAirtable("waitlist_signups", [record])
        return NextResponse.json({ success: true, message: "Waitlist signup recorded" })
      }

      case "insert_survey": {
        const record: PostSubmitSurvey = {
          ...data,
          email: data.email.toLowerCase(),
          created_at: new Date().toISOString(),
        }

        await writeToAirtable("post_submit_surveys", [record])
        return NextResponse.json({ success: true, message: "Survey response recorded" })
      }

      case "insert_case": {
        try {
          console.log("[v0] Attempting case submission via Make webhook")
          await submitCaseViaMake(data)
          console.log("[v0] Case submission successful via Make webhook")
          return NextResponse.json({ success: true, message: "Case submission recorded via Make" })
        } catch (error) {
          console.error("[v0] Make webhook error:", error)
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          return NextResponse.json(
            {
              error: `Make webhook failed: ${errorMessage}. Please configure MAKE_WEBHOOK_URL environment variable.`,
              fallback: "local_storage",
            },
            { status: 500 },
          )
        }
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Data storage error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  // Get stats for admin dashboard
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({
        waitlist: 0,
        surveys: 0,
        cases: 0, // Added cases count
        message: "Airtable not configured - using fallback",
      })
    }

    // Get waitlist count
    const waitlistResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/waitlist_signups`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    // Get survey count
    const surveyResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/post_submit_surveys`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    })

    const caseResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID || "case_submissions"}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      },
    )

    const waitlistData = waitlistResponse.ok ? await waitlistResponse.json() : { records: [] }
    const surveyData = surveyResponse.ok ? await surveyResponse.json() : { records: [] }
    const caseData = caseResponse.ok ? await caseResponse.json() : { records: [] }

    return NextResponse.json({
      waitlist: waitlistData.records?.length || 0,
      surveys: surveyData.records?.length || 0,
      cases: caseData.records?.length || 0, // Added cases count
      waitlistEmails: waitlistData.records?.map((r: any) => r.fields.email) || [],
      surveyResponses: surveyData.records?.map((r: any) => r.fields) || [],
      caseSubmissions: caseData.records?.map((r: any) => r.fields) || [], // Added case submissions data
    })
  } catch (error) {
    console.error("Error getting stats:", error)
    return NextResponse.json({
      waitlist: 0,
      surveys: 0,
      cases: 0, // Added cases fallback
      error: "Failed to fetch stats",
    })
  }
}
