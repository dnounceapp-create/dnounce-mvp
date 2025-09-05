type CasePayload = {
  case_id: string
  plaintiff_first_name: string
  plaintiff_last_name: string
  plaintiff_email: string
  defendant_first_name?: string
  defendant_last_name?: string
  defendant_alias?: string
  defendant_organization?: string
  defendant_city?: string
  defendant_state?: string
  defendant_email?: string
  defendant_phone?: string
  case_title: string
  case_summary: string
  relationship?: string
  case_type?: string
  files_count?: number
  submitted_at?: string
}

const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL

function reqString(v: unknown, name: string) {
  if (!v || typeof v !== "string") throw new Error(`${name} required`)
  return v
}
function toInt(n: any) {
  const x = Number(n)
  return Number.isFinite(x) ? x : 0
}

export default async function submitCaseViaMake(form: Record<string, any>) {
  if (!WEBHOOK_URL) {
    throw new Error("Make webhook not configured: Missing MAKE_WEBHOOK_URL environment variable")
  }

  const data: CasePayload = {
    case_id: reqString(form.case_id, "case_id"),
    plaintiff_first_name: reqString(form.plaintiff_first_name, "plaintiff_first_name"),
    plaintiff_last_name: reqString(form.plaintiff_last_name, "plaintiff_last_name"),
    plaintiff_email: reqString(form.plaintiff_email, "plaintiff_email"),
    defendant_first_name: form.defendant_first_name || "",
    defendant_last_name: form.defendant_last_name || "",
    defendant_alias: form.defendant_alias || "",
    defendant_organization: form.defendant_organization || "",
    defendant_city: form.defendant_city || "",
    defendant_state: form.defendant_state || "",
    defendant_email: form.defendant_email || "",
    defendant_phone: form.defendant_phone || "",
    case_title: reqString(form.case_title, "case_title"),
    case_summary: reqString(form.case_summary, "case_summary"),
    relationship: form.relationship || "",
    case_type: form.case_type || "",
    files_count: toInt(form.files_count),
    submitted_at: form.submitted_at || new Date().toISOString(),
  }

  console.log("[v0] Sending case to Make webhook:", data.case_id)

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const text = await res.text()
    console.error("[v0] Make webhook failed:", res.status, text)
    throw new Error(`Make webhook error ${res.status}: ${text}`)
  }

  console.log("[v0] Make webhook success for case:", data.case_id)
  return { ok: true }
}
