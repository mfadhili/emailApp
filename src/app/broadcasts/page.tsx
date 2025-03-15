"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, Mail, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Broadcast } from "@/lib/models"
import { getBroadcasts, getBroadcastById } from "@/lib/actions"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

export default function BroadcastsPage() {
    const { toast } = useToast()
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    useEffect(() => {
        const loadBroadcasts = async () => {
            try {
                const broadcastsData = await getBroadcasts()
                setBroadcasts(broadcastsData)
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

    const handleViewBroadcast = async (id: string) => {
        try {
            const broadcast = await getBroadcastById(id)
            setSelectedBroadcast(broadcast)
        } catch (error) {
            console.error("Error loading broadcast details:", error)
            toast({
                title: "Error",
                description: "Failed to load broadcast details",
                variant: "destructive",
            })
        }
    }

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = broadcasts.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(broadcasts.length / itemsPerPage)

    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber)
        }
    }

    // Generate page numbers for pagination
    const pageNumbers = []
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Email Broadcasts</h1>
                        <p className="text-muted-foreground">View and manage your sent email campaigns.</p>
                    </div>
                    <Link href="/broadcasts/new">
                        <Button>
                            <Send className="h-4 w-4 mr-2" />
                            New Broadcast
                        </Button>
                    </Link>
                </div>

                <div className="rounded-md border">
                    <ScrollArea className="h-[calc(100vh-300px)]">
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
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            Loading broadcasts...
                                        </TableCell>
                                    </TableRow>
                                ) : currentItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No broadcasts sent yet
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentItems.map((broadcast) => (
                                        <TableRow key={broadcast._id?.toString()}>
                                            <TableCell>{broadcast.subject}</TableCell>
                                            <TableCell>{new Date(broadcast.sentAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{broadcast.stats.total}</TableCell>
                                            <TableCell>
                                                {broadcast.stats.opens} ({Math.round((broadcast.stats.opens / broadcast.stats.total) * 100)}%)
                                            </TableCell>
                                            <TableCell>
                                                {broadcast.stats.clicks} ({Math.round((broadcast.stats.clicks / broadcast.stats.total) * 100)}%)
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleViewBroadcast(broadcast._id as string)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-3xl max-h-[90vh]">
                                                        <ScrollArea className="max-h-[80vh]">
                                                            <DialogHeader>
                                                                <DialogTitle>{selectedBroadcast?.subject}</DialogTitle>
                                                                <DialogDescription>
                                                                    Sent on {selectedBroadcast && new Date(selectedBroadcast.sentAt).toLocaleDateString()}{" "}
                                                                    to {selectedBroadcast?.stats.total} recipients
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="mt-4 border rounded-md p-4">
                                                                <div dangerouslySetInnerHTML={{ __html: selectedBroadcast?.html || "" }} />
                                                            </div>
                                                        </ScrollArea>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                {/* Pagination */}
                {broadcasts.length > 0 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => paginate(currentPage - 1)}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>

                            {pageNumbers.map((number) => {
                                // Show first page, last page, current page, and pages around current page
                                if (number === 1 || number === totalPages || (number >= currentPage - 1 && number <= currentPage + 1)) {
                                    return (
                                        <PaginationItem key={number}>
                                            <PaginationLink onClick={() => paginate(number)} isActive={currentPage === number}>
                                                {number}
                                            </PaginationLink>
                                        </PaginationItem>
                                    )
                                }

                                // Show ellipsis for gaps
                                if (number === 2 && currentPage > 3) {
                                    return (
                                        <PaginationItem key="ellipsis-start">
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )
                                }

                                if (number === totalPages - 1 && currentPage < totalPages - 2) {
                                    return (
                                        <PaginationItem key="ellipsis-end">
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    )
                                }

                                return null
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => paginate(currentPage + 1)}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}

                <div className="flex justify-center">
                    {broadcasts.length === 0 && !isLoading && (
                        <div className="text-center space-y-4 py-8">
                            <Mail className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div className="space-y-2">
                                <h3 className="text-lg font-medium">No broadcasts yet</h3>
                                <p className="text-muted-foreground max-w-md">
                                    You haven't sent any email broadcasts yet. Create your first email campaign to get started.
                                </p>
                                <Link href="/broadcasts/new">
                                    <Button>
                                        <Send className="h-4 w-4 mr-2" />
                                        Create New Broadcast
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

