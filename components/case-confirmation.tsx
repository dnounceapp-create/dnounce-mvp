"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, FileText } from "lucide-react"
import PostCaseSurvey from "@/components/post-case-survey"
import { analytics } from "@/lib/analytics"

interface CaseConfirmationProps {
  caseId: string
  hasEvidence: boolean
}

export function CaseConfirmation({ caseId, hasEvidence }: CaseConfirmationProps) {
  const [showSurvey, setShowSurvey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [surveyAutoShown, setSurveyAutoShown] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSurvey(true)
      setSurveyAutoShown(true)
      analytics.trackSurveyShown(caseId)
    }, 2000)

    return () => clearTimeout(timer)
  }, [caseId])

  const handleSurveySubmit = (surveyData: any) => {
    console.log("[v0] Survey submitted:", surveyData)
    analytics.trackSurveySubmitted(surveyData)

    if (surveyData.wantNotifications && surveyData.email) {
      analytics.trackPrelaunchOptIn(surveyData.email, "post_submit_modal", surveyData.caseId)
    }

    setShowSurvey(false)
    window.location.hash = `#/mvp/survey/thankyou?caseId=${caseId}`
  }

  const handleSurveyClose = () => {
    setShowSurvey(false)
  }

  const handleOpenSurvey = () => {
    console.log("[v0] Submit Survey button clicked!")
    console.log("[v0] Current state - surveyAutoShown:", surveyAutoShown, "showSurvey:", showSurvey)
    console.log("[v0] Button should be visible:", surveyAutoShown && !showSurvey)
    console.log("[v0] About to set showSurvey to true...")
    setShowSurvey(true)
    console.log("[v0] Survey modal should now be open, showSurvey set to:", true)
    analytics.trackSurveyShown(caseId)
  }

  const handleCopyLink = async () => {
    const caseLink = `${window.location.origin}/#/case/${caseId}`
    try {
      await navigator.clipboard.writeText(caseLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-green-600 mb-4">Case Submitted Successfully</h2>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Your Case ID:</p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-xl font-mono font-bold text-blue-600">{caseId}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="h-8 w-8 p-0"
                  data-cta-id="copy_case_link"
                  data-section="case_success"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {window.location.origin}/#/case/{caseId}
              </p>
              {copied && <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>}
            </div>

            <p className="text-gray-600">
              {hasEvidence
                ? "This case includes supporting evidence and will be verified."
                : "This case is based on your personal experience."}
            </p>
            <p className="text-gray-600">
              We'll run verification checks (simulated). You and the defendant will be notified when the case is
              published and enters the Evidence & Arguments phase.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => (window.location.hash = `#/case/${caseId}`)}
                data-cta-id="view_my_case"
                data-section="case_success"
              >
                View My Case
              </Button>
              <Button variant="outline" disabled data-cta-id="view_defendant_profile" data-section="case_success">
                View Defendant's Profile (Coming Soon)
              </Button>
            </div>

            {surveyAutoShown && !showSurvey && (
              <Button
                onClick={handleOpenSurvey}
                variant="outline"
                className="w-full sm:w-auto bg-transparent"
                data-cta-id="submit_survey_manual"
                data-section="case_success"
              >
                <FileText className="w-4 h-4 mr-2" />
                Submit Survey
              </Button>
            )}

            <Button
              onClick={() => (window.location.hash = "#home")}
              variant="outline"
              data-cta-id="back_to_home"
              data-section="case_success"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>

      {console.log("[v0] PostCaseSurvey isOpen:", showSurvey)}
      <PostCaseSurvey isOpen={showSurvey} onClose={handleSurveyClose} onSubmit={handleSurveySubmit} caseId={caseId} />
    </>
  )
}
