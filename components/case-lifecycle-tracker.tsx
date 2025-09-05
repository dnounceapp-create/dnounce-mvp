"use client"

import { useState, useEffect } from "react"
import { LIFECYCLE_CONFIGS, formatTimeLeft, getCaseLifecycle, type CaseLifecycle } from "@/lib/case-lifecycle"
import { Clock, CheckCircle } from "lucide-react"

interface CaseLifecycleTrackerProps {
  caseData: any
  variant?: "full" | "compact"
}

export default function CaseLifecycleTracker({ caseData, variant = "full" }: CaseLifecycleTrackerProps) {
  const [lifecycle, setLifecycle] = useState<CaseLifecycle | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    const caseLifecycle = getCaseLifecycle(caseData)
    setLifecycle(caseLifecycle)

    // Set up timer for countdown
    const updateTimer = () => {
      if (caseLifecycle.stageEndsAt) {
        const formatted = formatTimeLeft(caseLifecycle.stageEndsAt)
        setTimeLeft(formatted)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [caseData])

  if (!lifecycle) return null

  const config = LIFECYCLE_CONFIGS[lifecycle.stage]
  const stages = [
    "AI_VERIFICATION",
    "PARTIES_NOTIFIED",
    "PUBLISHED",
    "EVIDENCE_ARGUMENTS",
    "COOLING",
    "VOTING",
    "VERDICT_KEPT",
  ]

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            {config.hasDeadline && lifecycle.stageEndsAt && <Clock className="h-3 w-3 text-gray-500" />}
            <span className="font-medium text-gray-900">{config.trackerLabel}</span>
          </div>
        </div>
        <div className="text-xs text-gray-600">
          {config.statusText(config.hasDeadline && lifecycle.stageEndsAt ? timeLeft : undefined)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const isActive = stage === lifecycle.stage
          const isPast = stages.indexOf(lifecycle.stage) > index
          const isVerdict = lifecycle.stage === "VERDICT_KEPT" || lifecycle.stage === "VERDICT_DELETED"

          return (
            <div key={stage} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium
                ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isPast || (isVerdict && stage === "VERDICT_KEPT")
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                }
              `}
              >
                {isPast || (isVerdict && stage === "VERDICT_KEPT") ? <CheckCircle className="h-4 w-4" /> : index + 1}
              </div>
              {index < stages.length - 1 && (
                <div
                  className={`
                  w-8 h-0.5 mx-1
                  ${isPast || (isVerdict && index < stages.indexOf("VERDICT_KEPT")) ? "bg-green-600" : "bg-gray-200"}
                `}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Stage Labels */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        {stages.map((stage) => (
          <div key={stage} className="text-center max-w-16">
            {LIFECYCLE_CONFIGS[stage].trackerLabel}
          </div>
        ))}
      </div>

      {/* Status Line */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-sm font-medium text-gray-900">
          {config.statusText(config.hasDeadline && lifecycle.stageEndsAt ? timeLeft : undefined)}
        </div>
        {config.hasDeadline && lifecycle.stageEndsAt && (
          <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updates every minute
          </div>
        )}
      </div>
    </div>
  )
}
