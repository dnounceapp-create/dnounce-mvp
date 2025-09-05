"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Calendar, Activity, TrendingUp } from "lucide-react"

interface ProfileData {
  user: {
    firstName: string
    lastName: string
    email: string
    joinDate: string
    lastActive: string
  }
  reputation: {
    overall: number
    level: string
    rank: number
  }
  activity: {
    casesSubmitted: number
    casesVotedOn: number
    commentsPosted: number
    totalInteractions: number
  }
  scores: {
    accuracyScore: number
    helpfulnessScore: number
    consistencyScore: number
    communityScore: number
  }
  recentActivity: Array<{
    id: string
    type: "case_submitted" | "vote_cast" | "comment_posted" | "case_resolved"
    description: string
    date: string
  }>
}

export function MyProfile() {
  // Mock data - in real app this would come from API
  const profile: ProfileData = {
    user: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      joinDate: "2024-01-15",
      lastActive: "2024-01-20T14:30:00Z",
    },
    reputation: {
      overall: 847,
      level: "Trusted",
      rank: 156,
    },
    activity: {
      casesSubmitted: 3,
      casesVotedOn: 24,
      commentsPosted: 15,
      totalInteractions: 42,
    },
    scores: {
      accuracyScore: 87,
      helpfulnessScore: 92,
      consistencyScore: 79,
      communityScore: 85,
    },
    recentActivity: [
      {
        id: "1",
        type: "vote_cast",
        description: "Voted on case OP12345",
        date: "2024-01-20T10:15:00Z",
      },
      {
        id: "2",
        type: "comment_posted",
        description: "Commented on case DE67890",
        date: "2024-01-19T16:22:00Z",
      },
      {
        id: "3",
        type: "case_submitted",
        description: "Submitted case OP11111",
        date: "2024-01-18T09:45:00Z",
      },
    ],
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "case_submitted":
        return "📝"
      case "vote_cast":
        return "🗳️"
      case "comment_posted":
        return "💬"
      case "case_resolved":
        return "✅"
      default:
        return "📋"
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
        <p className="text-gray-600">
          Your DNounce profile shows your community activity, reputation, and contribution scores.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Info */}
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.user.firstName} {profile.user.lastName}
                </h2>
                <p className="text-gray-600">{profile.user.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.user.joinDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Last active {new Date(profile.user.lastActive).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          {/* Reputation Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation</h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{profile.reputation.overall}</div>
              <Badge className="mb-2">{profile.reputation.level}</Badge>
              <p className="text-sm text-gray-600">Rank #{profile.reputation.rank} in community</p>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => (window.location.hash = "#/submit")}
              >
                Submit New Case
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => (window.location.hash = "#/reputation")}
              >
                View Full Reputation
              </Button>
              <Button variant="outline" className="w-full bg-transparent" disabled>
                Edit Profile (Coming Soon)
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Activity & Scores */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profile.activity.casesSubmitted}</div>
                <div className="text-sm text-gray-600">Cases Submitted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profile.activity.casesVotedOn}</div>
                <div className="text-sm text-gray-600">Cases Voted On</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profile.activity.commentsPosted}</div>
                <div className="text-sm text-gray-600">Comments Posted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{profile.activity.totalInteractions}</div>
                <div className="text-sm text-gray-600">Total Interactions</div>
              </div>
            </div>
          </Card>

          {/* Performance Scores */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Scores
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Accuracy Score</span>
                <span className={`font-semibold ${getScoreColor(profile.scores.accuracyScore)}`}>
                  {profile.scores.accuracyScore}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Helpfulness Score</span>
                <span className={`font-semibold ${getScoreColor(profile.scores.helpfulnessScore)}`}>
                  {profile.scores.helpfulnessScore}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Consistency Score</span>
                <span className={`font-semibold ${getScoreColor(profile.scores.consistencyScore)}`}>
                  {profile.scores.consistencyScore}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Community Score</span>
                <span className={`font-semibold ${getScoreColor(profile.scores.communityScore)}`}>
                  {profile.scores.communityScore}%
                </span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {profile.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
