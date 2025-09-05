"use client"

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

interface CasesSubmittedProps {
  cases: Case[]
  userEmail?: string
}

export function CasesSubmitted({ cases, userEmail }: CasesSubmittedProps) {
  // Filter cases where current user is the plaintiff
  // For demo purposes, we'll show all cases since we don't have auth yet
  const plaintiffCases = cases.filter(
    (caseItem) =>
      // In a real app, this would check if the logged-in user matches the plaintiff
      // For now, showing all cases as demo data
      true,
  )

  const handleViewCase = (caseId: string) => {
    window.location.hash = `#/case/${caseId}`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Cases I Submitted</h1>
        <p className="text-gray-600">
          View all cases you have submitted. You can track their progress but cannot edit them after submission to
          ensure authenticity.
        </p>
      </div>

      {/* Info Section */}
      <Card className="p-6 mb-8 bg-green-50 border-green-200">
        <h2 className="text-xl font-semibold text-green-900 mb-4">Case Lifecycle</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium text-green-800 mb-2">AI Verification (Simulated):</h3>
            <p className="text-sm text-green-700">
              System checks authenticity and classifies as Evidence-Based or Experience-Based
            </p>
          </div>
          <div>
            <h3 className="font-medium text-green-800 mb-2">Publication:</h3>
            <p className="text-sm text-green-700">Case becomes public and enters Evidence & Arguments phase</p>
          </div>
          <div>
            <h3 className="font-medium text-green-800 mb-2">Community Voting:</h3>
            <p className="text-sm text-green-700">Community votes Keep/Delete, verdict is applied</p>
          </div>
        </div>
      </Card>

      {/* Cases List */}
      {plaintiffCases.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Cases Submitted</h3>
          <p className="text-gray-600 mb-4">You haven't submitted any cases yet.</p>
          <Button onClick={() => (window.location.hash = "#/submit")}>Submit Your First Case</Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {plaintiffCases.map((caseItem) => (
            <Card key={caseItem.caseId} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Case Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{caseItem.meta.title}</h3>
                    <Badge variant={caseItem.type === "evidence" ? "default" : "secondary"}>
                      {caseItem.type === "evidence" ? "Evidence-Based" : "Experience-Based"}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-3">{caseItem.meta.summaryOneLine}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span>
                      Case ID: <strong>{caseItem.caseId}</strong>
                    </span>
                    <span>
                      Defendant:{" "}
                      <strong>
                        {caseItem.defendant.firstName} {caseItem.defendant.lastName}
                      </strong>
                    </span>
                    <span>
                      Submitted: <strong>{new Date(caseItem.meta.createdAt).toLocaleDateString()}</strong>
                    </span>
                  </div>

                  {/* Status Tracker */}
                  <div className="mb-4">
                    <StatusTracker currentStage={caseItem.status.stage} deadline={caseItem.status.deadlineUtc} />
                  </div>

                  {/* Evidence Count */}
                  {caseItem.evidence.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>{caseItem.evidence.length}</strong> piece(s) of evidence submitted
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <Button onClick={() => handleViewCase(caseItem.caseId)} className="w-full">
                    View Case Details
                  </Button>

                  <Button variant="outline" disabled className="w-full bg-transparent">
                    Cannot Edit (Authenticity)
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
