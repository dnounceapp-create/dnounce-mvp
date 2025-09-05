"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Users, MessageSquare, TrendingUp, Database, Lock, Eye, FileText } from "lucide-react"
import { dataStorage } from "@/lib/data-storage"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null)
  const [showSurveyModal, setShowSurveyModal] = useState(false)

  useEffect(() => {
    const isAuth = sessionStorage.getItem("admin_authenticated") === "true"
    if (isAuth) {
      setIsAuthenticated(true)
      loadStats()
    } else {
      setLoading(false)
    }
  }, [])

  const handleAuth = () => {
    const adminPassword = "Letswork123!"
    if (password === adminPassword) {
      setIsAuthenticated(true)
      setAuthError("")
      sessionStorage.setItem("admin_authenticated", "true")
      loadStats()
    } else {
      setAuthError("Invalid password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem("admin_authenticated")
    setPassword("")
  }

  const loadStats = async () => {
    try {
      const data = await dataStorage.getStats()
      setStats(data)
    } catch (error) {
      console.error("[v0] Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const exportData = await dataStorage.exportData()
      if (exportData) {
        const waitlistBlob = new Blob([exportData.waitlist], { type: "text/csv" })
        const surveyBlob = new Blob([exportData.surveys], { type: "text/csv" })
        const casesBlob = new Blob([exportData.cases || ""], { type: "text/csv" })

        const waitlistUrl = URL.createObjectURL(waitlistBlob)
        const waitlistLink = document.createElement("a")
        waitlistLink.href = waitlistUrl
        waitlistLink.download = `dnounce-waitlist-${new Date().toISOString().split("T")[0]}.csv`
        waitlistLink.click()

        const surveyUrl = URL.createObjectURL(surveyBlob)
        const surveyLink = document.createElement("a")
        surveyLink.href = surveyUrl
        surveyLink.download = `dnounce-surveys-${new Date().toISOString().split("T")[0]}.csv`
        surveyLink.click()

        if (exportData.cases) {
          const casesUrl = URL.createObjectURL(casesBlob)
          const casesLink = document.createElement("a")
          casesLink.href = casesUrl
          casesLink.download = `dnounce-cases-${new Date().toISOString().split("T")[0]}.csv`
          casesLink.click()
          URL.revokeObjectURL(casesUrl)
        }

        URL.revokeObjectURL(waitlistUrl)
        URL.revokeObjectURL(surveyUrl)
      }
    } catch (error) {
      console.error("[v0] Error exporting data:", error)
    }
  }

  const handleSurveyClick = (survey: any) => {
    setSelectedSurvey(survey)
    setShowSurveyModal(true)
  }

  const handleWaitlistCardClick = () => {
    const waitlistSection = document.getElementById("waitlist-section")
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSurveyCardClick = () => {
    const surveySection = document.getElementById("survey-section")
    if (surveySection) {
      surveySection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleCasesCardClick = () => {
    const casesSection = document.getElementById("cases-section")
    if (casesSection) {
      casesSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleConversionCardClick = () => {
    alert(
      `Conversion Details:\nSurvey Responses: ${stats?.surveys || 0}\nWaitlist Signups: ${stats?.waitlist || 0}\nConversion Rate: ${stats?.waitlist > 0 ? Math.round((stats.surveys / stats.waitlist) * 100) : 0}%`,
    )
  }

  const handleStorageCardClick = () => {
    const setupSection = document.getElementById("setup-section")
    if (setupSection) {
      setupSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-6 mt-20">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-gray-400" />
            </div>
            <CardTitle>Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAuth()}
              />
              {authError && <p className="text-sm text-red-600 mt-2">{authError}</p>}
            </div>
            <Button onClick={handleAuth} className="w-full">
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Lock className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleWaitlistCardClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waitlist Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.waitlist || 0}</div>
            <p className="text-xs text-muted-foreground">Total email signups</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleSurveyCardClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Survey Responses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.surveys || 0}</div>
            <p className="text-xs text-muted-foreground">Post-submission surveys</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCasesCardClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cases Submitted</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cases || 0}</div>
            <p className="text-xs text-muted-foreground">Total case submissions</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleConversionCardClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.waitlist > 0 ? Math.round((stats.surveys / stats.waitlist) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Survey to waitlist ratio</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleStorageCardClick}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Local</div>
            <p className="text-xs text-muted-foreground">Development mode</p>
          </CardContent>
        </Card>
      </div>

      {stats?.caseData && stats.caseData.length > 0 && (
        <Card id="cases-section">
          <CardHeader>
            <CardTitle>Recent Case Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.caseData
                .slice(-10)
                .reverse()
                .map((caseItem: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{caseItem.case_title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {caseItem.case_id}
                        </Badge>
                        <Badge variant={caseItem.case_type === "evidence" ? "default" : "outline"} className="text-xs">
                          {caseItem.case_type}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {caseItem.plaintiff_name} vs {caseItem.defendant_name} • {caseItem.relationship}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(caseItem.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats?.waitlistEmails && stats.waitlistEmails.length > 0 && (
        <Card id="waitlist-section">
          <CardHeader>
            <CardTitle>Recent Waitlist Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.waitlistEmails
                .slice(-10)
                .reverse()
                .map((email: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-mono">{email}</span>
                    <Badge variant="outline">Waitlist</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats?.surveyResponses && stats.surveyResponses.length > 0 && (
        <Card id="survey-section">
          <CardHeader>
            <CardTitle>Recent Survey Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.surveyResponses
                .slice(-10)
                .reverse()
                .map((survey: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => handleSurveyClick(survey)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{survey.email}</span>
                        {survey.case_id && (
                          <Badge variant="secondary" className="text-xs">
                            {survey.case_id}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(survey.timestamp || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Survey</Badge>
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showSurveyModal} onOpenChange={setShowSurveyModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Survey Response Details</DialogTitle>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="font-mono text-sm">{selectedSurvey.email}</p>
                </div>
                {selectedSurvey.case_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Case ID</label>
                    <p className="font-mono text-sm">{selectedSurvey.case_id}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Submission Date</label>
                <p className="text-sm">{new Date(selectedSurvey.timestamp || Date.now()).toLocaleString()}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Feedback Responses</h4>

                {selectedSurvey.easy_to_use && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Was the platform easy to use?</label>
                    <p className="text-sm">{selectedSurvey.easy_to_use}</p>
                  </div>
                )}

                {selectedSurvey.clear_process && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Was the process clear?</label>
                    <p className="text-sm">{selectedSurvey.clear_process}</p>
                  </div>
                )}

                {selectedSurvey.recommend && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Would you recommend DNounce?</label>
                    <p className="text-sm">{selectedSurvey.recommend}</p>
                  </div>
                )}

                {selectedSurvey.improvement_suggestions && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Improvement Suggestions</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedSurvey.improvement_suggestions}</p>
                  </div>
                )}

                {selectedSurvey.additional_features && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Additional Features</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedSurvey.additional_features}</p>
                  </div>
                )}

                {selectedSurvey.overall_experience && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Overall Experience</label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedSurvey.overall_experience}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card id="setup-section">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Airtable Setup:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>
                Create an Airtable base with tables: "waitlist_signups", "post_submit_surveys", and "case_submissions"
              </li>
              <li>Add environment variables: AIRTABLE_API_KEY and AIRTABLE_BASE_ID (server-side only)</li>
              <li>Configure table schemas as specified in the data storage utility</li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium mb-2">Current Status:</h4>
            <p className="text-sm text-gray-600">
              Running in development mode with local storage fallback. Data is stored in browser localStorage and can be
              exported as CSV files. All API calls are secured through server-side endpoints.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
