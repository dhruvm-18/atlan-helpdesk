import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTickets } from '@/lib/api'
import { useUIStore } from '@/store/ui'
import { TicketTable } from './TicketTable'
import { Filters } from './Filters'
import { Charts } from './Charts'
import { DetailsDrawer } from './DetailsDrawer'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Dashboard() {
  const { data: tickets, isLoading, error } = useTickets()
  const { filters } = useUIStore()

  // Filter tickets based on current filters
  const filteredTickets = tickets?.filter(ticket => {
    if (!ticket.classification) return false
    
    // Topic filter - handle both array and string formats
    if (filters.topics.length > 0) {
      let hasMatchingTopic = false
      
      if (Array.isArray(ticket.classification.topics)) {
        // Old format with topics array
        hasMatchingTopic = ticket.classification.topics.some(topic => 
          filters.topics.includes(topic)
        )
      } else if (ticket.classification.topic) {
        // New format with single topic string
        hasMatchingTopic = filters.topics.includes(ticket.classification.topic)
      }
      
      if (!hasMatchingTopic) return false
    }
    
    // Sentiment filter
    if (filters.sentiment && ticket.classification.sentiment !== filters.sentiment) {
      return false
    }
    
    // Priority filter
    if (filters.priority && ticket.classification.priority !== filters.priority) {
      return false
    }
    
    // Channel filter
    if (filters.channel && ticket.channel !== filters.channel) {
      return false
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const textMatch = ticket.text.toLowerCase().includes(searchLower)
      if (!textMatch) return false
    }
    
    return true
  }) || []

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading tickets: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Filters />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Tickets ({filteredTickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ))}
                </div>
              ) : (
                <TicketTable tickets={filteredTickets} />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Charts tickets={filteredTickets} isLoading={isLoading} />
        </motion.div>
      </div>

      <DetailsDrawer />
    </div>
  )
}