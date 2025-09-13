import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Tag, Heart, AlertTriangle } from 'lucide-react'

interface AnalysisViewProps {
  analysis: {
    topic: string
    sentiment: string
    priority: string
  }
}

export function AnalysisView({ analysis }: AnalysisViewProps) {
  // Add safety checks
  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No analysis data available
        </CardContent>
      </Card>
    )
  }

  const topic = analysis.topic || 'Unknown'
  const sentiment = analysis.sentiment || 'Neutral'
  const priority = analysis.priority || 'P2 (Low)'

  const priorityColor = {
    'P0': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    'P0 (High)': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    'P1': 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    'P1 (Medium)': 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    'P2': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    'P2 (Low)': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
  }[priority] || 'text-gray-600 bg-gray-50 border-gray-200'

  const sentimentColor = {
    Frustrated: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    Angry: 'text-red-700 bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700',
    Curious: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    Neutral: 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800'
  }[sentiment] || 'text-gray-600 bg-gray-50 border-gray-200'

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="bg-purple-50 dark:bg-purple-950/30">
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Brain className="h-5 w-5" />
          AI Classification Analysis
        </CardTitle>
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
          Internal processing results - not shown to customer
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Topics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Topics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: 0.2,
                type: "spring",
                stiffness: 200
              }}
            >
              <Badge variant="secondary" className="text-sm">
                {topic}
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* Sentiment */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-4 w-4 text-pink-600" />
            <span className="font-medium">Sentiment</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.4,
              type: "spring",
              stiffness: 200
            }}
          >
            <Badge 
              variant="outline" 
              className={`text-sm ${sentimentColor}`}
            >
              {sentiment}
            </Badge>
          </motion.div>
        </motion.div>

        {/* Priority */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="font-medium">Priority</span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.6,
              type: "spring",
              stiffness: 200
            }}
          >
            <Badge 
              variant="outline" 
              className={`text-sm font-semibold ${priorityColor}`}
            >
              {priority}
            </Badge>
          </motion.div>
        </motion.div>

        {/* JSON View */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-3 bg-muted rounded-lg"
        >
          <pre className="text-xs text-muted-foreground overflow-x-auto">
            {JSON.stringify(analysis, null, 2)}
          </pre>
        </motion.div>
      </CardContent>
    </Card>
  )
}