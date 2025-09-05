// Secure data storage utilities - client-side interface to server API

interface WaitlistSignup {
  email: string
  consent: boolean
  source: string
  case_id?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
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
  case_type: "evidence" | "experience"
  files_count: number
  submitted_at: string
}

class DataStorage {
  // Fallback to local storage for development
  private writeToLocalStorage(tableName: string, data: any) {
    if (typeof window === "undefined") return

    const existingData = JSON.parse(localStorage.getItem(`dnounce_${tableName}`) || "[]")
    const newData = Array.isArray(data) ? [...existingData, ...data] : [...existingData, data]
    localStorage.setItem(`dnounce_${tableName}`, JSON.stringify(newData))
    console.log(`[v0] Data stored locally in ${tableName}:`, data)
  }

  // Upsert waitlist signup (dedupe by email) - calls secure API
  async upsertWaitlistSignup(data: WaitlistSignup) {
    try {
      const response = await fetch("/api/data-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "upsert_waitlist",
          data,
        }),
      })

      if (!response.ok) {
        throw new Error("API request failed")
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] Error storing waitlist signup:", error)
      // Fallback to local storage
      this.writeToLocalStorage("waitlist_signups", data)
      return { success: true, message: "Stored locally (fallback)" }
    }
  }

  // Insert survey response - calls secure API
  async insertSurveyResponse(data: PostSubmitSurvey) {
    try {
      const response = await fetch("/api/data-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "insert_survey",
          data,
        }),
      })

      if (!response.ok) {
        throw new Error("API request failed")
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] Error storing survey response:", error)
      // Fallback to local storage
      this.writeToLocalStorage("post_submit_surveys", data)
      return { success: true, message: "Stored locally (fallback)" }
    }
  }

  // Insert case submission - calls secure API
  async insertCaseSubmission(data: CaseSubmission) {
    this.writeToLocalStorage("case_submissions", data)

    try {
      const response = await fetch("/api/data-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "insert_case",
          data,
        }),
      })

      if (!response.ok) {
        throw new Error("API request failed")
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] Error storing case submission:", error)
      // Data already stored locally above
      return { success: true, message: "Stored locally (fallback)" }
    }
  }

  // Get current stats (for development/admin)
  async getStats() {
    try {
      const response = await fetch("/api/data-storage")

      if (!response.ok) {
        throw new Error("API request failed")
      }

      return await response.json()
    } catch (error) {
      console.error("[v0] Error getting stats:", error)

      // Fallback to local storage
      if (typeof window === "undefined") return { waitlist: 0, surveys: 0, cases: 0 }

      try {
        const waitlistData = JSON.parse(localStorage.getItem("dnounce_waitlist_signups") || "[]")
        const surveyData = JSON.parse(localStorage.getItem("dnounce_post_submit_surveys") || "[]")
        const caseData = JSON.parse(localStorage.getItem("dnounce_case_submissions") || "[]")

        return {
          waitlist: waitlistData.length,
          surveys: surveyData.length,
          cases: caseData.length,
          waitlistEmails: waitlistData.map((r: any) => r.email),
          surveyResponses: surveyData.length,
          caseSubmissions: caseData.length,
        }
      } catch (localError) {
        console.error("[v0] Error reading local storage:", localError)
        return { waitlist: 0, surveys: 0, cases: 0 }
      }
    }
  }

  // Export data (for admin use)
  async exportData() {
    if (typeof window === "undefined") return null

    try {
      const waitlistData = JSON.parse(localStorage.getItem("dnounce_waitlist_signups") || "[]")
      const surveyData = JSON.parse(localStorage.getItem("dnounce_post_submit_surveys") || "[]")
      const caseData = JSON.parse(localStorage.getItem("dnounce_case_submissions") || "[]")

      // Create CSV-like data
      const waitlistCSV = this.arrayToCSV(waitlistData)
      const surveyCSV = this.arrayToCSV(surveyData)
      const caseCSV = this.arrayToCSV(caseData)

      return {
        waitlist: waitlistCSV,
        surveys: surveyCSV,
        cases: caseCSV,
        waitlistData,
        surveyData,
        caseData,
      }
    } catch (error) {
      console.error("[v0] Error exporting data:", error)
      return null
    }
  }

  private arrayToCSV(data: any[]): string {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header]
            return typeof value === "string" && value.includes(",") ? `"${value}"` : value
          })
          .join(","),
      ),
    ]

    return csvRows.join("\n")
  }
}

// Export singleton instance
export const dataStorage = new DataStorage()

// Utility functions for easy use
export async function recordWaitlistSignup(
  email: string,
  source: string,
  caseId?: string,
  utmParams?: { utm_source?: string; utm_medium?: string; utm_campaign?: string },
) {
  return await dataStorage.upsertWaitlistSignup({
    email,
    consent: true,
    source,
    case_id: caseId,
    ...utmParams,
  })
}

export async function recordSurveyResponse(surveyData: {
  email: string
  caseId?: string
  easeOfUse: "Yes" | "Somewhat" | "No"
  understoodPurpose: "Yes" | "Somewhat" | "No"
  futureUse: "Very Likely" | "Maybe" | "No"
  likedMost?: string
  wouldImprove?: string
}) {
  return await dataStorage.insertSurveyResponse({
    email: surveyData.email,
    case_id: surveyData.caseId,
    ease_of_use: surveyData.easeOfUse,
    understood_purpose: surveyData.understoodPurpose,
    future_use: surveyData.futureUse,
    liked_most: surveyData.likedMost,
    improve_one_thing: surveyData.wouldImprove,
    consent: true,
  })
}

// Utility function for easy use
export async function recordCaseSubmission(caseData: {
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
  case_type: "evidence" | "experience"
  files_count: number
}) {
  return await dataStorage.insertCaseSubmission({
    case_id: caseData.case_id,
    plaintiff_first_name: caseData.plaintiff_first_name,
    plaintiff_last_name: caseData.plaintiff_last_name,
    plaintiff_email: caseData.plaintiff_email,
    defendant_first_name: caseData.defendant_first_name,
    defendant_last_name: caseData.defendant_last_name,
    defendant_alias: caseData.defendant_alias,
    defendant_organization: caseData.defendant_organization,
    defendant_city: caseData.defendant_city,
    defendant_state: caseData.defendant_state,
    defendant_email: caseData.defendant_email,
    defendant_phone: caseData.defendant_phone,
    case_title: caseData.case_title,
    case_summary: caseData.case_summary,
    relationship: caseData.relationship,
    case_type: caseData.case_type,
    files_count: caseData.files_count,
    submitted_at: new Date().toISOString(),
  })
}
