"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, TrendingUp, Clock, Users } from "lucide-react"

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

interface ExploreCasesProps {
  cases: Case[]
}

export function ExploreCases({ cases }: ExploreCasesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "evidence" | "opinion">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "voting" | "evidence-arguments" | "published">("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "trending">("newest")

  // Filter and sort cases
  const filteredCases = cases
    .filter((caseItem) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch =
          caseItem.meta.title.toLowerCase().includes(searchLower) ||
          caseItem.meta.summaryOneLine.toLowerCase().includes(searchLower) ||
          caseItem.caseId.toLowerCase().includes(searchLower) ||
          caseItem.defendant.firstName.toLowerCase().includes(searchLower) ||
          (caseItem.defendant.lastName && caseItem.defendant.lastName.toLowerCase().includes(searchLower))

        if (!matchesSearch) return false
      }

      // Type filter
      if (filterType !== "all" && caseItem.type !== filterType) return false

      // Status filter
      if (filterStatus !== "all") {
        const statusMap = {
          voting: "Voting",
          "evidence-arguments": "Evidence & Arguments",
          published: "Published",
        }
        if (caseItem.status.stage !== statusMap[filterStatus as keyof typeof statusMap]) return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime()
        case "oldest":
          return new Date(a.meta.createdAt).getTime() - new Date(b.meta.createdAt).getTime()
        case "trending":
          // Mock trending logic - in real app this would be based on engagement metrics
          return b.caseId.localeCompare(a.caseId)
        default:
          return 0
      }
    })

  const getCaseTitle = (caseItem: Case) => {
    if (caseItem.type === "evidence") {
      return (
        <span>
          Anonymous vs{" "}
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.location.hash = `#/defendant/${caseItem.defendant.email}`
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            {caseItem.defendant.firstName}
            {caseItem.defendant.lastName ? " " + caseItem.defendant.lastName : ""}
          </button>
        </span>
      )
    } else {
      return (
        <span>
          {caseItem.plaintiff.firstName}
          {caseItem.plaintiff.lastName ? " " + caseItem.plaintiff.lastName : ""} vs{" "}
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.location.hash = `#/defendant/${caseItem.defendant.email}`
            }}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            {caseItem.defendant.firstName}
            {caseItem.defendant.lastName ? " " + caseItem.defendant.lastName : ""}
          </button>
        </span>
      )
    }
  }

  const getStatusColor = (stage: string) => {
    switch (stage) {
      case "Voting":
        return "bg-red-100 text-red-800"
      case "Evidence & Arguments":
        return "bg-yellow-100 text-yellow-800"
      case "Published":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Cases</h1>
        <p className="text-gray-600">
          Browse and engage with cases in the DNounce community. Vote, comment, and help decide fairness.
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Input
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Type Filter */}
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Case Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="evidence">Evidence-Based</SelectItem>
              <SelectItem value="opinion">Experience-Based</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="evidence-arguments">Evidence & Arguments</SelectItem>
              <SelectItem value="voting">Voting</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Filter className="h-4 w-4" />
            {filteredCases.length} cases found
          </span>
        </div>
      </Card>

      {/* Community Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">Active Cases</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {cases.filter((c) => c.status.stage === "Voting" || c.status.stage === "Evidence & Arguments").length}
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span className="text-lg font-semibold text-gray-900">Published</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {cases.filter((c) => c.status.stage === "Published").length}
          </div>
        </Card>

        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-lg font-semibold text-gray-900">Total Cases</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{cases.length}</div>
        </Card>
      </div>

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Cases Found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
          <Button onClick={() => (window.location.hash = "#/submit")}>Submit the First Case</Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredCases.map((caseItem) => (
            <Card key={caseItem.caseId} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Case Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{getCaseTitle(caseItem)}</h3>
                    <Badge variant={caseItem.type === "evidence" ? "default" : "secondary"}>
                      {caseItem.type === "evidence" ? "Evidence-Based" : "Experience-Based"}
                    </Badge>
                    <Badge className={getStatusColor(caseItem.status.stage)}>{caseItem.status.stage}</Badge>
                  </div>

                  <p className="text-gray-600 mb-3 line-clamp-2">{caseItem.meta.summaryOneLine}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>
                      Case ID: <strong>{caseItem.caseId}</strong>
                    </span>
                    <span>
                      Relationship: <strong>{caseItem.relationship}</strong>
                    </span>
                    <span>
                      Submitted: <strong>{new Date(caseItem.meta.createdAt).toLocaleDateString()}</strong>
                    </span>
                    {caseItem.evidence.length > 0 && (
                      <span>
                        Evidence: <strong>{caseItem.evidence.length} files</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[150px]">
                  <Button onClick={() => (window.location.hash = `#/case/${caseItem.caseId}`)} className="w-full">
                    View Case
                  </Button>

                  {caseItem.status.stage === "Voting" && (
                    <Badge className="bg-red-100 text-red-800 text-center">Voting Active</Badge>
                  )}

                  {caseItem.status.stage === "Evidence & Arguments" && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-center">Discussion Open</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Community Guidelines */}
      <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Community Guidelines</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">When Voting:</h4>
            <ul className="space-y-1">
              <li>• Consider evidence and context</li>
              <li>• Vote based on fairness, not personal bias</li>
              <li>• Remember: you're helping decide community standards</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">When Commenting:</h4>
            <ul className="space-y-1">
              <li>• Be respectful and constructive</li>
              <li>• Focus on facts and evidence</li>
              <li>• Help others understand different perspectives</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
