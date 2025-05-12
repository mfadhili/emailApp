"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Tag, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getTags, createTag, deleteTag, getContacts } from "@/lib/actions"
import type { Tag as TagType, Contact } from "@/lib/models"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"

export default function TagsPage() {
    const { toast } = useToast()
    const [tags, setTags] = useState<TagType[]>([])
    const [contacts, setContacts] = useState<Contact[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editingTag, setEditingTag] = useState<TagType | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredTags, setFilteredTags] = useState<TagType[]>([])
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [tagToDelete, setTagToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState("10")

    const [formData, setFormData] = useState({
        name: "",
        type: "custom" as "business" | "country" | "custom",
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const [tagsData, contactsData] = await Promise.all([getTags(), getContacts()])

                // Calculate actual tag counts from contacts
                const tagCounts: Record<string, number> = {}
                contactsData.forEach((contact) => {
                    if (contact.tags) {
                        contact.tags.forEach((tag) => {
                            tagCounts[tag] = (tagCounts[tag] || 0) + 1
                        })
                    }
                })

                // Update tag counts
                const updatedTags = tagsData.map((tag) => ({
                    ...tag,
                    count: tagCounts[tag.name] || 0,
                }))

                setTags(updatedTags)
                setFilteredTags(updatedTags)
                setContacts(contactsData)
            } catch (error) {
                console.error("Error loading data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load tags",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [toast])

    useEffect(() => {
        let result = [...tags]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter((tag) => tag.name.toLowerCase().includes(query))
        }

        setFilteredTags(result)
        setCurrentPage(1) // Reset to first page when filters change
    }, [tags, searchQuery])

    // Pagination logic
    const totalItems = filteredTags.length
    const itemsPerPageNumber = Number.parseInt(itemsPerPage)
    const totalPages = Math.ceil(totalItems / itemsPerPageNumber)

    const paginatedTags = filteredTags.slice((currentPage - 1) * itemsPerPageNumber, currentPage * itemsPerPageNumber)

    const resetForm = () => {
        setFormData({
            name: "",
            type: "custom",
        })
        setEditingTag(null)
    }

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            resetForm()
        }
    }

    const handleEditTag = (tag: TagType) => {
        setEditingTag(tag)
        setFormData({
            name: tag.name,
            type: tag.type,
        })
        setOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.name) {
            toast({
                title: "Missing information",
                description: "Please provide a tag name.",
                variant: "destructive",
            })
            return
        }

        try {
            if (editingTag) {
                // For now, we don't have an updateTag function, so we'll just show a message
                toast({
                    title: "Feature not available",
                    description: "Editing tags is not supported yet.",
                    variant: "destructive",
                })
                return
            } else {
                const newTag: Omit<TagType, "_id"> = {
                    name: formData.name,
                    type: formData.type,
                    count: 0,
                }

                await createTag(newTag)
                toast({
                    title: "Tag created",
                    description: "The tag has been created successfully.",
                })
            }

            // Refresh tags
            const updatedTags = await getTags()
            setTags(updatedTags)

            setOpen(false)
            resetForm()
        } catch (error) {
            console.error("Error saving tag:", error)
            toast({
                title: "Error",
                description: "Failed to save tag",
                variant: "destructive",
            })
        }
    }

    const handleDeleteTag = async (id: string) => {
        setTagToDelete(id)
        setConfirmDeleteOpen(true)
    }

    const confirmDeleteTag = async () => {
        if (!tagToDelete) return

        setIsDeleting(true)
        try {
            await deleteTag(tagToDelete)

            // Refresh tags
            const updatedTags = await getTags()
            setTags(updatedTags)

            toast({
                title: "Tag deleted",
                description: "The tag has been deleted successfully.",
            })
        } catch (error) {
            console.error("Error deleting tag:", error)
            toast({
                title: "Error",
                description: "Failed to delete tag",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
            setConfirmDeleteOpen(false)
            setTagToDelete(null)
        }
    }

    const getTagTypeLabel = (type: string) => {
        switch (type) {
            case "business":
                return "Business"
            case "country":
                return "Country"
            case "custom":
                return "Custom"
            default:
                return type
        }
    }

    const getTagTypeColor = (type: string) => {
        switch (type) {
            case "business":
                return "bg-blue/10"
            case "country":
                return "bg-green/10"
            case "custom":
                return "bg-blue-light/10"
            default:
                return ""
        }
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
                        <p className="text-muted-foreground">Manage tags to organize your contacts.</p>
                    </div>
                    <Dialog open={open} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue hover:bg-blue-dark">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Tag
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingTag ? "Edit Tag" : "Create New Tag"}</DialogTitle>
                                <DialogDescription>
                                    {editingTag ? "Update tag details" : "Create a new tag to organize your contacts."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Tag Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., VIP Client"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Tag Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, type: value as "business" | "country" | "custom" })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select tag type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="country">Country</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} className="bg-blue hover:bg-blue-dark">
                                    {editingTag ? "Update Tag" : "Create Tag"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search and filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 mb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search tags..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
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
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tag Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Contacts</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        <span className="ml-2">Loading tags...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedTags.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    {searchQuery ? "No tags match your search" : "No tags created yet"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTags.map((tag) => {
                                const tagId = typeof tag._id === "string" ? tag._id : tag._id?.toString() || ""
                                return (
                                    <TableRow key={tagId}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center">
                                                <Tag className="h-4 w-4 mr-2 text-green" />
                                                {tag.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getTagTypeColor(tag.type)}>
                                                {getTagTypeLabel(tag.type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/contacts?tag=${tag.name}`} className="text-teal hover:underline">
                                                {tag.count} contact{tag.count !== 1 ? "s" : ""}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditTag(tag)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteTag(tagId)}
                                                    disabled={tag.count > 0}
                                                    title={tag.count > 0 ? "Cannot delete tag in use" : "Delete tag"}
                                                >
                                                    <Trash2
                                                        className={`h-4 w-4 ${tag.count > 0 ? "text-muted-foreground" : "text-destructive"}`}
                                                    />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {filteredTags.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPageNumber + 1} to{" "}
                        {Math.min(currentPage * itemsPerPageNumber, totalItems)} of {totalItems} tags
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

            {/* Empty state */}
            {tags.length === 0 && !isLoading && !searchQuery && (
                <div className="flex justify-center">
                    <div className="text-center space-y-6 py-12">
                        <div className="bg-muted/30 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
                            <Tag className="h-12 w-12 text-blue" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-medium">No tags yet</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Create tags to organize your contacts and target specific groups with your email campaigns.
                            </p>
                            <div className="flex justify-center gap-4 pt-2">
                                <Button onClick={() => setOpen(true)} className="bg-blue hover:bg-blue-dark" size="lg">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create Your First Tag
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button for adding tags */}
            <div className="fixed bottom-8 right-8">
                <Button
                    onClick={() => setOpen(true)}
                    size="lg"
                    className="rounded-full h-14 w-14 shadow-lg bg-blue hover:bg-blue-dark"
                >
                    <Plus className="h-6 w-6" />
                    <span className="sr-only">Add Tag</span>
                </Button>
            </div>

            {/* Confirm Delete Dialog */}
            <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this tag. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteTag}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
