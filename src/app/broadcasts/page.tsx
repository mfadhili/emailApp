"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Mail, Send, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Broadcast, Contact } from "@/lib/models"
import { getBroadcasts, getBroadcastById, getContacts } from "@/lib/actions"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BroadcastsPage() {
    const { toast } = useToast()
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null)
    const [broadcastContacts, setBroadcastContacts] = useState<Contact[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredBroadcasts, setFilteredBroadcasts] = useState<Broadcast[]>([])
    const [dateFilter, setDateFilter] = useState<string>("all")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState("10")

    useEffect(() => {
        const loadBroadcasts = async () => {
            try {
                const broadcastsData = await getBroadcasts()
                setBroadcasts(broadcastsData)
                setFilteredBroadcasts(broadcastsData)
            } catch (error) {
                console.error("Error loading broadcasts:", error)
                toast({
                    title: "Error",
                    description: "Failed to load broadcasts",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadBroadcasts()
    }, [toast])

    useEffect(() => {
        let result = [...broadcasts]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter((broadcast) => broadcast.subject.toLowerCase().includes(query))
        }

        // Apply date filter
        if (dateFilter !== "all") {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            const lastWeek = new Date(today)
            lastWeek.setDate(lastWeek.getDate() - 7)
            const lastMonth = new Date(today)
            lastMonth.setMonth(lastMonth.getMonth() - 1)

            result = result.filter((broadcast) => {
                const sentDate = new Date(broadcast.sentAt)
                switch (dateFilter) {
                    case "today":
                        return sentDate >= today
                    case "yesterday":
                        return sentDate >= yesterday && sentDate < today
                    case "lastWeek":
                        return sentDate >= lastWeek
                    case "lastMonth":
                        return sentDate >= lastMonth
                    default:
                        return true
                }
            })
        }

        setFilteredBroadcasts(result)
        setCurrentPage(1) // Reset to first page when filters change
    }, [broadcasts, searchQuery, dateFilter])

    // Pagination logic
    const totalItems = filteredBroadcasts.length
    const itemsPerPageNumber = Number.parseInt(itemsPerPage)
    const totalPages = Math.ceil(totalItems / itemsPerPageNumber)

    const paginatedBroadcasts = filteredBroadcasts.slice(
        (currentPage - 1) * itemsPerPageNumber,
        currentPage * itemsPerPageNumber,
    )

    const handleViewBroadcast = async (id: string) => {
        try {
            const broadcast = await getBroadcastById(id)
            setSelectedBroadcast(broadcast)

            // Get all contacts to show who received the broadcast
            const allContacts = await getContacts()

            // Filter contacts based on broadcast recipient settings
            let recipientContacts: Contact[] = []

            if (broadcast) {
                if (broadcast.recipients.type === "all") {
                    recipientContacts = allContacts
                } else if (broadcast.recipients.type === "tags" && broadcast.recipients.tags) {
                    recipientContacts = allContacts.filter((contact) =>
                        contact.tags?.some((tag) => broadcast.recipients.tags?.includes(tag)),
                    )
                }
            }

            setBroadcastContacts(recipientContacts)
        } catch (error) {
            console.error("Error loading broadcast details:", error)
            toast({
                title: "Error",
                description: "Failed to load broadcast details",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Email Broadcasts</h1>
                    <p className="text-muted-foreground">View and manage your sent email campaigns.</p>
                </div>
                <Link href="/broadcasts/new">
                    <Button className="bg-whatsapp-lightgreen hover:bg-whatsapp-green">
                        <Send className="h-4 w-4 mr-2" />
                        New Broadcast
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search broadcasts..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="yesterday">Yesterday</SelectItem>
                            <SelectItem value="lastWeek">Last 7 Days</SelectItem>
                            <SelectItem value="lastMonth">Last 30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="itemsPerPage" className="text-sm whitespace-nowrap">
                            Show:
                        </Label>
                        <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                            <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Sent Date</TableHead>
                            <TableHead>Recipients</TableHead>
                            <TableHead>Opens</TableHead>
                            <TableHead>Clicks</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        <span className="ml-2">Loading broadcasts...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedBroadcasts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    {searchQuery || dateFilter !== "all" ? "No broadcasts match your search" : "No broadcasts sent yet"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedBroadcasts.map((broadcast) => {
                                const broadcastId = typeof broadcast._id === "string" ? broadcast._id : broadcast._id?.toString() || ""
                                return (
                                    <TableRow key={broadcastId}>
                                        <TableCell className="font-medium">{broadcast.subject}</TableCell>
                                        <TableCell>{new Date(broadcast.sentAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{broadcast.stats.total}</TableCell>
                                        <TableCell>
                                            {broadcast.stats.opens} ({Math.round((broadcast.stats.opens / broadcast.stats.total) * 100) || 0}
                                            %)
                                        </TableCell>
                                        <TableCell>
                                            {broadcast.stats.clicks} (
                                            {Math.round((broadcast.stats.clicks / broadcast.stats.total) * 100) || 0}%)
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => handleViewBroadcast(broadcastId)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {filteredBroadcasts.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPageNumber + 1} to{" "}
                        {Math.min(currentPage * itemsPerPageNumber, totalItems)} of {totalItems} broadcasts
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm">
                            Page {currentPage} of {totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Broadcast View Dialog */}
            {selectedBroadcast && (
                <Dialog open={!!selectedBroadcast} onOpenChange={(open) => !open && setSelectedBroadcast(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>{selectedBroadcast.subject}</DialogTitle>
                            <DialogDescription>
                                Sent on {new Date(selectedBroadcast.sentAt).toLocaleString()} to {selectedBroadcast.stats.total}{" "}
                                recipients
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="content" className="mt-4">
                            <TabsList>
                                <TabsTrigger value="content">Email Content</TabsTrigger>
                                <TabsTrigger value="stats">Statistics</TabsTrigger>
                                <TabsTrigger value="recipients">Recipients</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="mt-4">
                                <ScrollArea className="h-[400px] rounded-md border p-4">
                                    <div dangerouslySetInnerHTML={{ __html: selectedBroadcast.html }} />
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="stats" className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{selectedBroadcast.stats.total}</div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {selectedBroadcast.recipients.type === "all"
                                                    ? "All contacts"
                                                    : `Filtered by tags: ${selectedBroadcast.recipients.tags?.join(", ") || ""}`}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Opens</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {selectedBroadcast.stats.opens}
                                                <span className="text-sm font-normal text-muted-foreground ml-1">
                          ({Math.round((selectedBroadcast.stats.opens / selectedBroadcast.stats.total) * 100) || 0}%)
                        </span>
                                            </div>
                                            <div className="w-full bg-muted h-2 rounded-full mt-2">
                                                <div
                                                    className="bg-whatsapp-lightgreen h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.round((selectedBroadcast.stats.opens / selectedBroadcast.stats.total) * 100) || 0}%`,
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {selectedBroadcast.stats.clicks}
                                                <span className="text-sm font-normal text-muted-foreground ml-1">
                          ({Math.round((selectedBroadcast.stats.clicks / selectedBroadcast.stats.total) * 100) || 0}%)
                        </span>
                                            </div>
                                            <div className="w-full bg-muted h-2 rounded-full mt-2">
                                                <div
                                                    className="bg-whatsapp-gold h-2 rounded-full"
                                                    style={{
                                                        width: `${Math.round((selectedBroadcast.stats.clicks / selectedBroadcast.stats.total) * 100) || 0}%`,
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="recipients" className="mt-4">
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Country</TableHead>
                                                <TableHead>Tags</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {broadcastContacts.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                        No recipient data available
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                broadcastContacts.map((contact) => (
                                                    <TableRow key={contact._id?.toString()}>
                                                        <TableCell className="font-medium">{contact.name}</TableCell>
                                                        <TableCell>{contact.email}</TableCell>
                                                        <TableCell>{contact.country || "-"}</TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {contact.tags && contact.tags.length > 0 ? (
                                                                    contact.tags.map((tag) => (
                                                                        <Badge key={tag} variant="outline" className="bg-whatsapp-lime/10">
                                                                            {tag}
                                                                        </Badge>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-muted-foreground">-</span>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            )}

            {broadcasts.length === 0 && !isLoading && !searchQuery && dateFilter === "all" && (
                <div className="flex justify-center">
                    <div className="text-center space-y-4 py-8">
                        <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">No broadcasts yet</h3>
                            <p className="text-muted-foreground max-w-md">
                                You haven't sent any email broadcasts yet. Create your first email campaign to get started.
                            </p>
                            <Link href="/broadcasts/new">
                                <Button className="bg-whatsapp-lightgreen hover:bg-whatsapp-green">
                                    <Send className="h-4 w-4 mr-2" />
                                    Create New Broadcast
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

