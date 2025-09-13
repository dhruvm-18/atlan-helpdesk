import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAgentRespond } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { AnalysisView } from './AnalysisView'
import { FinalResponseView } from './FinalResponseView'
import { ErrorBoundary } from './ErrorBoundary'
import { Loader2, Send } from 'lucide-react'

interface AgentHistory {
  id: string
  text: string
  channel: string
  response: any
  timestamp: Date
}

export function AgentPanel() {
  const [text, setText] = useState('')
  const [channel, setChannel] = useState('email')
  const [history, setHistory] = useState<AgentHistory[]>([])
  const [currentResponse, setCurrentResponse] = useState<any>(null)
  
  const { mutate: agentRespond, isPending } = useAgentRespond()
  const { toast } = useToast()

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('agent-history')
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setHistory(parsedHistory)
      } catch (error) {
        console.error('Error loading history from localStorage:', error)
      }
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('agent-history', JSON.stringify(history))
    }
  }, [history])

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a ticket description",
        variant: "destructive"
      })
      return
    }

    agentRespond(
      { text, channel },
      {
        onSuccess: (response) => {
          console.log('Agent response received:', response)
          
          // Validate response structure
          if (!response || typeof response !== 'object') {
            console.error('Invalid response structure:', response)
            toast({
              title: "Error",
              description: "Received invalid response from server",
              variant: "destructive"
            })
            return
          }

          setCurrentResponse(response)
          
          // Add to history
          const newHistoryItem: AgentHistory = {
            id: Date.now().toString(),
            text,
            channel,
            response,
            timestamp: new Date()
          }
          setHistory(prev => [newHistoryItem, ...prev.slice(0, 4)]) // Keep last 5
          
          // Show success toast with ticket ID
          const ticketId = response.ticket_id || 'Unknown'
          if (response.type === 'routed') {
            toast({
              title: "Ticket Routed! 🎉",
              description: `Ticket ${ticketId} has been successfully classified and routed to the appropriate team.`,
            })
          } else {
            toast({
              title: "Answer Generated",
              description: `Ticket ${ticketId} saved. AI has provided a response with relevant documentation.`,
            })
          }
        },
        onError: (error) => {
          console.error('Agent response error:', error)
          toast({
            title: "Error",
            description: `Failed to process ticket: ${error.message}`,
            variant: "destructive"
          })
          
          // Clear any partial response
          setCurrentResponse(null)
        }
      }
    )
  }

  const handleHistorySelect = (item: AgentHistory) => {
    setText(item.text)
    setChannel(item.channel)
    setCurrentResponse(item.response)
  }

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              Interactive AI Agent
              <span className="text-sm font-normal text-muted-foreground ml-2">
                Submit tickets and questions for AI analysis
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground">Customer Query or Ticket</label>
                <span className="text-xs text-muted-foreground">
                  {text.length}/1000 characters
                </span>
              </div>
              <Textarea
                placeholder="Enter the customer's question or support ticket here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                maxLength={1000}
                className="resize-none text-sm leading-relaxed"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">Communication Channel</label>
                <Select value={channel} onValueChange={setChannel}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="voice">Voice Call</SelectItem>
                    <SelectItem value="live_chat">Live Chat</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">AI Behavior</label>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="font-medium text-green-600">📚 RAG Topics:</div>
                  <div className="pl-2">How-to, Product, Best practices, API/SDK, SSO</div>
                  <div className="font-medium text-blue-600 mt-1">🎯 Routed Topics:</div>
                  <div className="pl-2">Connector, Lineage, Glossary, Others</div>
                </div>
              </div>
              
              <Button 
                onClick={handleSubmit} 
                disabled={isPending || !text.trim()}
                className="h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Analyze & Respond
                  </>
                )}
              </Button>
            </div>
            

          </CardContent>
        </Card>
      </motion.div>

      {/* AI Response Display */}
      {currentResponse && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Section Header */}
          <div className="text-center py-4">
            <h2 className="text-2xl font-bold text-primary mb-2">🤖 AI Analysis Results</h2>
            <p className="text-muted-foreground mb-2">
              Below you can see both the internal AI analysis and the final customer response
            </p>
            {currentResponse.ticket_id && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-sm">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="font-medium text-primary">Saved as {currentResponse.ticket_id}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Internal Analysis (Back-end View) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">
                  Internal Analysis (Back-end View)
                </h3>
              </div>
              <ErrorBoundary>
                <AnalysisView analysis={currentResponse.analysis} />
              </ErrorBoundary>
            </motion.div>
            
            {/* Final Response (Front-end View) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                  Final Response (Front-end View)
                </h3>
              </div>
              <ErrorBoundary>
                <FinalResponseView response={currentResponse} />
              </ErrorBoundary>
            </motion.div>
          </div>
          
          {/* RAG Pipeline Indicator */}
          {currentResponse.type === 'rag' && currentResponse.sources && currentResponse.sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  RAG Pipeline Active
                </span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400">
                This response was generated using Retrieval-Augmented Generation (RAG) with content from Atlan's official documentation sources.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Enhanced Recent Queries */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-2 border-muted/50">
            <CardHeader className="bg-gradient-to-r from-muted/30 to-muted/10">
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                Recent Queries
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  Click to reload previous queries
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {history.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group p-4 border-2 border-muted/30 rounded-lg cursor-pointer hover:border-primary/30 hover:bg-muted/20 transition-all duration-200 hover:shadow-md"
                    onClick={() => handleHistorySelect(item)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                          item.response.type === 'rag' 
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {item.response.type === 'rag' ? '📚 RAG Response' : '🎯 Routed'}
                        </span>
                        {item.response.sources && item.response.sources.length > 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">
                            {item.response.sources.length} sources
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2 font-medium mb-2">
                      {item.text}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      Response: {item.response.response?.substring(0, 100)}...
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}