"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, User, ChevronDown, Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { analytics } from "@/lib/analytics"

interface TopBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onSearch: (caseId: string) => void
}

export function TopBar({ searchValue, onSearchChange, onSearch }: TopBarProps) {
  const [localSearch, setLocalSearch] = useState("")
  // Mock unread notification count
  const unreadNotifications = 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!localSearch.trim()) return

    console.log("[v0] Search submitted:", localSearch.trim())

    analytics.trackCTAClick("search_submitted", localSearch.trim(), "header")

    const searchTerm = localSearch.trim().toUpperCase()
    if (searchTerm.startsWith("CASE-") || searchTerm.startsWith("EVB") || searchTerm.startsWith("OPB")) {
      console.log("[v0] Navigating to case:", localSearch.trim())
      window.location.hash = `#/case/${localSearch.trim()}`
    } else {
      console.log("[v0] Navigating to defendant:", localSearch.trim())
      window.location.hash = `#/defendant/${encodeURIComponent(localSearch.trim())}`
    }

    // Clear search after submission
    setLocalSearch("")
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="#/" className="flex items-center" data-cta-id="logo_home" data-section="header">
              <img src="/images/dnounce-logo.png" alt="DNounce" className="h-10 w-10" />
              <span className="ml-2 text-xl font-bold text-gray-900">DNounce</span>
            </a>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center" data-cta-id="nav_my_cases" data-section="header">
                  My Cases
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => (window.location.hash = "#plaintiff-cases")}
                  data-cta-id="nav_cases_submitted"
                  data-section="header_dropdown"
                >
                  Cases I Submitted
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.hash = "#defendant-cases")}
                  data-cta-id="nav_cases_against_me"
                  data-section="header_dropdown"
                >
                  Cases Against Me
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => (window.location.hash = "#reputation")}
                  data-cta-id="nav_reputation"
                  data-section="header_dropdown"
                >
                  My Reputation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                type="text"
                placeholder="Enter Case ID (EVB001, OPB002, CASE-2024-003) or Defendant name"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-10 pr-12"
                data-cta-id="global_search"
                data-section="header"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                data-cta-id="search_button"
                data-section="header"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Notifications and Profile */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.hash = "#notifications")}
              className="relative"
              data-cta-id="nav_notifications"
              data-section="header"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center p-0">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-cta-id="nav_profile" data-section="header">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => (window.location.hash = "#profile")}
                  data-cta-id="nav_my_profile"
                  data-section="header_dropdown"
                >
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.hash = "#reputation")}
                  data-cta-id="nav_my_reputation"
                  data-section="header_dropdown"
                >
                  My Reputation
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => (window.location.hash = "#notifications")}
                  data-cta-id="nav_notifications_dropdown"
                  data-section="header_dropdown"
                >
                  Notifications
                  {unreadNotifications > 0 && (
                    <Badge className="ml-2 bg-red-600 text-white">{unreadNotifications}</Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled data-cta-id="nav_settings" data-section="header_dropdown">
                  Settings (Coming Soon)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
