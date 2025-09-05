"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusTracker } from "@/components/status-tracker"

interface Case {
  caseId: string
  type: "evidence" | "opinion"
  relationship: string
  plaintiff: {
    firstName: string
    lastName?: string
    alias?: string
  }
  defendant: {
    firstName: string
    lastName?: string
    email?: string
    phone?: string
    city: string
    state: string
  }
  meta: {
    title: string
    summaryOneLine: string
    createdAt: string
    publishedAt: string
  }
  status: {
    stage: string
    label: string
    deadlineUtc?: string | null
  }
  displayNameLine: string
  evidence: Array<{
    id: string
    filename: string
    authenticity: "Authentic" | "Non-Authentic Evidence"
  }>
  flags: {
    followed: boolean
    pinned: boolean
  }
}

interface DefendantViewerProps {
  case: Case | undefined
  caseId: string
}

export function DefendantViewer({ case: caseData, caseId }: DefendantViewerProps) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    if (!caseData?.status.deadlineUtc) return

    const updateTimer = () => {
      const deadline = new Date(caseData.status.deadlineUtc!)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Expired")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [caseData?.status.deadlineUtc])

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Not Found</h2>
          <p className="text-gray-600 mb-4">Case ID "{caseId}" was not found in our system.</p>
          <Button onClick={() => (window.location.hash = "#/")}>Back to Home</Button>
        </Card>
      </div>
    )
  }

  const getDisplayName = () => {
    if (caseData.type === "evidence") {
      return `Somebody who labeled you as ${caseData.relationship} vs ${caseData.defendant.firstName}${caseData.defendant.lastName ? " " + caseData.defendant.lastName : ""}${caseData.defendant.alias ? ' alias "' + caseData.defendant.alias + '"' : ""}`
    } else {
      return `${caseData.plaintiff.firstName}${caseData.plaintiff.lastName ? " " + caseData.plaintiff.lastName : ""} who labeled you as ${caseData.relationship} vs ${caseData.defendant.firstName}${caseData.defendant.lastName ? " " + caseData.defendant.lastName : ""}${caseData.defendant.alias ? ' alias "' + caseData.defendant.alias + '"' : ""}`
    }
  }

  const handleRequestDeletion = () => {
    // Show toast - feature coming soon
    alert("Feature coming soon")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Case ID: {caseData.caseId}</h1>
          <p className="text-lg text-gray-700 mb-2">{getDisplayName()}</p>
          <p className="text-gray-600">{caseData.meta.summaryOneLine}</p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <Badge variant="secondary">{caseData.status.label}</Badge>
          {caseData.status.deadlineUtc && timeLeft && <span className="text-sm text-gray-600">Ends in {timeLeft}</span>}
        </div>

        <StatusTracker currentStage={caseData.status.stage} hasDeadline={!!caseData.status.deadlineUtc} />
      </Card>

      {/* Your Rights & Actions */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights & Actions</h2>
        <div className="space-y-3 text-gray-700">
          <p>• View the case details</p>
          <p>• You can submit your evidence/statement when the process opens for you</p>
          <div className="flex items-center gap-2">
            <span>• You can</span>
            <Button variant="outline" size="sm" onClick={handleRequestDeletion}>
              Request Deletion
            </Button>
            <span>(available when the process is in the appropriate stage)</span>
          </div>
        </div>
      </Card>

      {/* Evidence */}
      {caseData.evidence.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Evidence</h2>
          <div className="space-y-3">
            {caseData.evidence.map((evidence) => (
              <div key={evidence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{evidence.filename}</span>
                <Badge variant={evidence.authenticity === "Authentic" ? "default" : "destructive"}>
                  {evidence.authenticity}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transparency Note */}
      <div className="text-sm text-gray-500 text-center border-t pt-6">
        <p>If you're unsure about this message's legitimacy, go to dnounce.com and search your Case ID to verify.</p>
      </div>
    </div>
  )
}
