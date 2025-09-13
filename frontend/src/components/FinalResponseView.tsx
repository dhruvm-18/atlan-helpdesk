import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MessageSquare, ExternalLink, Sparkles, CheckCircle } from 'lucide-react'

// Simple markdown renderer component
function MarkdownRenderer({ content }: { content: string }) {
  const renderMarkdown = (text: string) => {
    if (!text) return text

    // Convert markdown to HTML-like structure
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-primary">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-4 mb-2 text-primary">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-2 text-primary">$1</h1>')
      
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
      
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg my-2 overflow-x-auto"><code class="text-sm">$1</code></pre>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-primary hover:underline">$1</a>')
      
      // Bullet points
      .replace(/^\* (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
      
      // Numbered lists
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')
      
      // Line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')

    return html
  }

  return (
    <div 
      className="prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  )
}

interface FinalResponseViewProps {
  response: {
    type: 'rag' | 'routed'
    response: string
    sources: string[]
  }
}

// Confetti component
function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([])

  useEffect(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
    setParticles(newParticles)

    const timer = setTimeout(() => setParticles([]), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{ scale: 0, y: 0 }}
          animate={{ 
            scale: [0, 1, 0],
            y: [-100, -200],
            rotate: [0, 360]
          }}
          transition={{
            duration: 3,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  )
}

export function FinalResponseView({ response }: FinalResponseViewProps) {
  // Add safety checks
  if (!response) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No response data available
        </CardContent>
      </Card>
    )
  }

  const isRouted = response.type === 'routed'
  const responseText = response.response || 'No response text available'
  const sources = response.sources || []

  return (
    <Card className={`relative ${isRouted ? 'border-green-200 dark:border-green-800' : 'border-blue-200 dark:border-blue-800'}`}>
      {isRouted && <Confetti />}
      
      <CardHeader className={isRouted ? 'bg-green-50 dark:bg-green-950/30' : 'bg-blue-50 dark:bg-blue-950/30'}>
        <CardTitle className={`flex items-center gap-2 ${isRouted ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}`}>
          {isRouted ? (
            <>
              <CheckCircle className="h-5 w-5" />
              📋 Ticket Routed to Specialist Team
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              🤖 AI-Generated Response
            </>
          )}
        </CardTitle>
        <p className={`text-xs mt-1 ${isRouted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
          {isRouted 
            ? 'Your query has been classified and routed to the appropriate specialist team. They will respond with personalized assistance.'
            : 'AI has analyzed the documentation and provided a comprehensive response below.'
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Response Type Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <Badge 
            variant={isRouted ? "default" : "secondary"}
            className={isRouted ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isRouted ? "📋 Routed to Specialist Team" : "🤖 AI-Generated Response"}
          </Badge>
        </motion.div>

        {/* Message with Markdown Support */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-lg ${
            isRouted 
              ? 'bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800' 
              : 'bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800'
          }`}
        >
          <div className="leading-relaxed">
            <MarkdownRenderer content={responseText} />
          </div>
        </motion.div>

        {/* Citations */}
        {sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-sm">Sources & Citations</span>
              </div>
              
              <div className="space-y-2">
                {sources.map((source, index) => (
                  <motion.div
                    key={source}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto p-3 justify-start text-left"
                      onClick={() => window.open(source, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="text-xs break-all">{source}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Success Animation for Routed Tickets */}
        {isRouted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="text-center py-4"
          >
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm text-muted-foreground">
              Ticket successfully classified and routed!
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}