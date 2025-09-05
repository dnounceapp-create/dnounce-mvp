// Analytics utilities for GA4 and PostHog tracking

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
}

interface UserIdentity {
  anon_id: string
  email_hash?: string
  email_domain?: string
}

declare var gtag: any // Declare gtag variable
declare var posthog: any // Declare posthog variable

class Analytics {
  private anonId: string
  private isInitialized = false

  constructor() {
    this.anonId = this.getOrCreateAnonId()
  }

  private getOrCreateAnonId(): string {
    if (typeof window === "undefined") return ""

    let anonId = localStorage.getItem("dnounce_anon_id")
    if (!anonId) {
      anonId = "anon_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
      localStorage.setItem("dnounce_anon_id", anonId)
    }
    return anonId
  }

  private getBaseProperties() {
    if (typeof window === "undefined") return {}

    const urlParams = new URLSearchParams(window.location.search)
    return {
      anon_id: this.anonId,
      path: window.location.pathname + window.location.hash,
      title: document.title,
      ts: new Date().toISOString(),
      utm_source: urlParams.get("utm_source") || undefined,
      utm_medium: urlParams.get("utm_medium") || undefined,
      utm_campaign: urlParams.get("utm_campaign") || undefined,
    }
  }

  private hashEmail(email: string): string {
    // Simple hash function for email privacy
    let hash = 0
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return "hash_" + Math.abs(hash).toString(36)
  }

  private getEmailDomain(email: string): string {
    return email.split("@")[1] || ""
  }

  // Initialize analytics (call this once on app start)
  init() {
    if (this.isInitialized || typeof window === "undefined") return

    console.log("[v0] Analytics initialized with anon_id:", this.anonId)

    // Initialize GA4 (placeholder - would need actual GA4 setup)
    if (typeof gtag !== "undefined") {
      gtag("config", "GA_MEASUREMENT_ID", {
        custom_map: { custom_parameter_1: "anon_id" },
      })
    }

    // Initialize PostHog (placeholder - would need actual PostHog setup)
    if (typeof posthog !== "undefined") {
      posthog.init("POSTHOG_KEY", {
        api_host: "https://app.posthog.com",
      })
    }

    this.isInitialized = true
  }

  // Track page views
  trackPageView(path?: string) {
    const properties = {
      ...this.getBaseProperties(),
      path: path || (typeof window !== "undefined" ? window.location.pathname + window.location.hash : ""),
    }

    this.track("page_viewed", properties)
  }

  // Track CTA clicks
  trackCTAClick(ctaId: string, label: string, section: string) {
    this.track("cta_clicked", {
      ...this.getBaseProperties(),
      cta_id: ctaId,
      label,
      section,
    })
  }

  // Track case form events
  trackCaseFormViewed() {
    this.track("case_form_viewed", this.getBaseProperties())
  }

  trackCaseFormStarted() {
    this.track("case_form_started", this.getBaseProperties())
  }

  trackCaseFormCompleted(caseId: string, relationship: string, hasCity: boolean, hasState: boolean) {
    this.track("case_form_completed", {
      ...this.getBaseProperties(),
      case_id: caseId,
      relationship,
      has_city: hasCity,
      has_state: hasState,
    })
  }

  // Track survey events
  trackSurveyShown(caseId?: string) {
    this.track("survey_shown", {
      ...this.getBaseProperties(),
      case_id: caseId,
    })
  }

  trackSurveySubmitted(surveyData: any) {
    this.track("survey_submitted", {
      ...this.getBaseProperties(),
      case_id: surveyData.caseId,
      ease_of_use: surveyData.easeOfUse,
      understood_purpose: surveyData.understoodPurpose,
      future_use: surveyData.futureUse,
      liked_len: surveyData.likedMost?.length || 0,
      improve_len: surveyData.wouldImprove?.length || 0,
    })
  }

  // Track pre-launch opt-in
  trackPrelaunchOptIn(email: string, source: string, caseId?: string) {
    this.track("prelaunch_opt_in", {
      ...this.getBaseProperties(),
      email_domain: this.getEmailDomain(email),
      source,
      case_id: caseId,
    })

    // Also identify user in PostHog with hashed email
    if (typeof posthog !== "undefined") {
      posthog.identify(this.hashEmail(email))
    }
  }

  trackEvent(eventName: string, properties: Record<string, any> = {}) {
    this.track(eventName, {
      ...this.getBaseProperties(),
      ...properties,
    })
  }

  // Generic track method
  private track(eventName: string, properties: Record<string, any>) {
    console.log("[v0] Analytics event:", eventName, properties)

    // Send to GA4
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, {
        custom_parameter_1: properties.anon_id,
        ...properties,
      })
    }

    // Send to PostHog
    if (typeof posthog !== "undefined") {
      posthog.capture(eventName, properties)
    }

    // Fallback: send to console for development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${eventName}:`, properties)
    }
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Hook for React components
export function useAnalytics() {
  return analytics
}

// Utility to add CTA tracking to elements
export function withCTATracking(ctaId: string, label: string, section: string) {
  return {
    "data-cta-id": ctaId,
    onClick: (e: any) => {
      analytics.trackCTAClick(ctaId, label, section)
      // Don't prevent default - let the original click handler run
    },
  }
}
