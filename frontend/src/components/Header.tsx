import { Moon, Sun, BarChart3, Users, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/ui'
import { useTickets } from '@/lib/api'
import { motion } from 'framer-motion'

export function Header() {
  const { theme, toggleTheme } = useUIStore()
  const { data: tickets = [] } = useTickets()

  // Calculate KPIs
  const totalTickets = tickets.length
  const p0Count = tickets.filter(t => t.classification?.priority === 'P0').length
  const p0Percentage = totalTickets > 0 ? Math.round((p0Count / totalTickets) * 100) : 0
  
  const topicCounts = tickets.reduce((acc, ticket) => {
    const topics = ticket.classification?.topics || []
    topics.forEach(topic => {
      acc[topic] = (acc[topic] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)
  
  const topTopic = Object.entries(topicCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'

  return (
    <header className="border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center space-x-3">
            <motion.img 
              src="/atlan-logo.svg" 
              alt="Atlan" 
              className="h-9 w-9"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-primary leading-tight">Atlan Helpdesk</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Support</p>
            </div>
          </div>
          
          {/* Center Section - KPI Strip */}
          <div className="hidden lg:flex items-center space-x-8 bg-muted/30 rounded-full px-6 py-2">
            <motion.div 
              className="flex items-center space-x-2 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="font-semibold text-sm">{totalTickets}</span>
              </div>
            </motion.div>
            
            <div className="w-px h-8 bg-border"></div>
            
            <motion.div 
              className="flex items-center space-x-2 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Critical</span>
                <span className="font-semibold text-sm text-red-600 dark:text-red-400">{p0Percentage}%</span>
              </div>
            </motion.div>
            
            <div className="w-px h-8 bg-border"></div>
            
            <motion.div 
              className="flex items-center space-x-2 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30">
                <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Top Topic</span>
                <span className="font-semibold text-sm truncate max-w-20">{topTopic}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Section - Theme Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full hover:bg-muted/80 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile KPI Strip */}
        <div className="lg:hidden mt-4 flex items-center justify-center space-x-4 bg-muted/30 rounded-lg px-4 py-3">
          <div className="flex items-center space-x-2 text-sm">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">{totalTickets}</span>
          </div>
          <div className="w-px h-4 bg-border"></div>
          <div className="flex items-center space-x-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-muted-foreground">P0:</span>
            <span className="font-semibold text-red-600">{p0Percentage}%</span>
          </div>
          <div className="w-px h-4 bg-border"></div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Topic:</span>
            <span className="font-semibold truncate max-w-16">{topTopic}</span>
          </div>
        </div>
      </div>
    </header>
  )
}