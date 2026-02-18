'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Trophy,
  ArrowLeft,
  TrendingUp,
  Award,
  Heart,
  Users,
  Calendar,
  BarChart3,
} from 'lucide-react'
import values from '@/lib/values.json'
import { getIcon } from '@/lib/icons'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWeeks, setSelectedWeeks] = useState(4)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    } else if (session?.user?.isAdmin !== true) {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchStats()
    }
  }, [session, selectedWeeks])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/stats?weeks=${selectedWeeks}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-blue-900/20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <BarChart3 className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-blue-900/20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Radya Hi5 Dashboard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hi5 analytics & insights</p>
              </div>
            </motion.div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-1.5 shadow-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedWeeks}
                  onChange={(e) => setSelectedWeeks(Number(e.target.value))}
                  className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                >
                  <option value={1}>Last Week</option>
                  <option value={2}>Last 2 Weeks</option>
                  <option value={4}>Last 4 Weeks</option>
                  <option value={8}>Last 8 Weeks</option>
                  <option value={12}>Last 12 Weeks</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Overview Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-green-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Total Kudos</p>
                    <p className="text-3xl font-bold">{stats?.totalKudosOverall || 0}</p>
                  </div>
                  <Heart className="w-12 h-12 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-green-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">This Week</p>
                    <p className="text-3xl font-bold">{stats?.totalKudosThisWeek || 0}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Active Givers</p>
                    <p className="text-3xl font-bold">{stats?.mostGiven?.length || 0}</p>
                  </div>
                  <Users className="w-12 h-12 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm mb-1">Top Values</p>
                    <p className="text-3xl font-bold">{stats?.mostValues?.length || 0}</p>
                  </div>
                  <Award className="w-12 h-12 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Leaderboards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Most Received Kudos */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Most Received Hi5s
                </CardTitle>
                <CardDescription>Top 10 people who received the most Hi5s</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {stats?.mostReceived?.map((item: any, index: number) => {
                      const maxValue = Math.max(...(stats?.mostReceived?.map((i: any) => i.count) || [1]))

                      return (
                        <motion.div
                          key={item.user?.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-900/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.user?.image || ''} alt={item.user?.name || ''} />
                              <AvatarFallback>{item.user?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.user?.name || 'Unknown'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.count / maxValue) * 100}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                  />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                                  {item.count}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    }) || <p className="text-center text-gray-500 py-8">No data yet</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Most Given Kudos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-500" />
                  Most Given Kudos
                </CardTitle>
                <CardDescription>Top 10 people who gave the most kudos</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {stats?.mostGiven?.map((item: any, index: number) => {
                      const maxValue = Math.max(...(stats?.mostGiven?.map((i: any) => i.count) || [1]))

                      return (
                        <motion.div
                          key={item.user?.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-rose-50 dark:from-blue-900/20 dark:to-rose-900/20 border border-blue-100 dark:border-blue-900/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-rose-500 text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={item.user?.image || ''} alt={item.user?.name || ''} />
                              <AvatarFallback>{item.user?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.user?.name || 'Unknown'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(item.count / maxValue) * 100}%` }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="h-full bg-gradient-to-r from-blue-400 to-rose-500 rounded-full"
                                  />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
                                  {item.count}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    }) || <p className="text-center text-gray-500 py-8">No data yet</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Most Popular Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Most Popular Values
                </CardTitle>
                <CardDescription>Top values being celebrated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats?.mostValues?.map((item: any, index: number) => {
                    const valueData = values.find((v) => v.id === item.value)
                    const IconComponent = valueData?.icon
                      ? getIcon(valueData.icon)
                      : Award
                    const maxValue = Math.max(...(stats?.mostValues?.map((i: any) => i._count.id) || [1]))

                    return (
                      <motion.div
                        key={item.value}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl bg-gradient-to-br ${valueData?.color || 'from-blue-500 to-green-500'} text-white shadow-lg`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <IconComponent className="w-6 h-6" />
                          <Badge className="bg-white/20 text-white border-white/30">
                            #{index + 1}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-1">{valueData?.name || item.value}</h3>
                        <p className="text-sm opacity-90 mb-3">{valueData?.description || ''}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden mr-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(item._count.id / maxValue) * 100}%` }}
                              transition={{ duration: 0.5, delay: index * 0.05 }}
                              className="h-full bg-white rounded-full"
                            />
                          </div>
                          <span className="text-sm font-bold">{item._count.id}</span>
                        </div>
                      </motion.div>
                    )
                  }) || <p className="text-center text-gray-500 py-8 col-span-full">No data yet</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
