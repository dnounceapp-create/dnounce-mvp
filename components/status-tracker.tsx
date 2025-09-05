interface StatusTrackerProps {
  currentStage: string
  hasDeadline: boolean
}

const STAGES = [
  "AI Verification",
  "Parties Notified",
  "Published",
  "Evidence & Arguments",
  "Cooling",
  "Voting",
  "Verdict",
]

export function StatusTracker({ currentStage, hasDeadline }: StatusTrackerProps) {
  const currentIndex = STAGES.indexOf(currentStage)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STAGES.map((stage, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div key={stage} className="flex items-center flex-1">
              {/* Circle */}
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                ${isActive ? "bg-blue-600 text-white" : ""}
                ${isCompleted ? "bg-green-600 text-white" : ""}
                ${isUpcoming ? "bg-gray-200 text-gray-600" : ""}
              `}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* Label */}
              <div className="ml-2 flex-1">
                <div
                  className={`
                  text-xs font-medium
                  ${isActive ? "text-blue-600" : ""}
                  ${isCompleted ? "text-green-600" : ""}
                  ${isUpcoming ? "text-gray-500" : ""}
                `}
                >
                  {stage}
                </div>
              </div>

              {/* Connector Line */}
              {index < STAGES.length - 1 && (
                <div
                  className={`
                  h-0.5 flex-1 mx-2
                  ${index < currentIndex ? "bg-green-600" : "bg-gray-200"}
                `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
