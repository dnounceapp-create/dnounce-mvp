"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface LandingPageProps {
  onSearchFocus: () => void
}

export function LandingPage({ onSearchFocus }: LandingPageProps) {
  const handleNotificationClick = () => {
    window.location.hash = "#/notification-search"
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">DNounce – A Community Accountability Platform</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Like Yelp and Google Reviews but for individuals/small groups. Share your experiences with them.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => (window.location.hash = "#/submit")} className="px-8 py-3">
            Submit a Case
          </Button>
          <Button variant="outline" size="lg" onClick={handleNotificationClick} className="px-8 py-3 bg-transparent">
            I received a notification
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => (window.location.hash = "#/explore")}
            className="px-8 py-3 bg-transparent"
          >
            Explore Cases
          </Button>
        </div>
      </div>

      {/* How it Works */}
      <Card className="p-8 mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">How it works</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm font-medium">
            <strong>Note:</strong> Evidence is not required but encouraged. All cases can be requested for deletion by
            defendants. If a defendant proceeds with a deletion request, the case enters the Evidence & Arguments phase
            followed by community voting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Case Submitted</h3>
            <p className="text-gray-600 text-sm">
              Write a detailed case about someone you would like to review. A profile will be automatically created for
              the individual unless one already exists.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Parties Notified</h3>
            <p className="text-gray-600 text-sm">Both plaintiff and defendant are automatically notified</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Published</h3>
            <p className="text-gray-600 text-sm">Case goes live on defendant's profile</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              4
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Evidence & Arguments</h3>
            <p className="text-gray-600 text-sm">
              3-day period for both parties to submit evidence and debates (which is why it's highly recommended to
              submit evidence when submitting your case to strengthen your position)
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              5
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Community Voting</h3>
            <p className="text-gray-600 text-sm">48-hour voting period: Keep or Delete</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              6
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verdict Applied</h3>
            <p className="text-gray-600 text-sm">
              Case is either kept public or deleted from defendant profile based on community decision
            </p>
          </div>
        </div>
      </Card>

      {/* Footer Disclaimer */}
      <div className="text-center text-sm text-gray-500 border-t pt-8">
        <p>
          DNounce is a community accountability platform. Cases are user-submitted, verified for authenticity, and
          moderated by the community. DNounce provides a space for sharing experiences and community-driven
          accountability.
        </p>
      </div>
    </div>
  )
}
