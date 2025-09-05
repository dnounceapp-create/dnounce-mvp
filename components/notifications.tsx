"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Check, X, AlertCircle, Info, CheckCircle, Clock } from "lucide-react"

interface Notification {
  id: string
  type: "defendant_notification" | "plaintiff_update" | "community_deadline" | "verdict" | "evidence_request"
  title: string
  message: string
  caseId?: string
  timestamp: string
  read: boolean
  priority: "high" | "medium" | "low"
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "defendant_notification",
      title: "New Case Filed Against You",
      message:
        "A case has been submitted naming you as defendant. Case ID: DE12345. You have rights to respond and request deletion through community voting.",
      caseId: "DE12345",
      timestamp: "2024-01-20T14:30:00Z",
      read: false,
      priority: "high",
    },
    {
      id: "2",
      type: "plaintiff_update",
      title: "Case Classification Complete",
      message:
        "Your case OP67890 has been classified as Experience-Based. AI verification is complete and the case will be published soon.",
      caseId: "OP67890",
      timestamp: "2024-01-20T10:15:00Z",
      read: false,
      priority: "medium",
    },
    {
      id: "3",
      type: "community_deadline",
      title: "Voting Deadline Approaching",
      message: "Case DE12345 voting ends in 6 hours. Make sure to cast your vote to help the community decide.",
      caseId: "DE12345",
      timestamp: "2024-01-19T18:00:00Z",
      read: true,
      priority: "medium",
    },
    {
      id: "4",
      type: "verdict",
      title: "Case Verdict: Keep",
      message: "The community has voted to KEEP case OP11111. The case will remain visible on the defendant's profile.",
      caseId: "OP11111",
      timestamp: "2024-01-19T12:30:00Z",
      read: true,
      priority: "low",
    },
    {
      id: "5",
      type: "evidence_request",
      title: "Evidence & Arguments Phase Started",
      message:
        "Case DE12345 has entered the Evidence & Arguments phase. You can now submit additional evidence and participate in discussions.",
      caseId: "DE12345",
      timestamp: "2024-01-18T16:45:00Z",
      read: true,
      priority: "medium",
    },
  ])

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === "high" ? "text-red-600" : priority === "medium" ? "text-yellow-600" : "text-blue-600"

    switch (type) {
      case "defendant_notification":
        return <AlertCircle className={`h-5 w-5 ${iconClass}`} />
      case "plaintiff_update":
        return <Info className={`h-5 w-5 ${iconClass}`} />
      case "community_deadline":
        return <Clock className={`h-5 w-5 ${iconClass}`} />
      case "verdict":
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />
      case "evidence_request":
        return <Bell className={`h-5 w-5 ${iconClass}`} />
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Notifications</h1>
          <p className="text-gray-600">Stay updated on your cases, community activities, and important deadlines.</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Notification Types Info */}
      <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Notification Types</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <h3 className="font-medium mb-2">Case Notifications:</h3>
            <ul className="space-y-1">
              <li>• New cases filed against you</li>
              <li>• Case classification updates</li>
              <li>• Evidence & Arguments phase</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Community Alerts:</h3>
            <ul className="space-y-1">
              <li>• Voting deadlines</li>
              <li>• Community verdicts</li>
              <li>• Discussion updates</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">System Updates:</h3>
            <ul className="space-y-1">
              <li>• AI verification complete</li>
              <li>• Publication notifications</li>
              <li>• Platform announcements</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
          <p className="text-gray-600">You're all caught up! New notifications will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 transition-all ${!notification.read ? "bg-blue-50 border-blue-200" : "bg-white"}`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </h3>
                        <Badge className={getPriorityColor(notification.priority)} variant="outline">
                          {notification.priority}
                        </Badge>
                        {!notification.read && <Badge className="bg-blue-600 text-white">New</Badge>}
                      </div>

                      <p className="text-gray-600 mb-3">{notification.message}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                        {notification.caseId && (
                          <span>
                            Case ID: <strong>{notification.caseId}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {notification.caseId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (window.location.hash = `#/case/${notification.caseId}`)}
                        >
                          View Case
                        </Button>
                      )}

                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Notification Settings */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <p className="text-gray-600 mb-4">
          Manage how you receive notifications. Email and SMS notifications are sent for high-priority alerts.
        </p>
        <div className="space-y-2">
          <Button variant="outline" disabled className="w-full sm:w-auto bg-transparent">
            Email Settings (Coming Soon)
          </Button>
          <Button variant="outline" disabled className="w-full sm:w-auto ml-0 sm:ml-2 bg-transparent">
            SMS Settings (Coming Soon)
          </Button>
        </div>
      </Card>
    </div>
  )
}
