"use client"

import { useEffect, useState } from "react"
import { TopBar } from "@/components/top-bar"
import { LandingPage } from "@/components/landing-page"
import { SubmitCase } from "@/components/submit-case"
import { CasesAgainstMe } from "@/components/cases-against-me"
import { CasesSubmitted } from "@/components/cases-submitted"
import { MyReputation } from "@/components/my-reputation"
import { MyProfile } from "@/components/my-profile"
import { ExploreCases } from "@/components/explore-cases"
import { Notifications } from "@/components/notifications"
import { CasePage } from "@/components/case-page"
import DefendantProfile from "@/components/defendant-profile"
import SurveyThankYou from "@/components/survey-thank-you"
import AdminDashboard from "@/components/admin-dashboard"
import { CaseConfirmation } from "@/components/case-confirmation"
import { CaseNotificationSearch } from "@/components/case-notification-search"
import { usePageTracking, useCTATracking } from "@/hooks/use-analytics"
import { analytics } from "@/lib/analytics"
import { ExplorePage } from "@/components/explore-page"
import { fetchCasesFromAirtable } from "@/lib/airtable-read"

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

interface AppData {
  cases: Case[]
  defendants: Array<{
    email: string
    phone: string
    firstName: string
    lastName?: string
    city: string
    state: string
    caseIds: string[]
  }>
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null)
  const [airtableCases, setAirtableCases] = useState<Case[]>([])
  const [currentRoute, setCurrentRoute] = useState("")
  const [searchValue, setSearchValue] = useState("")

  usePageTracking()
  useCTATracking()

  useEffect(() => {
    analytics.init()

    const loadData = async () => {
      try {
        // Load static data
        const staticResponse = await fetch("/data.json")
        const staticData = await staticResponse.json()
        setData(staticData)

        // Load Airtable data
        const airtableData = await fetchCasesFromAirtable()
        setAirtableCases(airtableData)
      } catch (error) {
        console.error("[v0] Error loading data:", error)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    // Handle routing
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || "#/")
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  useEffect(() => {
    const originalQuerySelector = document.querySelector
    document.querySelector = (selector: string) => {
      try {
        return originalQuerySelector.call(document, selector)
      } catch (error) {
        if (error instanceof DOMException && error.name === "SyntaxError") {
          console.warn("[v0] Invalid CSS selector prevented:", selector)
          return null
        }
        throw error
      }
    }

    return () => {
      document.querySelector = originalQuerySelector
    }
  }, [])

  useEffect(() => {
    if (currentRoute === "#/submit") {
      analytics.trackCaseFormViewed()
    }
  }, [currentRoute])

  const handleSearch = (caseId: string) => {
    if (caseId.trim()) {
      window.location.hash = `#/case/${caseId.trim()}`
    }
  }

  const addCase = (newCase: Case) => {
    if (data) {
      setData({
        ...data,
        cases: [...data.cases, newCase],
      })
    }
  }

  const handleNavigate = (route: string) => {
    window.location.hash = `#/${route}`
  }

  if (!data) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const renderPage = () => {
    if (currentRoute === "#/" || currentRoute === "") {
      const allCases = [...(data?.cases || []), ...airtableCases]
      return <ExplorePage cases={allCases} />
    }

    if (currentRoute === "#/submit") {
      return <SubmitCase onCaseSubmitted={addCase} />
    }

    if (currentRoute === "#/explore") {
      return <ExploreCases cases={data.cases} />
    }

    if (currentRoute === "#/defendant/cases") {
      return <CasesAgainstMe cases={data.cases} />
    }

    if (currentRoute === "#/plaintiff/cases") {
      return <CasesSubmitted cases={data.cases} />
    }

    if (currentRoute === "#/reputation") {
      return <MyReputation />
    }

    if (currentRoute === "#/profile") {
      return <MyProfile />
    }

    if (currentRoute === "#/notifications") {
      return <Notifications />
    }

    if (currentRoute === "#/notification-search") {
      return <CaseNotificationSearch />
    }

    if (currentRoute === "#/search-defendants") {
      return <DefendantProfile onNavigate={handleNavigate} />
    }

    if (currentRoute.startsWith("#/mvp/survey/thankyou")) {
      const queryParams = new URLSearchParams(window.location.hash.replace("#/mvp/survey/thankyou?", ""))
      const thankYouMessage = queryParams.get("message")
      return <SurveyThankYou thankYouMessage={thankYouMessage} />
    }

    if (currentRoute === "#/admin") {
      return <AdminDashboard />
    }

    if (currentRoute.startsWith("#/case-confirmation/")) {
      const parts = currentRoute.replace("#/case-confirmation/", "").split("/")
      const caseId = parts[0]
      const caseType = parts[1] // 'evidence' or 'experience'
      const hasEvidence = caseType === "evidence"

      return <CaseConfirmation caseId={caseId} hasEvidence={hasEvidence} />
    }

    if (currentRoute.startsWith("#/defendant/")) {
      const defendantId = currentRoute.replace("#/defendant/", "")
      return <DefendantProfile defendantId={defendantId} onNavigate={handleNavigate} />
    }

    if (currentRoute.startsWith("#/case/")) {
      const caseId = currentRoute.replace("#/case/", "")
      const caseData = data.cases.find((c) => c.caseId === caseId)

      return <CasePage case={caseData} caseId={caseId} userRole="community" />
    }

    return <LandingPage onSearchFocus={() => setSearchValue("")} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar searchValue={searchValue} onSearchChange={setSearchValue} onSearch={handleSearch} />
      <main className="pt-16">{renderPage()}</main>
    </div>
  )
}
