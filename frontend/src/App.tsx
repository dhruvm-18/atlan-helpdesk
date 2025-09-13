import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/Header'
import { Dashboard } from '@/components/Dashboard'
import { AgentPanel } from '@/components/AgentPanel'
import { ChatBot } from '@/components/ChatBot'
import { useUIStore } from '@/store/ui'
import { motion } from 'framer-motion'
import { BarChart3, Bot } from 'lucide-react'

function App() {
  const { theme } = useUIStore()
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex h-[calc(100vh-80px)]">
        <Tabs defaultValue="dashboard" className="flex w-full h-full" orientation="vertical">
          {/* Left Sidebar Navigation */}
          <div className="w-64 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30 border-r">
            <TabsList className="flex flex-col h-auto w-full p-2 bg-transparent border-0 space-y-1">
              <TabsTrigger 
                value="dashboard" 
                className="w-full justify-start h-12 px-4 rounded-lg bg-transparent data-[state=active]:bg-primary/10 data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-primary font-medium transition-all duration-200 hover:bg-muted/50 hover:text-primary/80 border-0"
              >
                <motion.div 
                  className="flex items-center space-x-3 w-full"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium">Dashboard</span>
                </motion.div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="agent" 
                className="w-full justify-start h-12 px-4 rounded-lg bg-transparent data-[state=active]:bg-primary/10 data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-primary font-medium transition-all duration-200 hover:bg-muted/50 hover:text-primary/80 border-0"
              >
                <motion.div 
                  className="flex items-center space-x-3 w-full"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm font-medium">Agent</span>
                </motion.div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Right Side Content Area */}
          <div className="flex-1 overflow-auto bg-background">
            <TabsContent value="dashboard" className="h-full m-0 p-6 space-y-6">
              <Dashboard />
            </TabsContent>
            
            <TabsContent value="agent" className="h-full m-0 p-6 space-y-6">
              <AgentPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Floating ChatBot */}
      <ChatBot 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
      
      <Toaster />
    </div>
  )
}

export default App