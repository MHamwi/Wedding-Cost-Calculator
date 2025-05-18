"use client"

import React, { useEffect } from "react"
import { Pie } from "@visx/shape"
import { Group } from "@visx/group"
import { useLanguage } from "@/contexts/language-context"
import { useSpring, animated } from "react-spring"

interface CostItem {
  name: string
  value: number
  icon: React.ReactNode
}

interface CostChartProps {
  costItems: CostItem[]
}

// Chart colors - vibrant and distinct
const CHART_COLORS = [
  "#facc15", // honeymoon - yellow
  "#10b981", // wedding - green
  "#3b82f6", // mahr - blue
  "#8b5cf6", // rent - purple
  "#f97316"  // extras - orange
]

// Legend colors - different from chart colors
const LEGEND_COLORS = [
  "#eab308", // honeymoon - darker yellow
  "#059669", // wedding - darker green
  "#2563eb", // mahr - darker blue
  "#7c3aed", // rent - darker purple
  "#ea580c"  // extras - darker orange
]

// Main component that selects the appropriate chart based on language
export function CostChart({ costItems }: CostChartProps) {
  const { language } = useLanguage()
  
  // Filter and validate cost items
  const validCostItems = costItems
    .map((item) => ({
      ...item,
      value: Number(item.value) || 0
    }))
    .filter((item) => item.value > 0)

  // Show empty state if no valid data
  if (validCostItems.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-muted-foreground">
          {language === "ar" ? "لا توجد بيانات لعرضها" : "No data to display"}
        </p>
      </div>
    )
  }

  // Render the appropriate language-specific chart
  return language === "ar" ? (
    <ArabicChart costItems={validCostItems} />
  ) : (
    <EnglishChart costItems={validCostItems} />
  )
}

// English-specific chart implementation
function EnglishChart({ costItems }: { costItems: CostItem[] }) {
  const width = 400
  const height = 400
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const radius = Math.min(width, height) / 2 - 40
  const centerX = width / 2
  const centerY = height / 2
  const total = costItems.reduce((acc, item) => acc + item.value, 0)
  
  // Animation trigger state
  const [isVisible, setIsVisible] = React.useState(true)
  const [animationKey, setAnimationKey] = React.useState(0)

  // Handle visibility changes and initial mount
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible')
      if (document.visibilityState === 'visible') {
        setAnimationKey(prev => prev + 1)
      }
    }

    // Set initial visibility
    setIsVisible(document.visibilityState === 'visible')
    setAnimationKey(prev => prev + 1)

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Handle data changes
  React.useEffect(() => {
    if (isVisible) {
      setAnimationKey(prev => prev + 1)
    }
  }, [costItems, isVisible])
  
  // Animation for the pie slices
  const pieAnimation = useSpring({
    from: { opacity: 0, scale: 0.8, rotate: -90 },
    to: { opacity: 1, scale: 1, rotate: 0 },
    config: { tension: 120, friction: 14 },
    delay: 50,
    immediate: !isVisible,
    reset: true,
    key: animationKey
  })
  
  // Animation for the labels
  const labelAnimation = useSpring({
    from: { opacity: 0, translateY: 10 },
    to: { opacity: 1, translateY: 0 },
    delay: 400,
    config: { tension: 120, friction: 14 },
    reset: true,
    key: animationKey // Reset animation when key changes
  })

  return (
    <div className="w-full flex flex-col items-center">
      <animated.div style={pieAnimation} className="w-full">
        <svg width={width} height={height}>
          <Group top={centerY + margin.top} left={centerX + margin.left}>
            <Pie
              data={costItems}
              pieValue={(d) => d.value}
              outerRadius={radius}
              innerRadius={radius * 0.6}
              cornerRadius={4}
              padAngle={0.01}
            >
              {(pie) =>
                pie.arcs.map((arc, index) => {
                  const [centroidX, centroidY] = pie.path.centroid(arc)
                  const percent = (arc.data.value / total) * 100

                  return (
                    <g key={`arc-${index}`}>
                      <animated.path
                        d={pie.path(arc) || ""}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        style={{ opacity: pieAnimation.opacity }}
                      />
                      <animated.text
                        x={centroidX}
                        y={centroidY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        style={{
                          fontFamily: "Arial, sans-serif",
                          fontSize: "12px",
                          fontWeight: "bold",
                          opacity: labelAnimation.opacity
                        }}
                      >
                        {`${Math.round(percent)}%`}
                      </animated.text>
                    </g>
                  )
                })
              }
            </Pie>
          </Group>
        </svg>
      </animated.div>

      {/* Legend with animation */}
      <animated.div 
        className="flex flex-wrap justify-center mt-4 gap-4 text-sm"
        style={{ opacity: labelAnimation.opacity }}
      >
        {costItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: LEGEND_COLORS[index % LEGEND_COLORS.length] }}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </animated.div>
    </div>
  )
}

// Arabic-specific chart implementation
function ArabicChart({ costItems }: { costItems: CostItem[] }) {
  const width = 400
  const height = 400
  const margin = { top: 20, right: 20, bottom: 20, left: 20 }
  const radius = Math.min(width, height) / 2 - 40
  const centerX = width / 2
  const centerY = height / 2
  const total = costItems.reduce((acc, item) => acc + item.value, 0)

  // Animation trigger state
  const [isVisible, setIsVisible] = React.useState(true)
  const [animationKey, setAnimationKey] = React.useState(0)

  // Handle visibility changes and initial mount
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible')
      if (document.visibilityState === 'visible') {
        setAnimationKey(prev => prev + 1)
      }
    }

    // Set initial visibility
    setIsVisible(document.visibilityState === 'visible')
    setAnimationKey(prev => prev + 1)

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Handle data changes
  React.useEffect(() => {
    if (isVisible) {
      setAnimationKey(prev => prev + 1)
    }
  }, [costItems, isVisible])

  // Animation for the pie slices
  const pieAnimation = useSpring({
    from: { opacity: 0, scale: 0.8, rotate: -90 },
    to: { opacity: 1, scale: 1, rotate: 0 },
    config: { tension: 120, friction: 14 },
    delay: 50,
    immediate: !isVisible,
    reset: true,
    key: animationKey
  })
  
  // Animation for the labels
  const labelAnimation = useSpring({
    from: { opacity: 0, translateY: 10 },
    to: { opacity: 1, translateY: 0 },
    delay: 400,
    config: { tension: 120, friction: 14 },
    immediate: !isVisible,
    reset: true,
    key: animationKey
  })

  return (
    <div dir="rtl" className="w-full flex flex-col items-center">
      {/* Force LTR for SVG to prevent chart shape mirroring */}
      <animated.div style={pieAnimation} className="w-full">
        <svg width={width} height={height} style={{ direction: "ltr" }}>
          <Group top={centerY + margin.top} left={centerX + margin.left}>
            <Pie
              data={costItems}
              pieValue={(d) => d.value}
              outerRadius={radius}
              innerRadius={radius * 0.6}
              cornerRadius={4}
              padAngle={0.01}
            >
              {(pie) =>
                pie.arcs.map((arc, index) => {
                  const [centroidX, centroidY] = pie.path.centroid(arc)
                  const percent = (arc.data.value / total) * 100

                  return (
                    <g key={`arc-${index}`}>
                      <animated.path
                        d={pie.path(arc) || ""}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        style={{ opacity: pieAnimation.opacity }}
                      />
                      <animated.text
                        x={-centroidX}
                        y={centroidY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        style={{
                          direction: "ltr",
                          fontFamily: "Arial, sans-serif",
                          fontSize: "12px",
                          fontWeight: "bold",
                          transform: "scale(-1, 1)", // Mirror text for Arabic
                          opacity: labelAnimation.opacity
                        }}
                      >
                        {`${Math.round(percent)}%`}
                      </animated.text>
                    </g>
                  )
                })
              }
            </Pie>
          </Group>
        </svg>
      </animated.div>

      {/* Legend with RTL direction and animation */}
      <animated.div 
        dir="rtl" 
        className="flex flex-wrap justify-center mt-4 gap-4 text-sm"
        style={{ opacity: labelAnimation.opacity }}
      >
        {costItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: LEGEND_COLORS[index % LEGEND_COLORS.length] }}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </animated.div>
    </div>
  )
}
