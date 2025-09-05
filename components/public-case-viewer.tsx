"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { StatusTracker } from "@/components/status-tracker"
import { ThumbsUp, ThumbsDown, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"

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

interface Comment {
  id: string
  author: string
  reputation: number
  content: string
  upvotes: number
  downvotes: number
  createdAt: string
  replies: Comment[]
}

interface PublicCaseViewerProps {
  case: Case | undefined
  caseId: string
}

export function PublicCaseViewer({ case: caseData, caseId }: PublicCaseViewerProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [vote, setVote] = useState<"keep" | "delete" | null>(null)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "CommunityMember123",
      reputation: 85,
      content: "This seems like a legitimate concern. The evidence provided appears authentic.",
      upvotes: 12,
      downvotes: 2,
      createdAt: "2024-01-15T10:30:00Z",
      replies: [
        {
          id: "1-1",
          author: "Reviewer456",
          reputation: 67,
          content: "I agree, but we should also consider the defendant's perspective.",
          upvotes: 8,
          downvotes: 1,
          createdAt: "2024-01-15T11:15:00Z",
          replies: [],
        },
      ],
    },
  ])
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!caseData?.status.deadlineUtc) return

    const updateTimer = () => {
      const deadline = new Date(caseData.status.deadlineUtc!)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Expired")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [caseData?.status.deadlineUtc])

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Not Found</h2>
          <p className="text-gray-600 mb-4">Case ID "{caseId}" was not found in our system.</p>
          <Button onClick={() => (window.location.hash = "#/")}>Back to Home</Button>
        </Card>
      </div>
    )
  }

  const getCaseTitle = () => {
    if (caseData.type === "evidence") {
      return `Anonymous Plaintiff vs ${caseData.defendant.firstName}${caseData.defendant.lastName ? " " + caseData.defendant.lastName : ""}${caseData.defendant.alias ? ' alias "' + caseData.defendant.alias + '"' : ""}`
    } else {
      return `${caseData.plaintiff.firstName}${caseData.plaintiff.lastName ? " " + caseData.plaintiff.lastName : ""} vs ${caseData.defendant.firstName}${caseData.defendant.lastName ? " " + caseData.defendant.lastName : ""}${caseData.defendant.alias ? ' alias "' + caseData.defendant.alias + '"' : ""}`
    }
  }

  const handleVote = (voteType: "keep" | "delete") => {
    setVote(voteType)
    // TODO: Send vote to backend
    alert(`Voted to ${voteType} this case`)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: "CurrentUser",
      reputation: 42,
      content: newComment,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      replies: [],
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedComments(newExpanded)
  }

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={`${depth > 0 ? "ml-8 border-l-2 border-gray-200 pl-4" : ""} mb-4`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{comment.author}</span>
            <Badge variant="outline" className="text-xs">
              Rep: {comment.reputation}
            </Badge>
            <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <p className="text-gray-700 mb-3">{comment.content}</p>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            {comment.upvotes}
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            {comment.downvotes}
          </Button>
          <Button variant="ghost" size="sm">
            Reply
          </Button>
          {comment.replies.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCommentExpansion(comment.id)}
              className="flex items-center gap-1"
            >
              {expandedComments.has(comment.id) ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              {comment.replies.length} replies
            </Button>
          )}
        </div>
      </div>

      {expandedComments.has(comment.id) && comment.replies.map((reply) => renderComment(reply, depth + 1))}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Case Header */}
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{getCaseTitle()}</h1>
          <div className="flex items-center gap-3 mb-3">
            <Badge variant={caseData.type === "evidence" ? "default" : "secondary"}>
              {caseData.type === "evidence" ? "Evidence-Based" : "Experience-Based"}
            </Badge>
            <Badge variant="outline">{caseData.status.label}</Badge>
            {caseData.status.deadlineUtc && timeLeft && (
              <span className="text-sm text-gray-600">Ends in {timeLeft}</span>
            )}
          </div>
        </div>

        <StatusTracker currentStage={caseData.status.stage} deadline={caseData.status.deadlineUtc} />
      </Card>

      {/* Case Summary */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Summary</h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{caseData.meta.summaryOneLine}</p>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <span>
            Relationship: <strong>{caseData.relationship}</strong>
          </span>
          <span className="mx-2">•</span>
          <span>
            Submitted: <strong>{new Date(caseData.meta.createdAt).toLocaleDateString()}</strong>
          </span>
        </div>
      </Card>

      {/* Evidence */}
      {caseData.evidence.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Evidence</h2>
          <div className="space-y-3">
            {caseData.evidence.map((evidence) => (
              <div key={evidence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{evidence.filename}</span>
                <Badge variant={evidence.authenticity === "Authentic" ? "default" : "destructive"}>
                  {evidence.authenticity} (Simulated)
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Voting Section */}
      {caseData.status.stage === "Voting" && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Voting</h2>
          <p className="text-gray-600 mb-4">
            The community decides whether this case should be kept or deleted. Vote counts are hidden until the verdict.
          </p>
          <div className="flex gap-4">
            <Button
              variant={vote === "keep" ? "default" : "outline"}
              onClick={() => handleVote("keep")}
              className="flex items-center gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Keep Case
            </Button>
            <Button
              variant={vote === "delete" ? "destructive" : "outline"}
              onClick={() => handleVote("delete")}
              className="flex items-center gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              Delete Case
            </Button>
          </div>
          {vote && <p className="text-sm text-green-600 mt-2">✓ Your vote has been recorded</p>}
        </Card>
      )}

      {/* Comments Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Community Discussion ({comments.length})
        </h2>

        {/* Add Comment */}
        <div className="mb-6">
          <Textarea
            placeholder="Share your thoughts on this case..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3"
            rows={3}
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
            Post Comment
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">{comments.map((comment) => renderComment(comment))}</div>

        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
        )}
      </Card>
    </div>
  )
}
