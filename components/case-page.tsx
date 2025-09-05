"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { StatusTracker } from "@/components/status-tracker"
import { ThumbsUp, ThumbsDown, MessageCircle, Upload, Clock, Shield, AlertTriangle, User, Copy } from "lucide-react"

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
    authenticity: "Authentic" | "Non-Authentic Evidence" | "Neutral"
    submittedBy: "plaintiff" | "defendant"
    submittedAt: string
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
  role: "voter" | "community" | "plaintiff" | "defendant"
  content: string
  upvotes: number
  downvotes: number
  createdAt: string
  replies: Comment[]
}

interface CasePageProps {
  case: Case | undefined
  caseId: string
  userRole?: "plaintiff" | "defendant" | "voter" | "community"
}

export function CasePage({ case: caseData, caseId, userRole = "community" }: CasePageProps) {
  const [timeLeft, setTimeLeft] = useState("")
  const [vote, setVote] = useState<"keep" | "delete" | null>(null)
  const [voteReason, setVoteReason] = useState("")
  const [newComment, setNewComment] = useState("")
  const [newEvidence, setNewEvidence] = useState("")
  const [newArgument, setNewArgument] = useState("")
  const [copiedCaseId, setCopiedCaseId] = useState(false)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      author: "VoterUser123",
      reputation: 85,
      role: "voter",
      content:
        "Based on the evidence provided, this appears to be a legitimate concern that warrants community attention.",
      upvotes: 12,
      downvotes: 2,
      createdAt: "2024-01-15T10:30:00Z",
      replies: [],
    },
  ])

  const handleCopyCaseId = async () => {
    try {
      await navigator.clipboard.writeText(caseData.caseId)
      setCopiedCaseId(true)
      setTimeout(() => setCopiedCaseId(false), 2000)
    } catch (err) {
      console.error("Failed to copy case ID:", err)
    }
  }

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

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`)
      } else {
        setTimeLeft(`${hours}h ${minutes}m left`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [caseData?.status.deadlineUtc])

  useEffect(() => {
    console.log("[v0] CasePage rendered with:", {
      caseId,
      userRole,
      caseStage: caseData?.status.stage,
      canCommentResult: caseData ? canComment() : false,
      commentsLength: comments.length,
    })
  }, [caseData, userRole, comments.length])

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Not Found</h2>
          <p className="text-gray-600 mb-4">Case ID "{caseId}" was not found in our system.</p>
          <Button onClick={() => (window.location.hash = "#home")}>Back to Home</Button>
        </Card>
      </div>
    )
  }

  const getPartiesDisplay = () => {
    if (caseData.type === "opinion") {
      // Opinion-Based: show plaintiff's name + relationship label
      return `${caseData.plaintiff.firstName}${caseData.plaintiff.lastName ? " " + caseData.plaintiff.lastName : ""} vs ${caseData.defendant.firstName}${caseData.defendant.lastName ? " " + caseData.defendant.lastName : ""}`
    } else {
      // Evidence-Based: show defendant's name vs. "Somebody who labeled you as [relationship]"
      return `Somebody who labeled you as ${caseData.relationship} vs ${caseData.defendant.firstName}${caseData.defendant.lastName ? " " + caseData.defendant.lastName : ""}`
    }
  }

  const getStatusMessage = () => {
    const stage = caseData.status.stage
    switch (stage) {
      case "AI Verification":
        return `Status: AI Verification — ${timeLeft} until case publication`
      case "Parties Notified":
        return `Status: Parties Notified — case scheduled for publication, ${timeLeft}`
      case "Published":
        return `Status: Published — case is now public`
      case "Evidence & Arguments":
        return `Status: Evidence & Arguments — ${timeLeft}`
      case "Cooling":
        return `Status: Cooling Period — ${timeLeft} until voting begins`
      case "Voting":
        return `Status: Voting in Progress — ${timeLeft}`
      case "Verdict":
        return `Status: Verdict — Case ${vote === "delete" ? "Deleted" : "Kept"}`
      default:
        return `Status: ${stage}`
    }
  }

  const canSubmitEvidence = () => {
    return caseData.status.stage === "Evidence & Arguments" && (userRole === "plaintiff" || userRole === "defendant")
  }

  const canComment = () => {
    const stage = caseData.status.stage
    console.log("[v0] Checking canComment for stage:", stage, "userRole:", userRole)

    if (stage === "Voting") {
      const result = userRole === "voter"
      console.log("[v0] Voting stage - can comment:", result)
      return result
    }
    if (stage === "Verdict") {
      console.log("[v0] Verdict stage - can comment: true")
      return true
    }
    if (stage === "Published") {
      console.log("[v0] Published stage - can comment: true")
      return true
    }
    if (stage === "Evidence & Arguments") {
      const result = userRole === "voter"
      console.log("[v0] Evidence stage - can comment:", result)
      return result
    }
    console.log("[v0] Default case - can comment: false")
    return false
  }

  const canVote = () => {
    return caseData.status.stage === "Voting" && userRole === "voter"
  }

  const handleVote = (voteType: "keep" | "delete") => {
    if (!voteReason.trim()) {
      alert("Please provide a reason for your vote")
      return
    }
    setVote(voteType)
    // TODO: Send vote to backend
    alert(`Voted to ${voteType} this case with reason: ${voteReason}`)
  }

  const handleSubmitEvidence = () => {
    if (!newEvidence.trim()) return
    // TODO: Submit evidence to backend with AI verification
    alert("Evidence submitted for AI verification")
    setNewEvidence("")
  }

  const handleSubmitArgument = () => {
    if (!newArgument.trim()) return
    // TODO: Submit argument to backend
    alert("Argument submitted")
    setNewArgument("")
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    console.log("[v0] Adding comment:", newComment)

    const comment: Comment = {
      id: Date.now().toString(),
      author: "CurrentUser",
      reputation: 42,
      role: userRole,
      content: newComment,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      replies: [],
    }

    setComments([...comments, comment])
    setNewComment("")
    console.log("[v0] Comment added successfully, total comments:", comments.length + 1)
  }

  const handleCommentVote = (commentId: string, voteType: "upvote" | "downvote") => {
    console.log("[v0] Voting on comment:", commentId, voteType)

    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          const updatedComment = { ...comment }
          if (voteType === "upvote") {
            updatedComment.upvotes += 1
          } else {
            updatedComment.downvotes += 1
          }
          console.log("[v0] Comment vote updated:", updatedComment)
          return updatedComment
        }
        return comment
      }),
    )
  }

  const getEvidenceBadgeColor = (authenticity: string) => {
    switch (authenticity) {
      case "Authentic":
        return "bg-green-100 text-green-800"
      case "Non-Authentic Evidence":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Case ID: <span className="text-gray-900">{caseData.caseId}</span>
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCaseId}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Copy Case ID"
            >
              <Copy className="h-4 w-4" />
            </Button>
            {copiedCaseId && <span className="text-sm text-green-600 font-medium">Copied!</span>}
          </div>

          <h2 className="text-xl text-gray-800 mb-3">{getPartiesDisplay()}</h2>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant={caseData.type === "evidence" ? "default" : "secondary"}>
              {caseData.type === "evidence" ? "Evidence-Based" : "Opinion-Based"}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getStatusMessage()}
            </Badge>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const defendantName = `${caseData.defendant.firstName}${caseData.defendant.lastName ? " " + caseData.defendant.lastName : ""}`
                window.location.hash = `#/defendant/${encodeURIComponent(defendantName)}`
              }}
              className="flex items-center gap-2"
              data-cta-id="view_defendant_profile"
              data-section="case_page"
            >
              <User className="h-4 w-4" />
              View {caseData.defendant.firstName}'s Profile
            </Button>
          </div>
        </div>

        <StatusTracker currentStage={caseData.status.stage} deadline={caseData.status.deadlineUtc} />
      </Card>

      {/* Case Summary Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Summary</h2>
        <div className="prose max-w-none mb-4">
          <p className="text-gray-700 leading-relaxed">{caseData.meta.summaryOneLine}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>
            Relationship: <strong>{caseData.relationship}</strong>
          </span>
          <span>•</span>
          <span>
            Submitted: <strong>{new Date(caseData.meta.createdAt).toLocaleDateString()}</strong>
          </span>
        </div>

        {/* Evidence Display */}
        {caseData.evidence.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Submitted Evidence</h3>
            <div className="space-y-3">
              {caseData.evidence.map((evidence) => (
                <div key={evidence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700">{evidence.filename}</span>
                    <Badge variant="outline" className="text-xs">
                      by {evidence.submittedBy}
                    </Badge>
                  </div>
                  <Badge className={getEvidenceBadgeColor(evidence.authenticity)}>
                    {evidence.authenticity === "Authentic"
                      ? "✓ AI Verified"
                      : evidence.authenticity === "Non-Authentic Evidence"
                        ? "⚠ AI Flagged"
                        : "Neutral"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Evidence & Arguments Section */}
      {canSubmitEvidence() && (
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Submit Evidence & Arguments</h2>
            <Badge variant="outline" className="text-xs">
              3-day window
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Evidence (will be AI verified)
              </label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="mb-2" />
              <p className="text-xs text-gray-500">
                Supported formats: PDF, Images, Documents. Files will be automatically verified for authenticity.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Written Argument</label>
              <Textarea
                placeholder="Provide your argument or additional context..."
                value={newArgument}
                onChange={(e) => setNewArgument(e.target.value)}
                rows={4}
              />
              <Button onClick={handleSubmitArgument} className="mt-2" disabled={!newArgument.trim()}>
                Submit Argument
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Voting Section */}
      {canVote() && (
        <Card className="p-6 mb-6 border-orange-200 bg-orange-50">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-orange-900">Community Voting</h2>
          </div>

          <p className="text-orange-800 mb-4">
            Decide whether this case should be kept on the defendant's profile or deleted. Vote counts are hidden until
            the verdict to prevent bias.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-orange-800 mb-2">Reason for your vote (required):</label>
              <Textarea
                placeholder="Provide a one-sentence reason for your decision..."
                value={voteReason}
                onChange={(e) => setVoteReason(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant={vote === "keep" ? "default" : "outline"}
                onClick={() => handleVote("keep")}
                className="flex items-center gap-2"
                disabled={!voteReason.trim()}
              >
                <ThumbsUp className="h-4 w-4" />
                Keep Case
              </Button>
              <Button
                variant={vote === "delete" ? "destructive" : "outline"}
                onClick={() => handleVote("delete")}
                className="flex items-center gap-2"
                disabled={!voteReason.trim()}
              >
                <ThumbsDown className="h-4 w-4" />
                Delete Case
              </Button>
            </div>

            {vote && (
              <div className="p-3 bg-green-100 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Your vote to <strong>{vote}</strong> has been recorded. Reason: "{voteReason}"
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Verdict Section */}
      {caseData.status.stage === "Verdict" && (
        <Card className="p-6 mb-6 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold text-purple-900">Final Verdict</h2>
          </div>

          <div className="text-center py-6">
            <div className="text-3xl font-bold text-purple-900 mb-2">Case {vote === "delete" ? "DELETED" : "KEPT"}</div>
            <p className="text-purple-800">
              {vote === "delete"
                ? "This case has been removed from the defendant's profile. The defendant is now shown as 'Denul' (universal deleted label)."
                : "This case remains on the defendant's profile as determined by community vote."}
            </p>
          </div>

          <div className="mt-4 p-4 bg-white rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Vote Results:</h3>
            <div className="flex justify-between text-sm">
              <span>
                Keep: <strong>45 votes</strong>
              </span>
              <span>
                Delete: <strong>23 votes</strong>
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Community Discussion */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Community Discussion ({comments.length})
        </h2>

        {/* Discussion Rules */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {caseData.status.stage === "Voting" &&
              "Only voters can comment during voting period. No replies allowed until verdict."}
            {caseData.status.stage === "Verdict" &&
              "Full community discussions are now open. All users can comment and reply."}
            {caseData.status.stage === "Published" &&
              "All users can comment on published cases. Share your thoughts and experiences!"}
            {caseData.status.stage === "Evidence & Arguments" &&
              "Only voters can comment during evidence phase to reduce influence."}
          </p>
        </div>

        {/* Add Comment */}
        {canComment() ? (
          <div className="mb-6">
            <div className="mb-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
              [DEBUG] Comment input should be visible - Stage: {caseData.status.stage}, Role: {userRole}, Can comment:{" "}
              {canComment().toString()}
            </div>
            <Textarea
              placeholder="Share your thoughts on this case..."
              value={newComment}
              onChange={(e) => {
                console.log("[v0] Comment input changed:", e.target.value)
                setNewComment(e.target.value)
              }}
              onFocus={() => console.log("[v0] Comment textarea focused")}
              onBlur={() => console.log("[v0] Comment textarea blurred")}
              className="mb-3"
              rows={3}
            />
            <Button
              onClick={() => {
                console.log("[v0] Comment submit button clicked")
                handleAddComment()
              }}
              disabled={!newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Post Comment
            </Button>
            <div className="mt-2 text-xs text-gray-500">
              [DEBUG] Button disabled: {(!newComment.trim()).toString()}, Comment length: {newComment.length}
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800">
              [DEBUG] Cannot comment - Stage: {caseData.status.stage}, Role: {userRole}
            </p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <Badge variant="outline" className="text-xs">
                    Rep: {comment.reputation}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {comment.role}
                  </Badge>
                  <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{comment.content}</p>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    console.log("[v0] Upvote button clicked for comment:", comment.id)
                    handleCommentVote(comment.id, "upvote")
                  }}
                >
                  <ThumbsUp className="h-4 w-4" />
                  {comment.upvotes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    console.log("[v0] Downvote button clicked for comment:", comment.id)
                    handleCommentVote(comment.id, "downvote")
                  }}
                >
                  <ThumbsDown className="h-4 w-4" />
                  {comment.downvotes}
                </Button>
                {caseData.status.stage === "Verdict" && (
                  <Button variant="ghost" size="sm">
                    Reply
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {comments.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No comments yet.{" "}
            {canComment()
              ? "Be the first to share your thoughts!"
              : "Comments will be available based on case stage and your role."}
          </p>
        )}
      </Card>
    </div>
  )
}
