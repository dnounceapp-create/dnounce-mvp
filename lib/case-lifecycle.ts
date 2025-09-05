export interface CaseLifecycle {
  stage: LifecycleStage
  stageStartedAt: string
  stageEndsAt?: string
  scheduledPublicationAt?: string
  isDemoRandomized: boolean
  showDeletedInExploreDemo: boolean
}

export type LifecycleStage =
  | "AI_VERIFICATION"
  | "PARTIES_NOTIFIED"
  | "PUBLISHED"
  | "EVIDENCE_ARGUMENTS"
  | "COOLING"
  | "VOTING"
  | "VERDICT_KEPT"
  | "VERDICT_DELETED"

export interface LifecycleConfig {
  stage: LifecycleStage
  trackerLabel: string
  statusText: (timeLeft?: string) => string
  duration?: number // hours
  hasDeadline: boolean
  commentsEnabled: boolean
  commentsReadOnly: boolean
  reactionsEnabled: boolean
  followPinEnabled: boolean
  showInDefendantProfile: boolean
}

export const LIFECYCLE_CONFIGS: Record<LifecycleStage, LifecycleConfig> = {
  AI_VERIFICATION: {
    stage: "AI_VERIFICATION",
    trackerLabel: "AI Verification",
    statusText: (timeLeft) => `Status: AI Verification — ${timeLeft || "processing"} left for case to be published`,
    duration: 72,
    hasDeadline: true,
    commentsEnabled: false,
    commentsReadOnly: false,
    reactionsEnabled: true,
    followPinEnabled: true,
    showInDefendantProfile: false,
  },
  PARTIES_NOTIFIED: {
    stage: "PARTIES_NOTIFIED",
    trackerLabel: "Parties Notified",
    statusText: (timeLeft) =>
      `Status: Plaintiff & Defendant Notified — case scheduled for publication — ${timeLeft || "soon"} left`,
    duration: 24,
    hasDeadline: true,
    commentsEnabled: false,
    commentsReadOnly: false,
    reactionsEnabled: true,
    followPinEnabled: true,
    showInDefendantProfile: false,
  },
  PUBLISHED: {
    stage: "PUBLISHED",
    trackerLabel: "Published",
    statusText: () => "Status: Published",
    hasDeadline: false,
    commentsEnabled: true,
    commentsReadOnly: false,
    reactionsEnabled: true,
    followPinEnabled: true,
    showInDefendantProfile: true,
  },
  EVIDENCE_ARGUMENTS: {
    stage: "EVIDENCE_ARGUMENTS",
    trackerLabel: "Evidence & Arguments",
    statusText: (timeLeft) =>
      `Status: Evidence & Arguments — ${timeLeft || "time remaining"} left before Cooling Period`,
    duration: 72,
    hasDeadline: true,
    commentsEnabled: true,
    commentsReadOnly: false,
    reactionsEnabled: true,
    followPinEnabled: true,
    showInDefendantProfile: true,
  },
  COOLING: {
    stage: "COOLING",
    trackerLabel: "Cooling Period",
    statusText: (timeLeft) => `Status: Cooling Period — ${timeLeft || "time remaining"} left before Community Voting`,
    duration: 24,
    hasDeadline: true,
    commentsEnabled: false,
    commentsReadOnly: true,
    reactionsEnabled: true,
    followPinEnabled: true,
    showInDefendantProfile: true,
  },
  VOTING: {
    stage: "VOTING",
    trackerLabel: "Community Voting",
    statusText: (timeLeft) => `Status: Voting in Progress — ${timeLeft || "time remaining"} left`,
    duration: 72,
    hasDeadline: true,
    commentsEnabled: false,
    commentsReadOnly: true,
    reactionsEnabled: true,
    followPinEnabled: true,
    showInDefendantProfile: true,
  },
  VERDICT_KEPT: {
    stage: "VERDICT_KEPT",
    trackerLabel: "Case Kept",
    statusText: () => "Status: Case Kept",
    hasDeadline: false,
    commentsEnabled: true,
    commentsReadOnly: false,
    reactionsEnabled: true,
    followPinEnabled: true,
    showInDefendantProfile: true,
  },
  VERDICT_DELETED: {
    stage: "VERDICT_DELETED",
    trackerLabel: "Case Deleted",
    statusText: () => "Status: Case Deleted",
    hasDeadline: false,
    commentsEnabled: false,
    commentsReadOnly: true,
    reactionsEnabled: false,
    followPinEnabled: false,
    showInDefendantProfile: false,
  },
}

// Simple hash function for deterministic randomization
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

export function computeDemoLifecycle(caseId: string): CaseLifecycle {
  const hash = simpleHash(caseId)
  const random = hash / 2147483647 // Normalize to 0-1

  // Weighted stage selection
  const stages: { stage: LifecycleStage; weight: number }[] = [
    { stage: "AI_VERIFICATION", weight: 0.1 },
    { stage: "PARTIES_NOTIFIED", weight: 0.1 },
    { stage: "PUBLISHED", weight: 0.2 },
    { stage: "EVIDENCE_ARGUMENTS", weight: 0.2 },
    { stage: "COOLING", weight: 0.1 },
    { stage: "VOTING", weight: 0.15 },
    { stage: "VERDICT_KEPT", weight: 0.1 },
    { stage: "VERDICT_DELETED", weight: 0.05 },
  ]

  let cumulative = 0
  let selectedStage: LifecycleStage = "PUBLISHED"

  for (const { stage, weight } of stages) {
    cumulative += weight
    if (random <= cumulative) {
      selectedStage = stage
      break
    }
  }

  const config = LIFECYCLE_CONFIGS[selectedStage]
  const now = new Date()

  let stageStartedAt: Date
  let stageEndsAt: Date | undefined
  let scheduledPublicationAt: Date | undefined

  if (config.hasDeadline && config.duration) {
    // Generate plausible times - case is 10-80% through the stage
    const progressPercent = 0.1 + (hash % 70) / 100 // 10-80%
    const stageLength = config.duration * 60 * 60 * 1000 // Convert hours to ms
    const elapsed = stageLength * progressPercent

    stageStartedAt = new Date(now.getTime() - elapsed)
    stageEndsAt = new Date(stageStartedAt.getTime() + stageLength)

    // For early stages, set publication time
    if (selectedStage === "AI_VERIFICATION" || selectedStage === "PARTIES_NOTIFIED") {
      scheduledPublicationAt = stageEndsAt
    }
  } else {
    // No deadline stages
    stageStartedAt = new Date(now.getTime() - (hash % (7 * 24 * 60 * 60 * 1000))) // Random time in last week
  }

  return {
    stage: selectedStage,
    stageStartedAt: stageStartedAt.toISOString(),
    stageEndsAt: stageEndsAt?.toISOString(),
    scheduledPublicationAt: scheduledPublicationAt?.toISOString(),
    isDemoRandomized: true,
    showDeletedInExploreDemo: selectedStage === "VERDICT_DELETED" ? hash % 10 < 3 : false, // 30% chance to show deleted in explore
  }
}

export function formatTimeLeft(endTime: string): string {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return "Time expired"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function getCaseLifecycle(caseData: any): CaseLifecycle {
  // Check if case has lifecycle data
  if (caseData.lifecycleStage) {
    return {
      stage: caseData.lifecycleStage,
      stageStartedAt: caseData.stageStartedAt,
      stageEndsAt: caseData.stageEndsAt,
      scheduledPublicationAt: caseData.scheduledPublicationAt,
      isDemoRandomized: caseData.isDemoRandomized || false,
      showDeletedInExploreDemo: caseData.showDeletedInExploreDemo || false,
    }
  }

  // For user-submitted cases (no lifecycle data), default to PUBLISHED
  if (!caseData.isDemoRandomized) {
    return {
      stage: "PUBLISHED",
      stageStartedAt: caseData.createdAt || new Date().toISOString(),
      isDemoRandomized: false,
      showDeletedInExploreDemo: false,
    }
  }

  // For demo cases, compute randomized lifecycle
  return computeDemoLifecycle(caseData.caseId)
}
