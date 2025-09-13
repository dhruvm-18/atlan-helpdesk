import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUIStore } from '@/store/ui'
import { Card, CardContent } from '@/components/ui/card'

const TOPICS = [
  'How-to', 'Product', 'Connector', 'Lineage', 'API/SDK', 
  'SSO', 'Glossary', 'Best practices', 'Sensitive data'
]

const SENTIMENTS = ['Frustrated', 'Curious', 'Angry', 'Neutral']
const PRIORITIES = ['P0', 'P1', 'P2']
const CHANNELS = ['whatsapp', 'email', 'voice', 'live_chat', 'other']

export function Filters() {
  const { filters, setFilters, resetFilters } = useUIStore()

  const handleTopicToggle = (topic: string) => {
    const newTopics = filters.topics.includes(topic)
      ? filters.topics.filter(t => t !== topic)
      : [...filters.topics, topic]
    setFilters({ topics: newTopics })
  }

  const hasActiveFilters = 
    filters.topics.length > 0 || 
    filters.sentiment || 
    filters.priority || 
    filters.channel || 
    filters.search

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.sentiment}
              onValueChange={(value) => setFilters({ sentiment: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                {SENTIMENTS.map(sentiment => (
                  <SelectItem key={sentiment} value={sentiment}>
                    {sentiment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value) => setFilters({ priority: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITIES.map(priority => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.channel}
              onValueChange={(value) => setFilters({ channel: value === 'all' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {CHANNELS.map(channel => (
                  <SelectItem key={channel} value={channel}>
                    {channel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Topic Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Topics:</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(topic => (
                <Badge
                  key={topic}
                  variant={filters.topics.includes(topic) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleTopicToggle(topic)}
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}