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

interface CasesAgainstMeProps {
  cases: Case[]
  userEmail?: string
}

export function CasesAgainstMe({ cases, userEmail }: CasesAgainstMeProps) {
  // Filter cases where current user is the defendant
  // For demo purposes, we'll show all cases since we don't have auth yet
  const defendantCases = cases.filter(
    (caseItem) =>
      // In a real app, this would check if the logged-in user matches the defendant
      // For now, showing all cases as demo data
      true,
  )

  const handleViewCase = (caseId: string) => {
    window.location.hash = `#/case/${caseId}`
  }

  const handleRequestDeletion = (caseId: string) => {
    // TODO: Implement request deletion functionality
    alert(`Request deletion for case ${caseId} - Coming Soon`)
  }

  const handleSubmitEvidence = (caseId: string) => {
    // TODO: Implement submit evidence functionality
    alert(`Submit evidence for case ${caseId} - Coming Soon`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Cases Against Me</h1>
        <p className="text-gray-600">
          View all cases where you are named as a defendant. You can respond, submit evidence, and request deletion
          through community voting.
        </p>
      </div>

      {/* Defendant Rights Section */}
      <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Your Rights as a Defendant</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-blue-800 mb-2">During Evidence & Arguments Phase:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Submit counter-evidence</li>
              <li>• Provide your side of the story</li>
              <li>• Participate in community discussion</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-2">Community Protection:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Request case deletion through voting</li>
              <li>• Cases voted "Delete" are hidden from your profile</li>
              <li>• Community decides fairness, not the platform</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Cases List */}
      {defendantCases.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Cases Found</h3>
          <p className="text-gray-600">There are currently no cases where you are named as a defendant.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {defendantCases.map((caseItem) => (
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
                      Relationship: <strong>{caseItem.relationship}</strong>
                    </span>
                    <span>
                      Submitted: <strong>{new Date(caseItem.meta.createdAt).toLocaleDateString()}</strong>
                    </span>
                  </div>

                  {/* Status Tracker */}
                  <div className="mb-4">
                    <StatusTracker currentStage={caseItem.status.stage} deadline={caseItem.status.deadlineUtc} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <Button onClick={() => handleViewCase(caseItem.caseId)} className="w-full">
                    View Full Case
                  </Button>

                  {caseItem.status.stage === "Evidence & Arguments" && (
                    <Button variant="outline" onClick={() => handleSubmitEvidence(caseItem.caseId)} className="w-full">
                      Submit Evidence
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleRequestDeletion(caseItem.caseId)}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Request Deletion
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
