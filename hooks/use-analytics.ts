"use client"

import { useEffect } from "react"
import { analytics } from "@/lib/analytics"

export function usePageTracking() {
  useEffect(() => {
    // Track initial page view
    analytics.trackPageView()

    // Track hash changes (for our hash-based routing)
    const handleHashChange = () => {
      analytics.trackPageView()
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])
}

export function useCTATracking() {
  useEffect(() => {
    // Add click listeners to all elements with data-cta-id
    const handleCTAClick = (e: Event) => {
      const target = e.target as HTMLElement
      const ctaElement = target.closest("[data-cta-id]") as HTMLElement

      if (ctaElement) {
        const ctaId = ctaElement.getAttribute("data-cta-id") || ""
        const label = ctaElement.textContent?.trim() || ""
        const section = ctaElement.getAttribute("data-section") || "unknown"

        analytics.trackCTAClick(ctaId, label, section)
      }
    }

    document.addEventListener("click", handleCTAClick)
    return () => document.removeEventListener("click", handleCTAClick)
  }, [])
}

export function useAnalytics() {
  return analytics
}
