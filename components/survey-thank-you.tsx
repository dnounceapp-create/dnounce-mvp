"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Heart, Copy, ExternalLink, FileText } from "lucide-react"
import { useState } from "react"

export default function SurveyThankYou() {
  const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "")
  const caseId = urlParams.get("caseId")
  const [copiedCaseId, setCopiedCaseId] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const caseLink = caseId ? `${window.location.origin}/#/case/${caseId}` : ""

  const copyToClipboard = async (text: string, type: "caseId" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "caseId") {
        setCopiedCaseId(true)
        setTimeout(() => setCopiedCaseId(false), 2000)
      } else {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleRetakeSurvey = () => {
    if (caseId) {
      // Navigate back to case confirmation page where the Submit Survey button is available
      window.location.hash = `#/case-confirmation/${caseId}/experience`
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-semibold text-green-600">Thank You for Your Feedback!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {caseId && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-medium text-gray-900 mb-3">Your Case Details</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                  <div className="text-left">
                    <div className="text-sm text-gray-500">Case ID</div>
                    <div className="font-mono text-sm">{caseId}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(caseId, "caseId")}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedCaseId ? "Copied!" : ""}
                  </Button>
                </div>

                <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                  <div className="text-left flex-1">
                    <div className="text-sm text-gray-500">Case Link</div>
                    <div className="font-mono text-xs text-gray-700 break-all">{caseLink}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(caseLink, "link")}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copiedLink ? "Copied!" : ""}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Your input helps us build a better DNounce</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Mail className="h-5 w-5 text-blue-500" />
              <span>We'll keep you updated on our progress</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
            <p className="text-sm text-blue-800">
              We're working hard to improve the platform based on feedback like yours. You'll be among the first to know
              when we launch new features and improvements.
            </p>
          </div>

          <div className="space-y-3">
            {caseId && (
              <Button
                onClick={() => (window.location.hash = `#/case/${caseId}`)}
                className="w-full"
                data-cta-id="survey-thankyou-view-case"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View My Case
              </Button>
            )}

            {caseId && (
              <Button
                onClick={handleRetakeSurvey}
                variant="outline"
                className="w-full bg-transparent"
                data-cta-id="retake-survey"
              >
                <FileText className="h-4 w-4 mr-2" />
                Retake Survey
              </Button>
            )}

            <Button
              onClick={() => (window.location.hash = "#/")}
              className={caseId ? "w-full" : "w-full"}
              variant={caseId ? "outline" : "default"}
            >
              Back to Home
            </Button>

            <Button variant="outline" onClick={() => (window.location.hash = "#/explore")} className="w-full">
              Explore More Cases
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
