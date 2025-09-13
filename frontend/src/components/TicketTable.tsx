import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { useUIStore } from '@/store/ui'
import { formatDate, truncateText } from '@/lib/utils'
import type { Ticket } from '@/lib/api'

interface TicketTableProps {
  tickets: Ticket[]
}

const channelColors = {
  email: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  whatsapp: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  voice: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  live_chat: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

const priorityColors = {
  'P0': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'P1': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'P2': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'P0 (High)': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  'P1 (Medium)': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  'P2 (Low)': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
}

const sentimentColors = {
  Frustrated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  Angry: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-200',
  Curious: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

export function TicketTable({ tickets }: TicketTableProps) {
  const { setSelectedTicket } = useUIStore()

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">No tickets found matching your filters.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket, index) => (
        <motion.div
          key={ticket.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.05,
            ease: "easeOut"
          }}
          className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-1 bg-card"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm text-muted-foreground">
                  {ticket.id}
                </span>
                <Badge 
                  variant="outline" 
                  className={channelColors[ticket.channel]}
                >
                  {ticket.channel}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(ticket.createdAt)}
                </span>
              </div>
              
              <p className="text-sm leading-relaxed">
                {truncateText(ticket.text, 200)}
              </p>
              
              {ticket.classification && (
                <motion.div 
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Handle both array and string topic formats */}
                  {Array.isArray(ticket.classification.topics) 
                    ? ticket.classification.topics.map((topic, topicIndex) => (
                        <motion.div
                          key={topic}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            delay: 0.3 + topicIndex * 0.1,
                            type: "spring",
                            stiffness: 200
                          }}
                        >
                          <Badge variant="secondary">
                            {topic}
                          </Badge>
                        </motion.div>
                      ))
                    : ticket.classification.topic && (
                        <motion.div
                          key={ticket.classification.topic}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            delay: 0.3,
                            type: "spring",
                            stiffness: 200
                          }}
                        >
                          <Badge variant="secondary">
                            {ticket.classification.topic}
                          </Badge>
                        </motion.div>
                      )
                  }
                  
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
                      className={sentimentColors[ticket.classification.sentiment]}
                    >
                      {ticket.classification.sentiment}
                    </Badge>
                  </motion.div>
                  
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      delay: 0.5,
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    <Badge 
                      variant="outline"
                      className={priorityColors[ticket.classification.priority as keyof typeof priorityColors] || priorityColors['P2']}
                    >
                      {ticket.classification.priority}
                    </Badge>
                  </motion.div>
                </motion.div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTicket(ticket.id)}
              className="ml-4"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}