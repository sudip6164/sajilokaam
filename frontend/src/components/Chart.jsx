// Simple SVG-based chart components (no external dependencies)

export function BarChart({ data, width = 300, height = 200, color = '#8b5cf6' }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const barWidth = width / data.length - 10
  const maxBarHeight = height - 40

  return (
    <svg width={width} height={height} className="overflow-visible">
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * maxBarHeight
        const x = index * (barWidth + 10) + 5
        const y = height - barHeight - 20
        
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={4}
              className="hover:opacity-80 transition-opacity"
            />
            <text
              x={x + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              className="text-xs fill-white/60"
              fontSize="10"
            >
              {item.label}
            </text>
            <text
              x={x + barWidth / 2}
              y={y - 5}
              textAnchor="middle"
              className="text-xs fill-white"
              fontSize="11"
              fontWeight="600"
            >
              {item.value}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function LineChart({ data, width = 300, height = 200, color = '#8b5cf6' }) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1
  const pointSpacing = width / (data.length - 1 || 1)
  const chartHeight = height - 40

  const points = data.map((item, index) => {
    const x = index * pointSpacing
    const normalizedValue = (item.value - minValue) / range
    const y = chartHeight - (normalizedValue * chartHeight) + 10
    return { x, y, value: item.value, label: item.label }
  })

  const pathData = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = 10 + (chartHeight * (1 - ratio))
        return (
          <line
            key={i}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        )
      })}
      
      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        className="drop-shadow-lg"
      />
      
      {/* Points */}
      {points.map((point, index) => (
        <g key={index}>
          <circle
            cx={point.x}
            cy={point.y}
            r="4"
            fill={color}
            className="hover:r-6 transition-all"
          />
          <text
            x={point.x}
            y={point.y - 10}
            textAnchor="middle"
            className="text-xs fill-white"
            fontSize="10"
            fontWeight="600"
          >
            {point.value}
          </text>
        </g>
      ))}
      
      {/* X-axis labels */}
      {points.map((point, index) => (
        <text
          key={index}
          x={point.x}
          y={height - 5}
          textAnchor="middle"
          className="text-xs fill-white/60"
          fontSize="9"
        >
          {point.label}
        </text>
      ))}
    </svg>
  )
}

export function PieChart({ data, size = 200, colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentAngle = -90 // Start at top
  
  const radius = size / 2 - 20
  const centerX = size / 2
  const centerY = size / 2

  const slices = data.map((item, index) => {
    const percentage = item.value / total
    const angle = percentage * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle

    const startAngleRad = (startAngle * Math.PI) / 180
    const endAngleRad = (endAngle * Math.PI) / 180

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')

    return {
      pathData,
      color: colors[index % colors.length],
      percentage: (percentage * 100).toFixed(1),
      label: item.label,
      value: item.value
    }
  })

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="overflow-visible">
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.pathData}
            fill={slice.color}
            className="hover:opacity-80 transition-opacity cursor-pointer"
            stroke="#101820"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="space-y-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-sm text-white/70">{slice.label}</span>
            <span className="text-sm text-white font-semibold ml-auto">
              {slice.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

