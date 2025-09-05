"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import { recordWaitlistSignup, recordSurveyResponse } from "@/lib/data-storage"

interface PostCaseSurveyProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (surveyData: any) => void
  caseId: string
}

export default function PostCaseSurvey({ isOpen, onClose, onSubmit, caseId }: PostCaseSurveyProps) {
  const [formData, setFormData] = useState({
    // Section A - Required Quick Feedback
    easeOfUse: "",
    understoodPurpose: "",
    futureUse: "",

    // Section B - Optional Open Questions
    likedMost: "",
    wouldImprove: "",

    // Section C - Pre-Launch Sign-Up
    wantNotifications: true,
    email: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  console.log("[v0] PostCaseSurvey render - isOpen:", isOpen, "caseId:", caseId)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required questions
    if (!formData.easeOfUse) {
      newErrors.easeOfUse = "Please answer this question"
    }
    if (!formData.understoodPurpose) {
      newErrors.understoodPurpose = "Please answer this question"
    }
    if (!formData.futureUse) {
      newErrors.futureUse = "Please answer this question"
    }

    // Email validation if staying for notifications
    if (formData.wantNotifications) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email format"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const surveyData = {
        caseId,
        ...formData,
        submittedAt: new Date().toISOString(),
      }

      if (formData.wantNotifications && formData.email) {
        await recordSurveyResponse({
          email: formData.email,
          caseId,
          easeOfUse: formData.easeOfUse as "Yes" | "Somewhat" | "No",
          understoodPurpose: formData.understoodPurpose as "Yes" | "Somewhat" | "No",
          futureUse: formData.futureUse as "Very Likely" | "Maybe" | "No",
          likedMost: formData.likedMost,
          wouldImprove: formData.wouldImprove,
        })

        // Store waitlist signup
        await recordWaitlistSignup(formData.email, "post_submit_modal", caseId, {
          utm_source: new URLSearchParams(window.location.search).get("utm_source") || undefined,
          utm_medium: new URLSearchParams(window.location.search).get("utm_medium") || undefined,
          utm_campaign: new URLSearchParams(window.location.search).get("utm_campaign") || undefined,
        })
      }

      window.location.hash = `#/mvp/survey/thankyou?caseId=${caseId}`
      onSubmit(surveyData)
    } catch (error) {
      console.error("[v0] Error submitting survey:", error)
      window.location.hash = `#/mvp/survey/thankyou?caseId=${caseId}`
      onSubmit({
        caseId,
        ...formData,
        submittedAt: new Date().toISOString(),
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) {
    console.log("[v0] Survey modal not rendering - isOpen is false")
    return null
  }

  console.log("[v0] Survey modal rendering - isOpen is true")
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
          <CardTitle className="text-xl font-semibold">Help Us Improve DNounce</CardTitle>
          <p className="text-gray-600 text-sm">
            Your feedback helps us build a better platform. This should take about 1-2 minutes.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section A - Required Quick Feedback */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Quick Feedback</h3>

              <div>
                <Label className="text-sm font-medium">Was the platform easy to use? *</Label>
                <div className="flex gap-4 mt-2">
                  {["Yes", "Somewhat", "No"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="easeOfUse"
                        value={option}
                        checked={formData.easeOfUse === option}
                        onChange={(e) => setFormData((prev) => ({ ...prev, easeOfUse: e.target.value }))}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.easeOfUse && <p className="text-red-500 text-xs mt-1">{errors.easeOfUse}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium">Did you understand the purpose of DNounce? *</Label>
                <div className="flex gap-4 mt-2">
                  {["Yes", "Somewhat", "No"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="understoodPurpose"
                        value={option}
                        checked={formData.understoodPurpose === option}
                        onChange={(e) => setFormData((prev) => ({ ...prev, understoodPurpose: e.target.value }))}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.understoodPurpose && <p className="text-red-500 text-xs mt-1">{errors.understoodPurpose}</p>}
              </div>

              <div>
                <Label className="text-sm font-medium">How likely are you to use DNounce in the future? *</Label>
                <div className="flex gap-4 mt-2">
                  {["Very Likely", "Maybe", "No"].map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="futureUse"
                        value={option}
                        checked={formData.futureUse === option}
                        onChange={(e) => setFormData((prev) => ({ ...prev, futureUse: e.target.value }))}
                        className="text-blue-600"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.futureUse && <p className="text-red-500 text-xs mt-1">{errors.futureUse}</p>}
              </div>
            </div>

            {/* Section B - Optional Open Questions */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">Tell Us More (Optional)</h3>

              <div>
                <Label htmlFor="likedMost" className="text-sm font-medium">
                  What's the one thing you liked the most?
                </Label>
                <Textarea
                  id="likedMost"
                  value={formData.likedMost}
                  onChange={(e) => setFormData((prev) => ({ ...prev, likedMost: e.target.value }))}
                  placeholder="Share what you enjoyed about the experience..."
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="wouldImprove" className="text-sm font-medium">
                  What's one thing that confused you or you'd improve?
                </Label>
                <Textarea
                  id="wouldImprove"
                  value={formData.wouldImprove}
                  onChange={(e) => setFormData((prev) => ({ ...prev, wouldImprove: e.target.value }))}
                  placeholder="Help us understand what could be better..."
                  rows={2}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Section C - Pre-Launch Sign-Up */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-gray-900">Stay Updated</h3>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="notifications"
                  checked={formData.wantNotifications}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, wantNotifications: !!checked }))}
                />
                <div className="flex-1">
                  <Label htmlFor="notifications" className="text-sm font-medium">
                    I want to be notified when DNounce fully launches
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">Get early access and updates about new features</p>
                </div>
              </div>

              {formData.wantNotifications && (
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Enter your email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    className={`mt-1 ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={submitting}
              >
                Skip Survey
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting || (formData.wantNotifications && !formData.email.trim())}
              >
                {submitting ? "Submitting..." : "Submit Survey"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
