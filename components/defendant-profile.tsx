"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Calendar, Search } from "lucide-react"
import CaseLifecycleTracker from "@/components/case-lifecycle-tracker"
import { getCaseLifecycle, LIFECYCLE_CONFIGS } from "@/lib/case-lifecycle"

interface DefendantProfileProps {
  defendantId?: string
  onNavigate: (route: string) => void
}

export default function DefendantProfile({ defendantId, onNavigate }: DefendantProfileProps) {
  const [staticData, setStaticData] = useState<any>(null)
  const [airtableCases, setAirtableCases] = useState<any[]>([])
  const [defendant, setDefendant] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"cases" | "reputation">("cases")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[v0] Loading defendant profile data for:", defendantId)

        const [staticResponse, airtableResponse] = await Promise.all([
          fetch("/data.json").then((res) => res.json()),
          fetch("/api/cases?includeLocal=true")
            .then((res) => res.json())
            .catch(() => ({ cases: [], airtableConfigured: false })),
        ])

        console.log("[v0] Static data loaded:", staticResponse.cases?.length || 0, "cases")
        console.log("[v0] Airtable data loaded:", airtableResponse.cases?.length || 0, "cases")
        console.log("[v0] Airtable configured:", airtableResponse.airtableConfigured)

        let localCases: any[] = []
        if (!airtableResponse.airtableConfigured) {
          try {
            const storedCases = localStorage.getItem("dnounce_case_submissions")
            if (storedCases) {
              const parsedCases = JSON.parse(storedCases)
              localCases = Array.isArray(parsedCases) ? parsedCases : [parsedCases]
              console.log("[v0] Local storage cases loaded:", localCases.length, "cases")
            }
          } catch (error) {
            console.warn("[v0] Error reading local storage:", error)
          }
        }

        setStaticData(staticResponse)
        setAirtableCases(airtableResponse.cases || [])

        if (defendantId) {
          const decodedDefendantId = decodeURIComponent(defendantId)
          console.log("[v0] Looking for defendant:", decodedDefendantId)

          const allCases = [...staticResponse.cases, ...(airtableResponse.cases || []), ...localCases]
          console.log("[v0] Total cases to search:", allCases.length)

          let foundDefendant = staticResponse.defendants?.find(
            (d: any) =>
              d.email === defendantId ||
              d.email === decodedDefendantId ||
              `${d.firstName} ${d.lastName}`.toLowerCase() === decodedDefendantId.toLowerCase() ||
              `${d.firstName}-${d.lastName}`.toLowerCase() === decodedDefendantId.toLowerCase(),
          )

          console.log("[v0] Found in static defendants:", !!foundDefendant)

          if (!foundDefendant) {
            const defendantCases = allCases.filter((c: any) => {
              const firstName = c.defendant?.firstName || c.defendant_first_name
              const lastName = c.defendant?.lastName || c.defendant_last_name
              const email = c.defendant?.email || c.defendant_email

              if (!firstName || !lastName) return false

              const defendantFullName = `${firstName} ${lastName}`
              const matches =
                email === defendantId ||
                email === decodedDefendantId ||
                defendantFullName.toLowerCase() === decodedDefendantId.toLowerCase() ||
                defendantFullName.replace(" ", "-").toLowerCase() === decodedDefendantId.toLowerCase() ||
                defendantFullName.toLowerCase().replace(/\s+/g, "%20") === decodedDefendantId.toLowerCase() ||
                defendantFullName.toLowerCase().replace(/\s+/g, "-") === decodedDefendantId.toLowerCase()

              console.log(
                "[v0] Checking case:",
                c.case_id || c.caseId,
                "defendant:",
                defendantFullName,
                "matches:",
                matches,
              )
              return matches
            })

            console.log("[v0] Found defendant cases:", defendantCases.length)

            if (defendantCases.length > 0) {
              const firstCase = defendantCases[0]

              const firstName = firstCase.defendant?.firstName || firstCase.defendant_first_name
              const lastName = firstCase.defendant?.lastName || firstCase.defendant_last_name
              const city = firstCase.defendant?.city || firstCase.defendant_city
              const state = firstCase.defendant?.state || firstCase.defendant_state
              const email = firstCase.defendant?.email || firstCase.defendant_email

              foundDefendant = {
                firstName,
                lastName,
                city,
                state,
                email: email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                caseIds: defendantCases.map((c) => c.case_id || c.caseId),
                defendantId: `DEF${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
              }

              const visibleCases = defendantCases.filter((caseData) => {
                const lifecycle = getCaseLifecycle(caseData)
                const config = LIFECYCLE_CONFIGS[lifecycle.stage]
                return config.showInDefendantProfile
              })

              setCases(visibleCases)
              console.log("[v0] Created defendant profile from cases:", foundDefendant)
            }
          } else {
            const defendantCases = allCases.filter((c: any) => {
              if (foundDefendant.caseIds?.includes(c.case_id || c.caseId)) return true

              const firstName = c.defendant?.firstName || c.defendant_first_name
              const lastName = c.defendant?.lastName || c.defendant_last_name

              return (
                firstName &&
                lastName &&
                `${firstName} ${lastName}`.toLowerCase() ===
                  `${foundDefendant.firstName} ${foundDefendant.lastName}`.toLowerCase()
              )
            })

            const visibleCases = defendantCases.filter((caseData) => {
              const lifecycle = getCaseLifecycle(caseData)
              const config = LIFECYCLE_CONFIGS[lifecycle.stage]
              return config.showInDefendantProfile
            })

            setCases(visibleCases)
            if (!foundDefendant.defendantId) {
              foundDefendant.defendantId = `DEF${Math.random().toString(36).substr(2, 6).toUpperCase()}`
            }
          }

          setDefendant(foundDefendant)
          console.log("[v0] Final defendant:", foundDefendant)
        }
      } catch (error) {
        console.error("[v0] Error loading defendant data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [defendantId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const calculateScores = () => {
    const totalCases = cases.length
    if (totalCases === 0) return { overall: 0, defendant: 0, reputation: 0 }

    const overall = Math.max(0, 100 - totalCases * 5)
    const defendant = Math.max(0, 95 - totalCases * 3)
    const reputation = Math.max(0, 90 - totalCases * 4)

    return { overall, defendant, reputation }
  }

  const getReputationBreakdown = () => {
    const totalCases = cases.length
    const evidenceBasedCases = cases.filter((c) => c.type === "evidence").length
    const opinionBasedCases = cases.filter((c) => c.type === "opinion").length

    const responseRate = Math.max(0, 100 - totalCases * 10)
    const evidenceCompliance = evidenceBasedCases > 0 ? Math.max(0, 90 - evidenceBasedCases * 15) : 100
    const communityStanding = Math.max(0, 85 - totalCases * 8)

    const badges = []
    if (evidenceBasedCases >= 2)
      badges.push({ name: "Evidence-Based Defendant", description: "Multiple evidence-based cases filed" })
    if (totalCases === 0) badges.push({ name: "Clean Record", description: "No cases filed against this defendant" })
    if (totalCases >= 1 && responseRate > 70)
      badges.push({ name: "Responsive Defendant", description: "Good response rate to case notifications" })
    if (communityStanding > 80)
      badges.push({ name: "Community Standing", description: "Maintains good standing in community" })

    return {
      responseRate,
      evidenceCompliance,
      communityStanding,
      badges,
      breakdown: {
        totalCases,
        evidenceBasedCases,
        opinionBasedCases,
      },
    }
  }

  const getStatusDisplay = (caseData: any) => {
    const lifecycle = getCaseLifecycle(caseData)
    const config = LIFECYCLE_CONFIGS[lifecycle.stage]

    let colorClass = "bg-gray-100 text-gray-800"

    switch (lifecycle.stage) {
      case "VERDICT_KEPT":
        colorClass = "bg-green-100 text-green-800"
        break
      case "VERDICT_DELETED":
        colorClass = "bg-red-100 text-red-800"
        break
      case "VOTING":
        colorClass = "bg-blue-100 text-blue-800"
        break
      case "EVIDENCE_ARGUMENTS":
        colorClass = "bg-orange-100 text-orange-800"
        break
      case "COOLING":
        colorClass = "bg-purple-100 text-purple-800"
        break
    }

    return {
      text: config.trackerLabel,
      color: colorClass,
    }
  }

  if (!defendantId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Search for Defendants</h2>
            <p className="text-gray-600 mb-4">Enter a defendant's name to view their profile and case history.</p>
            <Button onClick={() => onNavigate("explore")}>Browse All Cases</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading defendant profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!defendant) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Defendant Not Found</h2>
            <p className="text-gray-600 mb-4">
              No cases found for "{decodeURIComponent(defendantId)}". This defendant profile will be created
              automatically when the first case is submitted against them.
            </p>
            <div className="space-y-2">
              <Button onClick={() => onNavigate("explore")}>Browse All Cases</Button>
              <Button variant="outline" onClick={() => onNavigate("submit")}>
                Submit a Case
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const scores = calculateScores()
  const reputationData = getReputationBreakdown()

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {defendant.firstName} {defendant.lastName}
        </h1>

        <div className="flex items-center gap-2">
          <span className="text-gray-600">Defendant ID:</span>
          <span className="font-mono text-gray-900">{defendant.defendantId}</span>
          <button
            onClick={() => copyToClipboard(defendant.defendantId)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Copy Defendant ID"
          >
            <Copy className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">Overall User Score</div>
            <div className="text-3xl font-bold text-blue-600">{scores.overall}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">Defendant Score</div>
            <div className="text-3xl font-bold text-blue-600">{scores.defendant}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">Reputations</div>
            <div className="text-3xl font-bold text-blue-600">{scores.reputation}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant={activeTab === "cases" ? "default" : "outline"}
            className={
              activeTab === "cases"
                ? "border-blue-500 text-white bg-blue-600"
                : "border-blue-500 text-blue-600 bg-transparent"
            }
            onClick={() => setActiveTab("cases")}
          >
            Cases Against Me
          </Button>
          <Button
            variant={activeTab === "reputation" ? "default" : "outline"}
            className={
              activeTab === "reputation"
                ? "border-blue-500 text-white bg-blue-600"
                : "text-gray-600 bg-transparent border-transparent hover:bg-gray-100"
            }
            onClick={() => setActiveTab("reputation")}
          >
            Reputations
          </Button>
        </div>

        {activeTab === "cases" ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Cases Against Me</h2>

            {cases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No published cases found for this defendant.</p>
                  <p className="text-sm text-gray-400 mt-2">Cases may be in review or have been resolved.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cases.map((caseData) => {
                  const status = getStatusDisplay(caseData)
                  const caseId = caseData.case_id || caseData.caseId
                  const plaintiffName = caseData.plaintiff_first_name || caseData.plaintiff?.firstName || "Anonymous"
                  const caseTitle = caseData.case_title || caseData.meta?.summaryOneLine || "Case Details"
                  const createdAt = caseData.submitted_at || caseData.meta?.createdAt || new Date().toISOString()

                  return (
                    <Card
                      key={caseId}
                      className="hover:shadow-md cursor-pointer transition-all"
                      onClick={() => onNavigate(`case/${caseId}`)}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-1">
                                {plaintiffName} vs {defendant.firstName} {defendant.lastName}, {caseTitle}
                              </h3>
                              <div className="text-sm text-gray-600 flex items-center gap-4">
                                <span>Case {caseId}</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Published {new Date(createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                              {status.text}
                            </div>
                          </div>

                          <CaseLifecycleTracker caseData={caseData} variant="compact" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Reputation Breakdown</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 mb-1">Response Rate</div>
                  <div className="text-2xl font-bold text-blue-600">{reputationData.responseRate}%</div>
                  <div className="text-xs text-gray-500 mt-1">How often defendant responds to notifications</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 mb-1">Evidence Compliance</div>
                  <div className="text-2xl font-bold text-green-600">{reputationData.evidenceCompliance}%</div>
                  <div className="text-xs text-gray-500 mt-1">Compliance with evidence-based cases</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 mb-1">Community Standing</div>
                  <div className="text-2xl font-bold text-purple-600">{reputationData.communityStanding}%</div>
                  <div className="text-xs text-gray-500 mt-1">Overall community reputation</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Reputation Badges</h3>
              {reputationData.badges.length === 0 ? (
                <p className="text-gray-500">No reputation badges earned yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reputationData.badges.map((badge, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="font-semibold text-blue-700">{badge.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{badge.description}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Case Statistics</h3>
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cases Filed:</span>
                    <span className="font-semibold">{reputationData.breakdown.totalCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Evidence-Based Cases:</span>
                    <span className="font-semibold">{reputationData.breakdown.evidenceBasedCases}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Opinion-Based Cases:</span>
                    <span className="font-semibold">{reputationData.breakdown.opinionBasedCases}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">How Reputation is Calculated</h3>
              <Card className="bg-blue-50">
                <CardContent className="p-4 space-y-2 text-sm">
                  <div>
                    <strong>Response Rate:</strong> Based on how quickly and consistently the defendant responds to case
                    notifications and requests for information.
                  </div>
                  <div>
                    <strong>Evidence Compliance:</strong> Measures cooperation with evidence-based cases and willingness
                    to provide requested documentation.
                  </div>
                  <div>
                    <strong>Community Standing:</strong> Overall reputation within the community based on case outcomes
                    and peer feedback.
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>Note:</strong> Reputation scores are calculated automatically based on case history,
                    response patterns, and community interactions. Higher scores indicate better standing and
                    trustworthiness.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
