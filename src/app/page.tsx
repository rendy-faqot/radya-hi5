'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  Heart,
  Sparkles,
  Trophy,
  LogOut,
  Search,
  Check,
  X,
  Send,
  Award,
  BarChart3,
} from 'lucide-react'
import values from '@/lib/values.json'
import { getIcon } from '@/lib/icons'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showAdmin, setShowAdmin] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [selectedValue, setSelectedValue] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [kudos, setKudos] = useState<any[]>([])
  const [kudosLoading, setKudosLoading] = useState(true)
  const [showCelebration, setShowCelebration] = useState(false)
  const [activeTab, setActiveTab] = useState<'give' | 'received'>('give')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.isAdmin) {
      setShowAdmin(true)
    }
  }, [status, session, router])

  useEffect(() => {
    if (session) {
      fetchUsers()
      fetchKudos()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      setUsersLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchKudos = async () => {
    try {
      setKudosLoading(true)
      const response = await fetch('/api/kudos/list')
      const data = await response.json()
      setKudos(data.kudos || [])
    } catch (error) {
      console.error('Error fetching kudos:', error)
    } finally {
      setKudosLoading(false)
    }
  }

  const toggleRecipient = (userId: string) => {
    if (selectedRecipients.includes(userId)) {
      setSelectedRecipients(selectedRecipients.filter((id) => id !== userId))
    } else if (selectedRecipients.length < 3) {
      setSelectedRecipients([...selectedRecipients, userId])
    }
  }

  const handleSubmit = async () => {
    if (!selectedValue || selectedRecipients.length === 0 || !message.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/kudos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientIds: selectedRecipients,
          valueId: selectedValue,
          message: message.trim(),
        }),
      })

      if (response.ok) {
        // Show celebration animation
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)

        // Reset form
        setSelectedRecipients([])
        setSelectedValue(null)
        setMessage('')
        setSearchQuery('')

        // Refresh kudos list
        fetchKudos()
      }
    } catch (error) {
      console.error('Error submitting kudos:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const selectedValueData = values.find((v) => v.id === selectedValue)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-blue-900/20">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: 3,
                  repeatType: 'reverse',
                }}
                className="text-9xl mb-4"
              >
                🎉
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-2"
              >
                Hi5 Sent!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/80"
              >
                Keep spreading the positivity! ✨
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <Heart className="w-8 h-8 text-blue-500 fill-blue-500" />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 bg-blue-400/30 rounded-full blur-md"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Radya Hi5 - Built on Values. Driven by People.
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Spread positivity</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              {showAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="hidden sm:flex"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                  <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:block">{session.user?.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Give Kudos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-blue-500" />
                  Give Kudos
                </CardTitle>
                <CardDescription>Recognize someone for their amazing work!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Select Recipients */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Select Recipients
                    </label>
                    <Badge variant="secondary" className="text-xs">
                      {selectedRecipients.length}/3
                    </Badge>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <ScrollArea className="h-48 rounded-lg border">
                    <div className="p-2 space-y-2">
                      {usersLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Sparkles className="w-6 h-6 text-blue-500" />
                          </motion.div>
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                      ) : (
                        filteredUsers.map((user) => (
                          <motion.button
                            key={user.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleRecipient(user.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                              selectedRecipients.includes(user.id)
                                ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.image || ''} alt={user.name || ''} />
                              <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            {selectedRecipients.includes(user.id) && (
                              <Check className="w-5 h-5 text-blue-600" />
                            )}
                          </motion.button>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                {/* Select Value */}
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Choose a RADYA Value
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {values.map((value) => {
                      const IconComponent = (value.icon as any) ? getIcon(value.icon) : Award
                      return (
                        <motion.button
                          key={value.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedValue(value.id)}
                          className={`p-3 rounded-lg text-center transition-all ${
                            selectedValue === value.id
                              ? `${value.color} text-white shadow-lg scale-105`
                              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <IconComponent className="w-6 h-6 mx-auto mb-1" />
                          <p className="text-xs font-medium">{value.name}</p>
                        </motion.button>
                      )
                    })}
                  </div>
                  {selectedValueData && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      {selectedValueData.description}
                    </motion.p>
                  )}
                </div>

                <Separator />

                {/* Message */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Your Message</label>
                  <Textarea
                    placeholder="Share why this person deserves kudos..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 text-right">{message.length}/500</p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={
                    !selectedValue ||
                    selectedRecipients.length === 0 ||
                    !message.trim() ||
                    isSubmitting
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-blue-700 text-white font-medium"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2"
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Hi5 🎉
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Recent Kudos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Recent Hi5s
                </CardTitle>
                <CardDescription>See the latest appreciation in your team</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {kudosLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-8 h-8 text-blue-500 mb-4" />
                        </motion.div>
                        <p className="text-gray-500 text-sm">Loading recent hi5s...</p>
                      </div>
                    ) : kudos.length === 0 ? (
                      <div className="text-center py-12">
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-6xl mb-4"
                        >
                          🌟
                        </motion.div>
                        <p className="text-gray-500">No Hi5s yet. Be the first to spread positivity!</p>
                      </div>
                    ) : (
                      kudos.map((kudo, index) => {
                        const valueData = values.find((v) => v.id === kudo.value)
                        const IconComponent = valueData?.icon
                          ? getIcon(valueData.icon)
                          : Award

                        return (
                          <motion.div
                            key={kudo.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 border border-blue-100 dark:border-blue-900/30"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={kudo.sender.image || ''} alt={kudo.sender.name || ''} />
                                <AvatarFallback>{kudo.sender.name?.[0] || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{kudo.sender.name}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(kudo.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                              <Badge className={`${valueData?.color || 'bg-blue-500'} text-white`}>
                                <IconComponent className="w-3 h-3 mr-1" />
                                {valueData?.name || kudo.value}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 italic">
                              "{kudo.message}"
                            </p>

                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-gray-400" />
                              <div className="flex -space-x-2">
                                {kudo.recipients.map((recipient: any) => (
                                  <Avatar key={recipient.user.id} className="h-6 w-6 border-2 border-white dark:border-gray-800" title={recipient.user.name}>
                                    <AvatarImage src={recipient.user.image || ''} alt={recipient.user.name || ''} />
                                    <AvatarFallback className="text-xs">
                                      {recipient.user.name?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500 ml-2">
                                {kudo.recipients.map((r: any) => r.user.name).join(', ')}
                              </span>
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
