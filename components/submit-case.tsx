"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Upload, Paperclip } from "lucide-react"
import { analytics } from "@/lib/analytics"
import { recordCaseSubmission } from "@/lib/data-storage"

interface SubmitCaseProps {
  onCaseSubmitted: (caseData: any) => void
}

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

const RELATIONSHIPS = [
  "service provider",
  "client/customer",
  "friend",
  "landlord",
  "tenant",
  "neighbor",
  "classmate",
  "contractor",
  "freelancer",
  "other",
]

export function SubmitCase({ onCaseSubmitted }: SubmitCaseProps) {
  const [formData, setFormData] = useState({
    plaintiff: {
      firstName: "",
      lastName: "",
      email: "",
    },
    defendant: {
      firstName: "",
      lastName: "",
      alias: "",
      organization: "",
      city: "",
      state: "",
      email: "",
      phone: "",
    },
    case: {
      title: "",
      summary: "",
      relationship: "",
      customRelationship: "", // Added custom relationship field
      files: [] as File[],
    },
    checkboxes: {
      legal: false,
      consequences: false,
      protection: false,
      disclaimers: false,
      acknowledgment: false,
      evidence: false,
    },
    masterAcknowledgment: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formStarted, setFormStarted] = useState(false)

  useEffect(() => {
    const hasAnyInput =
      formData.plaintiff.firstName ||
      formData.plaintiff.email ||
      formData.defendant.firstName ||
      formData.case.title ||
      formData.case.summary

    if (hasAnyInput && !formStarted) {
      setFormStarted(true)
      analytics.trackCaseFormStarted()
    }
  }, [formData, formStarted])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.plaintiff.firstName.trim()) {
      newErrors["plaintiff.firstName"] = "First name is required"
    }
    if (!formData.plaintiff.lastName.trim()) {
      newErrors["plaintiff.lastName"] = "Last name is required"
    }
    if (!formData.plaintiff.email.trim()) {
      newErrors["plaintiff.email"] = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.plaintiff.email)) {
      newErrors["plaintiff.email"] = "Invalid email format"
    }

    if (!formData.defendant.firstName.trim()) {
      newErrors["defendant.firstName"] = "First name is required"
    }
    if (!formData.defendant.city.trim()) {
      newErrors["defendant.city"] = "City is required"
    }
    if (!formData.defendant.state) {
      newErrors["defendant.state"] = "State is required"
    }

    if (!formData.defendant.email.trim() && !formData.defendant.phone.trim()) {
      newErrors["defendant.contact"] = "Either email or phone is required"
    }
    if (formData.defendant.email.trim() && !/\S+@\S+\.\S+/.test(formData.defendant.email)) {
      newErrors["defendant.email"] = "Invalid email format"
    }

    if (!formData.case.title.trim()) {
      newErrors["case.title"] = "Case title is required"
    }
    if (!formData.case.summary.trim()) {
      newErrors["case.summary"] = "Case summary is required"
    }
    if (!formData.case.relationship.trim()) {
      newErrors["case.relationship"] = "Your relationship to this person is required"
    }
    if (formData.case.relationship === "other" && !formData.case.customRelationship.trim()) {
      newErrors["case.customRelationship"] = "Please specify your relationship"
    }

    Object.keys(formData.checkboxes).forEach((key) => {
      if (!formData.checkboxes[key as keyof typeof formData.checkboxes]) {
        newErrors[`checkbox.${key}`] = "This checkbox is required"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const fd = new FormData(e.target as HTMLFormElement)
    console.log("[v0] Form keys:", [...fd.keys()]) // should include "plaintiff_last_name"
    console.log("[v0] FormData values:", Object.fromEntries(fd.entries()))

    if (!validateForm()) {
      return
    }

    const caseId = `${formData.case.files.length > 0 ? "EVB" : "OPB"}${String(Math.floor(100 + Math.random() * 900)).padStart(3, "0")}`

    const finalRelationship =
      formData.case.relationship === "other" ? formData.case.customRelationship : formData.case.relationship

    const newCase = {
      caseId,
      type: formData.case.files.length > 0 ? "evidence" : "opinion",
      relationship: finalRelationship,
      plaintiff: formData.plaintiff,
      defendant: formData.defendant,
      meta: {
        title: formData.case.title,
        summaryOneLine: formData.case.summary,
        createdAt: new Date().toISOString(),
        publishedAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      status: {
        stage: "AI Verification",
        label: "AI Verification in Progress (simulated)",
        deadlineUtc: new Date(Date.now() + 68 * 60 * 60 * 1000).toISOString(),
      },
      displayNameLine: `${formData.plaintiff.firstName} vs ${formData.defendant.firstName}${formData.defendant.lastName ? " " + formData.defendant.lastName : ""}${formData.defendant.alias ? ' alias "' + formData.defendant.alias + '"' : ""}`,
      evidence: formData.case.files.map((file, index) => ({
        id: `ev${index + 1}`,
        filename: file.name,
        authenticity: "Authentic" as const,
      })),
      flags: {
        followed: false,
        pinned: false,
      },
    }

    try {
      await recordCaseSubmission({
        case_id: caseId,
        plaintiff_first_name: formData.plaintiff.firstName,
        plaintiff_last_name: formData.plaintiff.lastName,
        plaintiff_email: formData.plaintiff.email,
        defendant_first_name: formData.defendant.firstName,
        defendant_last_name: formData.defendant.lastName,
        defendant_alias: formData.defendant.alias,
        defendant_organization: formData.defendant.organization,
        defendant_city: formData.defendant.city,
        defendant_state: formData.defendant.state,
        defendant_email: formData.defendant.email,
        defendant_phone: formData.defendant.phone,
        case_title: formData.case.title,
        case_summary: formData.case.summary,
        relationship: finalRelationship,
        case_type: formData.case.files.length > 0 ? "evidence" : "experience",
        files_count: formData.case.files.length,
      })
    } catch (error) {
      console.error("[v0] Error recording case submission:", error)
    }

    analytics.trackCaseFormCompleted(caseId, finalRelationship, !!formData.defendant.city, !!formData.defendant.state)

    onCaseSubmitted(newCase)

    window.location.hash = `#/case-confirmation/${caseId}/${formData.case.files.length > 0 ? "evidence" : "experience"}`
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        case: {
          ...prev.case,
          files: Array.from(e.target.files || []),
        },
      }))
    }
  }

  const handleSurveySubmit = (surveyData: any) => {
    console.log("[v0] Survey submitted:", surveyData)
    analytics.trackSurveySubmitted(surveyData)

    if (surveyData.wantNotifications && surveyData.email) {
      analytics.trackPrelaunchOptIn(surveyData.email, "post_submit_modal", surveyData.caseId)
    }

    window.location.hash = "#/mvp/survey/thankyou"
  }

  const handleSurveyClose = () => {
    window.location.hash = "#/"
  }

  useEffect(() => {
    if (window.location.hash.includes("#/case-confirmation")) {
      window.location.hash = "#/"
    }
  }, [])

  const handleMasterToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      masterAcknowledgment: checked,
      checkboxes: {
        legal: checked,
        consequences: checked,
        protection: checked,
        disclaimers: checked,
        acknowledgment: checked,
        evidence: checked,
      },
    }))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit a Case</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Plaintiff (You)</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plaintiff-firstName">First Name *</Label>
                  <Input
                    id="plaintiff-firstName"
                    value={formData.plaintiff.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        plaintiff: { ...prev.plaintiff, firstName: e.target.value },
                      }))
                    }
                    className={errors["plaintiff.firstName"] ? "border-red-500" : ""}
                  />
                  {errors["plaintiff.firstName"] && (
                    <p className="text-red-500 text-sm mt-1">{errors["plaintiff.firstName"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="plaintiff-lastName">Last Name *</Label>
                  <Input
                    id="plaintiff-lastName"
                    value={formData.plaintiff.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        plaintiff: { ...prev.plaintiff, lastName: e.target.value },
                      }))
                    }
                    className={errors["plaintiff.lastName"] ? "border-red-500" : ""}
                  />
                  {errors["plaintiff.lastName"] && (
                    <p className="text-red-500 text-sm mt-1">{errors["plaintiff.lastName"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="plaintiff-email">Email *</Label>
                  <Input
                    id="plaintiff-email"
                    type="email"
                    value={formData.plaintiff.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        plaintiff: { ...prev.plaintiff, email: e.target.value },
                      }))
                    }
                    className={errors["plaintiff.email"] ? "border-red-500" : ""}
                  />
                  {errors["plaintiff.email"] && (
                    <p className="text-red-500 text-sm mt-1">{errors["plaintiff.email"]}</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Defendant</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="defendant-firstName">First Name *</Label>
                  <Input
                    id="defendant-firstName"
                    value={formData.defendant.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defendant: { ...prev.defendant, firstName: e.target.value },
                      }))
                    }
                    className={errors["defendant.firstName"] ? "border-red-500" : ""}
                  />
                  {errors["defendant.firstName"] && (
                    <p className="text-red-500 text-sm mt-1">{errors["defendant.firstName"]}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="defendant-lastName">Last Name</Label>
                  <Input
                    id="defendant-lastName"
                    value={formData.defendant.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defendant: { ...prev.defendant, lastName: e.target.value },
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="defendant-alias">Alias (a.k.a./nickname)</Label>
                  <Input
                    id="defendant-alias"
                    value={formData.defendant.alias}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defendant: { ...prev.defendant, alias: e.target.value },
                      }))
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">May help the community identify the person.</p>
                </div>

                <div>
                  <Label htmlFor="defendant-organization">Organization/Company</Label>
                  <Input
                    id="defendant-organization"
                    value={formData.defendant.organization}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        defendant: { ...prev.defendant, organization: e.target.value },
                      }))
                    }
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional (if your experience relates to their work or business).
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defendant-city">City *</Label>
                    <Input
                      id="defendant-city"
                      value={formData.defendant.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          defendant: { ...prev.defendant, city: e.target.value },
                        }))
                      }
                      className={errors["defendant.city"] ? "border-red-500" : ""}
                    />
                    {errors["defendant.city"] && (
                      <p className="text-red-500 text-sm mt-1">{errors["defendant.city"]}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Required to narrow down jurisdiction and avoid mistaken identity.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="defendant-state">State *</Label>
                    <Select
                      value={formData.defendant.state}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          defendant: { ...prev.defendant, state: value },
                        }))
                      }
                    >
                      <SelectTrigger className={errors["defendant.state"] ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors["defendant.state"] && (
                      <p className="text-red-500 text-sm mt-1">{errors["defendant.state"]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Contact (Email or Phone required)</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Email"
                      type="email"
                      value={formData.defendant.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          defendant: { ...prev.defendant, email: e.target.value },
                        }))
                      }
                      className={errors["defendant.email"] ? "border-red-500" : ""}
                    />
                    <Input
                      placeholder="Phone"
                      type="tel"
                      value={formData.defendant.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          defendant: { ...prev.defendant, phone: e.target.value },
                        }))
                      }
                    />
                  </div>
                  {errors["defendant.contact"] && (
                    <p className="text-red-500 text-sm mt-1">{errors["defendant.contact"]}</p>
                  )}
                  {errors["defendant.email"] && (
                    <p className="text-red-500 text-sm mt-1">{errors["defendant.email"]}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    We ask for one contact method to notify the person about your case fairly. You may provide either
                    email or phone.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Case Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="case-title">Case Title *</Label>
                  <Input
                    id="case-title"
                    value={formData.case.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        case: { ...prev.case, title: e.target.value },
                      }))
                    }
                    className={errors["case.title"] ? "border-red-500" : ""}
                  />
                  {errors["case.title"] && <p className="text-red-500 text-sm mt-1">{errors["case.title"]}</p>}
                </div>

                <div>
                  <Label htmlFor="case-summary">
                    Write a detailed case about someone you would like to review. A profile will be automatically
                    created for the individual unless one already exists *
                  </Label>
                  <Textarea
                    id="case-summary"
                    value={formData.case.summary}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        case: { ...prev.case, summary: e.target.value },
                      }))
                    }
                    className={errors["case.summary"] ? "border-red-500" : ""}
                    rows={6}
                    placeholder="Describe your experience with this person in detail. You can write multiple sentences and paragraphs to fully explain what happened."
                  />
                  {errors["case.summary"] && <p className="text-red-500 text-sm mt-1">{errors["case.summary"]}</p>}
                </div>

                <div>
                  <Label htmlFor="case-relationship">Your relationship to this person *</Label>
                  <Select
                    value={formData.case.relationship}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        case: { ...prev.case, relationship: value },
                      }))
                    }
                  >
                    <SelectTrigger className={errors["case.relationship"] ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map((rel) => (
                        <SelectItem key={rel} value={rel}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors["case.relationship"] && (
                    <p className="text-red-500 text-sm mt-1">{errors["case.relationship"]}</p>
                  )}

                  {formData.case.relationship === "other" && (
                    <div className="mt-3">
                      <Label htmlFor="custom-relationship">Please specify your relationship *</Label>
                      <Input
                        id="custom-relationship"
                        value={formData.case.customRelationship}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            case: { ...prev.case, customRelationship: e.target.value },
                          }))
                        }
                        placeholder="Enter your relationship to this person"
                        className={errors["case.customRelationship"] ? "border-red-500" : ""}
                      />
                      {errors["case.customRelationship"] && (
                        <p className="text-red-500 text-sm mt-1">{errors["case.customRelationship"]}</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="case-files">Evidence Upload (optional)</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="case-files"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG (MAX. 10MB each)</p>
                      </div>
                      <Input
                        id="case-files"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                    </label>
                  </div>
                  {formData.case.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-gray-700">Selected files:</p>
                      {formData.case.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                        >
                          <Paperclip className="w-4 h-4" />
                          <span>{file.name}</span>
                          <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Files accepted but AI authenticity verification is simulated for MVP.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-20">
              <h3 className="text-lg font-semibold mb-4">Legal Disclaimers & Community Protection</h3>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="master-acknowledgment" className="text-sm font-medium">
                      {formData.masterAcknowledgment ? "I Acknowledge All" : "I Don't Acknowledge"}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      Toggle to acknowledge all legal disclaimers and community protection terms
                    </p>
                  </div>
                  <Switch
                    id="master-acknowledgment"
                    checked={formData.masterAcknowledgment}
                    onCheckedChange={handleMasterToggle}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="legal"
                    checked={formData.checkboxes.legal}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        checkboxes: { ...prev.checkboxes, legal: !!checked },
                      }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="legal" className="text-sm">
                      Legal Certification *
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I certify this case is based on my genuine experience, contains no deliberate misrepresentation,
                      and I agree to the Terms of Service.
                    </p>
                    {errors["checkbox.legal"] && (
                      <p className="text-red-500 text-xs mt-1">{errors["checkbox.legal"]}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consequences"
                    checked={formData.checkboxes.consequences}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        checkboxes: { ...prev.checkboxes, consequences: !!checked },
                      }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="consequences" className="text-sm">
                      Community Protection Notice *
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I understand I am responsible for the content of my case and potential legal consequences of false
                      or defamatory statements.
                    </p>
                    {errors["checkbox.consequences"] && (
                      <p className="text-red-500 text-xs mt-1">{errors["checkbox.consequences"]}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="protection"
                    checked={formData.checkboxes.protection}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        checkboxes: { ...prev.checkboxes, protection: !!checked },
                      }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="protection" className="text-sm">
                      Platform Disclaimers *
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      My intent is to share a genuine experience for community accountability, not for revenge or
                      malicious purposes.
                    </p>
                    {errors["checkbox.protection"] && (
                      <p className="text-red-500 text-xs mt-1">{errors["checkbox.protection"]}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="disclaimers"
                    checked={formData.checkboxes.disclaimers}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        checkboxes: { ...prev.checkboxes, disclaimers: !!checked },
                      }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="disclaimers" className="text-sm">
                      Defendant Legal Action Acknowledgment *
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I understand DNounce is a platform for sharing experiences and community accountability. The
                      defendant can respond, submit evidence, and request deletion through community voting.
                    </p>
                    {errors["checkbox.disclaimers"] && (
                      <p className="text-red-500 text-xs mt-1">{errors["checkbox.disclaimers"]}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acknowledgment"
                    checked={formData.checkboxes.acknowledgment}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        checkboxes: { ...prev.checkboxes, acknowledgment: !!checked },
                      }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="acknowledgment" className="text-sm">
                      Personal Responsibility *
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I accept full responsibility for my case. The defendant may take legal action, and DNounce cannot
                      defend me.
                    </p>
                    {errors["checkbox.acknowledgment"] && (
                      <p className="text-red-500 text-xs mt-1">{errors["checkbox.acknowledgment"]}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="evidence"
                    checked={formData.checkboxes.evidence}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        checkboxes: { ...prev.checkboxes, evidence: !!checked },
                      }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="evidence" className="text-sm">
                      Review Classification *
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      I understand DNounce will classify my case as Evidence-Based or Experience-Based after
                      verification checks.
                    </p>
                    {errors["checkbox.evidence"] && (
                      <p className="text-red-500 text-xs mt-1">{errors["checkbox.evidence"]}</p>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={!formData.masterAcknowledgment || Object.values(formData.checkboxes).some((v) => !v)}
                data-cta-id="submit_case_form"
                data-section="case_form"
              >
                Submit Case
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
