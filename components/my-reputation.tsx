"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Users, MessageSquare, Vote } from "lucide-react"

interface ReputationStats {
  overall: number
  plaintiff: {
    casesSubmitted: number
    casesKept: number
    evidenceAuthenticated: number
  }
  defendant: {
    casesAgainst: number
    casesDeleted: number
    successfulDefenses: number
  }
  voter: {
    votesSubmitted: number
    accurateVotes: number
    consistencyScore: number
  }
  commenter: {
    commentsPosted: number
    upvotesReceived: number
    helpfulComments: number
  }
}

export function MyReputation() {
  // Mock data - in real app this would come from API
  const stats: ReputationStats = {
    overall: 847,
    plaintiff: {
      casesSubmitted: 3,
      casesKept: 2,
      evidenceAuthenticated: 1,
    },
    defendant: {
      casesAgainst: 1,
      casesDeleted: 1,
      successfulDefenses: 1,
    },
    voter: {
      votesSubmitted: 24,
      accurateVotes: 19,
      consistencyScore: 79,
    },
    commenter: {
      commentsPosted: 15,
      upvotesReceived: 42,
      helpfulComments: 8,
    },
  }

  const getReputationLevel = (score: number) => {
    if (score >= 1000) return { level: "Expert", color: "bg-purple-100 text-purple-800" }
    if (score >= 500) return { level: "Trusted", color: "bg-blue-100 text-blue-800" }
    if (score >= 100) return { level: "Active", color: "bg-green-100 text-green-800" }
    return { level: "New", color: "bg-gray-100 text-gray-800" }
  }

  const reputation = getReputationLevel(stats.overall)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Reputation</h1>
        <p className="text-gray-600">
          Your reputation reflects your contributions to the DNounce community. Only counts are shown to prevent bias.
        </p>
      </div>

      {/* Overall Reputation */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Reputation</h2>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-blue-600">{stats.overall}</span>
              <Badge className={reputation.color}>{reputation.level}</Badge>
            </div>
          </div>
          <Star className="h-16 w-16 text-yellow-400" />
        </div>
      </Card>

      {/* Role-based Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Plaintiff Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">As Plaintiff</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Cases Submitted</span>
              <span className="font-semibold">{stats.plaintiff.casesSubmitted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cases Kept by Community</span>
              <span className="font-semibold">{stats.plaintiff.casesKept}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Evidence Authenticated</span>
              <span className="font-semibold">{stats.plaintiff.evidenceAuthenticated}</span>
            </div>
          </div>
        </Card>

        {/* Defendant Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">As Defendant</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Cases Against Me</span>
              <span className="font-semibold">{stats.defendant.casesAgainst}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cases Deleted by Community</span>
              <span className="font-semibold">{stats.defendant.casesDeleted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Successful Defenses</span>
              <span className="font-semibold">{stats.defendant.successfulDefenses}</span>
            </div>
          </div>
        </Card>

        {/* Voter Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Vote className="h-6 w-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-900">As Voter</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Votes Submitted</span>
              <span className="font-semibold">{stats.voter.votesSubmitted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accurate Votes</span>
              <span className="font-semibold">{stats.voter.accurateVotes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Consistency Score</span>
              <span className="font-semibold">{stats.voter.consistencyScore}%</span>
            </div>
          </div>
        </Card>

        {/* Commenter Stats */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-6 w-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-gray-900">As Commenter</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Comments Posted</span>
              <span className="font-semibold">{stats.commenter.commentsPosted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upvotes Received</span>
              <span className="font-semibold">{stats.commenter.upvotesReceived}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Helpful Comments</span>
              <span className="font-semibold">{stats.commenter.helpfulComments}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Reputation Note */}
      <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About Reputation</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• Reputation is calculated based on community interactions and accuracy of contributions</p>
          <p>• Only counts are displayed to prevent bias in case evaluation</p>
          <p>• Higher reputation indicates consistent, helpful community participation</p>
          <p>• Reputation does not determine case outcomes - the community decides</p>
        </div>
      </Card>
    </div>
  )
}
