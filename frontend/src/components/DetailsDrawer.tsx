import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUIStore } from '@/store/ui'
import { useTickets } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export function DetailsDrawer() {
  const { selectedTicketId, isDetailsDrawerOpen, setDetailsDrawerOpen } = useUIStore()
  const { data: tickets = [] } = useTickets()
  
  const selectedTicket = tickets.find(t => t.id === selectedTicketId)

  return (
    <AnimatePresence>
      {isDetailsDrawerOpen && selectedTicket && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setDetailsDrawerOpen(false)}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l shadow-xl z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Ticket Details</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDetailsDrawerOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ticket ID</label>
                      <p className="font-mono">{selectedTicket.id}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Channel</label>
                      <div className="mt-1">
                        <Badge variant="outline">{selectedTicket.channel}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created At</label>
                      <p>{formatDate(selectedTicket.createdAt)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.text}
                    </p>
                  </CardContent>
                </Card>

                {/* Classification */}
                {selectedTicket.classification && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Classification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Topics</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedTicket.classification.topics.map(topic => (
                            <Badge key={topic} variant="secondary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Sentiment</label>
                        <div className="mt-1">
                          <Badge variant="outline">
                            {selectedTicket.classification.sentiment}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Priority</label>
                        <div className="mt-1">
                          <Badge 
                            variant={selectedTicket.classification.priority === 'P0' ? 'destructive' : 'outline'}
                          >
                            {selectedTicket.classification.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Suggested Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suggested Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {selectedTicket.classification?.topics.includes('Connector') && (
                        <p>• Check connector documentation and permissions</p>
                      )}
                      {selectedTicket.classification?.topics.includes('Lineage') && (
                        <p>• Verify data source connections and metadata refresh</p>
                      )}
                      {selectedTicket.classification?.topics.includes('API/SDK') && (
                        <p>• Review API documentation and authentication setup</p>
                      )}
                      {selectedTicket.classification?.priority === 'P0' && (
                        <p className="text-red-600 font-medium">• Escalate to senior support immediately</p>
                      )}
                      <p>• Follow up within 24 hours</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}