import { BarChart, LineChart, PieChart } from './Chart'

export function DashboardWidget({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function TaskStatusChart({ tasks = [] }) {
  const statusCounts = tasks.reduce((acc, task) => {
    const status = task.status || 'UNKNOWN'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(statusCounts).map(([label, value]) => ({
    label: label.replace('_', ' '),
    value
  }))

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-white/50">
        <p>No task data available</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <BarChart data={chartData} width={300} height={200} color="#8b5cf6" />
    </div>
  )
}

export function ProjectProgressChart({ projects = [] }) {
  const progressData = projects.slice(0, 5).map(project => {
    // Calculate progress based on tasks if available
    const totalTasks = project.tasks?.length || 0
    const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    return {
      label: project.title?.substring(0, 10) || 'Project',
      value: progress
    }
  })

  if (progressData.length === 0) {
    return (
      <div className="text-center py-8 text-white/50">
        <p>No project data available</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <BarChart data={progressData} width={300} height={200} color="#ec4899" />
    </div>
  )
}

export function TimeTrackingChart({ timeLogs = [] }) {
  // Group by date (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const dailyHours = last7Days.map(date => {
    // In a real implementation, you'd filter timeLogs by date
    // For now, we'll use mock data structure
    return {
      label: date,
      value: Math.floor(Math.random() * 8) // Mock data
    }
  })

  return (
    <div className="flex justify-center">
      <LineChart data={dailyHours} width={400} height={200} color="#10b981" />
    </div>
  )
}

export function BidStatusChart({ bids = [] }) {
  const statusCounts = bids.reduce((acc, bid) => {
    const status = bid.status || 'UNKNOWN'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(statusCounts).map(([label, value]) => ({
    label: label.replace('_', ' '),
    value
  }))

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-white/50">
        <p>No bid data available</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <PieChart data={chartData} size={200} />
    </div>
  )
}

