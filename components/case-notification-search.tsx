"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Search, Bell } from "lucide-react"
import { analytics } from "@/lib/analytics"

export function CaseNotificationSearch() {
  const [caseId, setCaseId] = useState("")
  const [error, setError] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!caseId.trim()) {
      setError("Please enter a Case ID")
      return
    }

    // Validate case ID format (should start with DN, DE, or OP)
    if (!/^(DN|DE|OP)\d{5}$/i.test(caseId.trim())) {
      setError("Invalid Case ID format. Should be like DN12345, DE12345, or OP12345")
      return
    }

    analytics.trackCTAClick("search_case_notification", "notification_search")

    // Navigate to the case page
    window.location.hash = `#/case/${caseId.trim().toUpperCase()}`
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Case</h1>
        <p className="text-lg text-gray-600">Enter your Case ID to view the details and current status of your case</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <Label htmlFor="case-id" className="text-base font-medium">
              Case ID
            </Label>
            <div className="mt-2 relative">
              <Input
                id="case-id"
                type="text"
                value={caseId}
                onChange={(e) => {
                  setCaseId(e.target.value)
                  setError("")
                }}
                placeholder="Enter your Case ID (e.g., DN12345)"
                className={`text-lg py-3 pl-4 pr-12 ${error ? "border-red-500" : ""}`}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <p className="text-sm text-gray-500 mt-2">
              Your Case ID was provided when you submitted your case and in any notification emails
            </p>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            data-cta-id="search_case_by_id"
            data-section="notification_search"
          >
            View My Case
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Don't have your Case ID?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Check your email for the case submission confirmation</p>
            <p>• Look for notifications from DNounce in your inbox</p>
            <p>• Contact support if you need help locating your case</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
