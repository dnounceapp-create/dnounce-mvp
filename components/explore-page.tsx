"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Filter, Heart, Bookmark, MoreHorizontal, Camera, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { analytics } from "@/lib/analytics"
import CaseLifecycleTracker from "@/components/case-lifecycle-tracker"
import { getCaseLifecycle, LIFECYCLE_CONFIGS } from "@/lib/case-lifecycle"

interface Case {
  caseId?: string
  case_id?: string
  type: "evidence" | "experience"
  relationship: string
  plaintiff: {
    firstName: string
    lastName?: string
    alias?: string
  }
  plaintiff_first_name?: string
  plaintiff_last_name?: string
  defendant: {
    firstName: string
    lastName?: string
    city: string
    state: string
  }
  defendant_first_name?: string
  defendant_last_name?: string
  defendant_city?: string
  defendant_state?: string
  meta?: {
    title: string
    summaryOneLine: string
    createdAt: string
    publishedAt: string
  }
  case_title?: string
  case_summary?: string
  submitted_at?: string
  status?: {
    stage: string
    label: string
  }
  displayNameLine?: string
  evidence?: Array<{
    id: string
    filename: string
    authenticity: string
  }>
  files_count?: number
  flags?: {
    followed: boolean
    pinned: boolean
  }
  lifecycleStage?: string
  stageStartedAt?: string
  stageEndsAt?: string
  scheduledPublicationAt?: string
  isDemoRandomized?: boolean
  showDeletedInExploreDemo?: boolean
}

interface ExplorePageProps {
  cases: Case[]
}

export function ExplorePage({ cases }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "informative">("recent")
  const [showFilters, setShowFilters] = useState(false)
  const [hasMediaFilter, setHasMediaFilter] = useState(false)
  const [relationshipFilter, setRelationshipFilter] = useState("")
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set())
  const [interactions, setInteractions] = useState<
    Record<
      string,
      {
        informative?: boolean
        followed?: boolean
        pinned?: boolean
      }
    >
  >({})

  useEffect(() => {
    const saved = localStorage.getItem("dnounce_interactions")
    if (saved) {
      try {
        setInteractions(JSON.parse(saved))
      } catch (e) {
        console.warn("[v0] Failed to load interactions from localStorage")
      }
    }
  }, [])

  const updateInteraction = (
    caseId: string,
    type: "informative" | "not_useful" | "follow" | "pin",
    value?: boolean,
  ) => {
    setInteractions((prev) => {
      const updated = {
        ...prev,
        [caseId]: {
          ...prev[caseId],
          ...(type === "informative" ? { informative: true } : {}),
          ...(type === "not_useful" ? { informative: false } : {}),
          ...(type === "follow" ? { followed: value ?? !prev[caseId]?.followed } : {}),
          ...(type === "pin" ? { pinned: value ?? !prev[caseId]?.pinned } : {}),
        },
      }
      localStorage.setItem("dnounce_interactions", JSON.stringify(updated))
      return updated
    })

    if (type === "informative") {
      analytics.trackEvent("case_mark_informative", { case_id: caseId })
    } else if (type === "not_useful") {
      analytics.trackEvent("case_mark_not_useful", { case_id: caseId })
    } else if (type === "follow") {
      analytics.trackEvent("follow_clicked", { case_id: caseId })
    } else if (type === "pin") {
      analytics.trackEvent("pin_clicked", { case_id: caseId })
    }
  }

  const filteredCases = cases.filter((case_) => {
    // Get lifecycle info to filter out deleted cases (unless demo mode allows it)
    const lifecycle = getCaseLifecycle(case_)
    const config = LIFECYCLE_CONFIGS[lifecycle.stage]

    // Filter out deleted cases unless they should be shown in explore demo
    if (lifecycle.stage === "VERDICT_DELETED" && !lifecycle.showDeletedInExploreDemo) {
      return false
    }

    // Handle both old and new data formats
    const caseId = case_.caseId || case_.case_id || ""
    const defendantFirstName = case_.defendant?.firstName || case_.defendant_first_name || ""
    const defendantLastName = case_.defendant?.lastName || case_.defendant_last_name || ""
    const plaintiffAlias = case_.plaintiff?.alias || case_.plaintiff_first_name || ""
    const defendantCity = case_.defendant?.city || case_.defendant_city || ""
    const defendantState = case_.defendant?.state || case_.defendant_state || ""

    const matchesSearch =
      !searchQuery ||
      defendantFirstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      defendantLastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plaintiffAlias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.relationship.toLowerCase().includes(searchQuery.toLowerCase()) ||
      defendantCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      defendantState.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseId.toLowerCase().includes(searchQuery.toLowerCase())

    const evidenceCount = case_.evidence?.length || case_.files_count || 0
    const matchesMedia = !hasMediaFilter || evidenceCount > 0
    const matchesRelationship = !relationshipFilter || case_.relationship === relationshipFilter

    return matchesSearch && matchesMedia && matchesRelationship
  })

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortBy === "recent") {
      const aDate = a.meta?.createdAt || a.submitted_at || new Date().toISOString()
      const bDate = b.meta?.createdAt || b.submitted_at || new Date().toISOString()
      return new Date(bDate).getTime() - new Date(aDate).getTime()
    }
    // For informative sorting, prioritize cases marked as informative
    const aCaseId = a.caseId || a.case_id || ""
    const bCaseId = b.caseId || b.case_id || ""
    const aInformative = interactions[aCaseId]?.informative ? 1 : 0
    const bInformative = interactions[bCaseId]?.informative ? 1 : 0
    return bInformative - aInformative
  })

  const relationships = [...new Set(cases.map((c) => c.relationship))]

  const toggleExpanded = (caseId: string) => {
    setExpandedCases((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(caseId)) {
        newSet.delete(caseId)
      } else {
        newSet.add(caseId)
        analytics.trackEvent("feed_case_card_view", { case_id: caseId })
      }
      return newSet
    })
  }

  const handleCaseClick = (caseId: string) => {
    analytics.trackEvent("feed_case_card_opened", { case_id: caseId })
    window.location.hash = `#/case/${caseId}`
  }

  const handleDefendantClick = (defendantName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    analytics.trackEvent("defendant_profile_clicked", { defendant_name: defendantName })
    window.location.hash = `#/defendant/${encodeURIComponent(defendantName)}`
  }

  return (
    <div className="max-w-screen-md mx-auto px-4 sm:px-6">
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-100 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
          <p className="text-gray-600 text-balance">
            Help others by sharing your experiences with individuals and organizations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
          {/* Primary action - Submit a Case */}
          <Button
            onClick={() => {
              analytics.trackEvent("submit_case_clicked", { source: "explore_page" })
              window.location.hash = "#/submit"
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
          >
            <span className="text-xl">📝</span>
            Submit a Case
          </Button>

          {/* Secondary actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                analytics.trackEvent("got_notified_clicked", { source: "explore_page" })
                window.location.hash = "#/submit"
              }}
              className="h-12 font-medium border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center gap-2 rounded-lg"
            >
              <span className="text-lg">🔔</span>I Got Notified
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                analytics.trackEvent("search_defendants_clicked", { source: "explore_page" })
                setSearchQuery("")
                setTimeout(() => {
                  const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
                  if (searchInput) {
                    searchInput.focus()
                    searchInput.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                }, 100)
              }}
              className="h-12 font-medium border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 flex items-center justify-center gap-2 rounded-lg"
            >
              <span className="text-lg">🔍</span>
              Search Defendants
            </Button>
          </div>
        </div>
      </div>

      <div className="sticky top-[env(safe-area-inset-top,0)] z-30 bg-white/95 backdrop-blur border-b py-4 mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search cases, defendants, relationships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px]"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="min-h-[44px] min-w-[44px]"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              variant={sortBy === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("recent")}
              className="whitespace-nowrap min-h-[36px]"
            >
              Most Recent
            </Button>
            <Button
              variant={sortBy === "informative" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("informative")}
              className="whitespace-nowrap min-h-[36px]"
            >
              Most Informative
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-col gap-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasMedia"
                  checked={hasMediaFilter}
                  onChange={(e) => setHasMediaFilter(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="hasMedia" className="text-sm">
                  Has Media
                </label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {relationships.map((rel) => (
                  <Badge
                    key={rel}
                    variant={relationshipFilter === rel ? "default" : "outline"}
                    className="cursor-pointer min-h-[32px]"
                    onClick={() => setRelationshipFilter(relationshipFilter === rel ? "" : rel)}
                  >
                    {rel}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 pb-6">
        {sortedCases.map((case_) => {
          const caseId = case_.caseId || case_.case_id || ""
          const isExpanded = expandedCases.has(caseId)
          const interaction = interactions[caseId] || {}

          const plaintiffName = case_.plaintiff?.firstName || case_.plaintiff_first_name || "Anonymous"
          const defendantFirstName = case_.defendant?.firstName || case_.defendant_first_name || ""
          const defendantLastName = case_.defendant?.lastName || case_.defendant_last_name || ""
          const defendantFullName = `${defendantFirstName} ${defendantLastName}`.trim()
          const defendantCity = case_.defendant?.city || case_.defendant_city || ""
          const defendantState = case_.defendant?.state || case_.defendant_state || ""

          const caseTitle = case_.meta?.summaryOneLine || case_.case_summary || case_.case_title || "Case details"
          const displayNameLine = case_.displayNameLine || `${plaintiffName} vs ${defendantFullName}, ${caseTitle}`
          const createdAt = case_.meta?.createdAt || case_.submitted_at || new Date().toISOString()
          const evidenceCount = case_.evidence?.length || case_.files_count || 0

          const lifecycle = getCaseLifecycle(case_)
          const config = LIFECYCLE_CONFIGS[lifecycle.stage]
          const canComment = config.commentsEnabled && !config.commentsReadOnly

          return (
            <Card key={caseId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="cursor-pointer" onClick={() => handleCaseClick(caseId)}>
                    <h3 className="font-semibold text-lg text-balance">{displayNameLine}</h3>
                  </div>

                  <div>
                    <p className="text-gray-700 text-pretty">
                      {isExpanded ? caseTitle : caseTitle.substring(0, 120) + (caseTitle.length > 120 ? "..." : "")}
                    </p>
                    {caseTitle.length > 120 && (
                      <button
                        onClick={() => toggleExpanded(caseId)}
                        className="text-blue-600 text-sm mt-1 hover:underline"
                      >
                        {isExpanded ? "Less" : "More"}
                      </button>
                    )}
                  </div>

                  <CaseLifecycleTracker caseData={case_} variant="compact" />

                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span>{case_.relationship}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {defendantCity}, {defendantState}
                    </span>
                    <span>•</span>
                    <button
                      onClick={(e) => handleDefendantClick(defendantFullName, e)}
                      className="text-blue-600 hover:underline"
                    >
                      View {defendantFirstName}'s Profile
                    </button>
                    <span>•</span>
                    <span>{caseId}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {evidenceCount > 0 && (
                    <Badge variant="outline" className="w-fit">
                      <Camera className="w-3 h-3 mr-1" />
                      Photos & Files ({evidenceCount})
                    </Badge>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`reaction-${caseId}`}
                          checked={interaction.informative === true}
                          onChange={() => updateInteraction(caseId, "informative")}
                          className="w-4 h-4"
                        />
                        <label className="text-sm cursor-pointer">Helpful</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`reaction-${caseId}`}
                          checked={interaction.informative === false}
                          onChange={() => updateInteraction(caseId, "not_useful")}
                          className="w-4 h-4"
                        />
                        <label className="text-sm cursor-pointer">Not Helpful</label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canComment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCaseClick(caseId)}
                          className="min-h-[36px] text-sm"
                        >
                          💬 Comment
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateInteraction(caseId, "follow")}
                        className={`min-h-[36px] min-w-[36px] p-2 ${interaction.followed ? "text-blue-600" : ""}`}
                      >
                        <Heart className={`w-4 h-4 ${interaction.followed ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateInteraction(caseId, "pin")}
                        className={`min-h-[36px] min-w-[36px] p-2 ${interaction.pinned ? "text-yellow-600" : ""}`}
                      >
                        <Bookmark className={`w-4 h-4 ${interaction.pinned ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="sm" className="min-h-[36px] min-w-[36px] p-2">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {sortedCases.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">No Cases Found</h3>
            <p className="text-gray-500 mb-6">
              {cases.length === 0
                ? "Be the first to share your experience! Submit a case to help others make informed decisions."
                : "No cases match your search criteria. Try adjusting your filters or search terms."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => {
                  analytics.trackEvent("submit_case_clicked", { source: "empty_state" })
                  window.location.hash = "#/submit"
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                📝 Submit Your First Case
              </Button>
              {cases.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setHasMediaFilter(false)
                    setRelationshipFilter("")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
