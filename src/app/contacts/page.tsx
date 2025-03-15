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
import { Plus, Trash2, Edit, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Contact, Tag } from "@/lib/models"
import { getContacts, createContact, updateContact, deleteContact, getTags, createTag } from "@/lib/actions"
import { MultiSelect } from "@/components/multi-select"
import countryList from "react-select-country-list"
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

export default function ContactsPage() {
    const { toast } = useToast()
    const [contacts, setContacts] = useState<Contact[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [countries] = useState<{ value: string; label: string }[]>(() => countryList().getData())
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editingContact, setEditingContact] = useState<Contact | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        website: "",
        phone: "",
        country: "",
        tags: [] as string[],
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const [contactsData, tagsData] = await Promise.all([getContacts(), getTags()])
                setContacts(contactsData)
                setTags(tagsData)
            } catch (error) {
                console.error("Error loading data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load contacts and tags",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [toast])

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            website: "",
            phone: "",
            country: "",
            tags: [],
        })
        setEditingContact(null)
    }

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            resetForm()
        }
    }

    const handleEditContact = (contact: Contact) => {
        setEditingContact(contact)
        setFormData({
            name: contact.name,
            email: contact.email,
            website: contact.website || "",
            phone: contact.phone || "",
            country: contact.country || "",
            tags: contact.tags || [],
        })
        setOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) {
            toast({
                title: "Missing information",
                description: "Please provide both name and email.",
                variant: "destructive",
            })
            return
        }

        try {
            if (editingContact) {
                await updateContact(editingContact._id as string, formData)
                toast({
                    title: "Contact updated",
                    description: "The contact has been updated successfully.",
                })
            } else {
                await createContact(formData)
                toast({
                    title: "Contact added",
                    description: "The contact has been added successfully.",
                })
            }

            // Refresh contacts
            const updatedContacts = await getContacts()
            setContacts(updatedContacts)

            setOpen(false)
            resetForm()
        } catch (error) {
            console.error("Error saving contact:", error)
            toast({
                title: "Error",
                description: "Failed to save contact",
                variant: "destructive",
            })
        }
    }

    const handleDeleteContact = async (id: string) => {
        try {
            await deleteContact(id)

            // Refresh contacts
            const updatedContacts = await getContacts()
            setContacts(updatedContacts)

            toast({
                title: "Contact deleted",
                description: "The contact has been deleted successfully.",
            })
        } catch (error) {
            console.error("Error deleting contact:", error)
            toast({
                title: "Error",
                description: "Failed to delete contact",
                variant: "destructive",
            })
        }
    }

    const filteredContacts = contacts.filter((contact) => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()
        return (
            contact.name.toLowerCase().includes(searchLower) ||
            contact.email.toLowerCase().includes(searchLower) ||
            (contact.website && contact.website.toLowerCase().includes(searchLower)) ||
            (contact.phone && contact.phone.toLowerCase().includes(searchLower)) ||
            (contact.country && contact.country.toLowerCase().includes(searchLower)) ||
            (contact.tags && contact.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
        )
    })

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredContacts.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)

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
                        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                        <p className="text-muted-foreground">Manage your business contacts for email campaigns.</p>
                    </div>
                    <Dialog open={open} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Contact
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[525px] max-h-[90vh]">
                            <ScrollArea className="max-h-[80vh]">
                                <DialogHeader>
                                    <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
                                    <DialogDescription>
                                        {editingContact ? "Update contact information" : "Add a new business contact to your email list."}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Business Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Acme Inc."
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="contact@acme.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="country">Country</Label>
                                            <Select
                                                value={formData.country}
                                                onValueChange={(value) => setFormData({ ...formData, country: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select country" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <ScrollArea className="h-80">
                                                        {countries.map((country) => (
                                                            <SelectItem key={country.value} value={country.value}>
                                                                {country.label}
                                                            </SelectItem>
                                                        ))}
                                                    </ScrollArea>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://acme.com"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="tags">Tags</Label>
                                        <MultiSelect
                                            selected={formData.tags}
                                            setSelected={(selected) => setFormData({ ...formData, tags: selected })}
                                            options={tags.map((tag) => ({ value: tag.name, label: tag.name }))}
                                            placeholder="Select tags or create new ones"
                                            createOption={async (inputValue) => {
                                                const newTag: Omit<Tag, "_id"> = {
                                                    name: inputValue,
                                                    type: "custom",
                                                    count: 1,
                                                }

                                                try {
                                                    await createTag(newTag)
                                                    const updatedTags = await getTags()
                                                    setTags(updatedTags)
                                                    return inputValue
                                                } catch (error) {
                                                    console.error("Error creating tag:", error)
                                                    toast({
                                                        title: "Error",
                                                        description: "Failed to create tag",
                                                        variant: "destructive",
                                                    })
                                                    return null
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSubmit}>{editingContact ? "Update Contact" : "Add Contact"}</Button>
                                </DialogFooter>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search contacts..."
                            className="w-full pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Country</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead className="w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            Loading contacts...
                                        </TableCell>
                                    </TableRow>
                                ) : currentItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            {searchTerm ? "No contacts match your search" : "No contacts added yet"}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentItems.map((contact) => (
                                        <TableRow key={typeof contact._id === "string" ? contact._id : contact._id?.toString()}>
                                            <TableCell>{contact.name}</TableCell>
                                            <TableCell>{contact.email}</TableCell>
                                            <TableCell>{contact.phone || "-"}</TableCell>
                                            <TableCell>{contact.country || "-"}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {contact.tags && contact.tags.length > 0 ? (
                                                        contact.tags.map((tag) => (
                                                            <Badge key={tag} variant="outline" className="text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditContact(contact)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDeleteContact(
                                                                typeof contact._id === "string" ? contact._id : contact._id?.toString() || "",
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

                {/* Pagination */}
                {filteredContacts.length > 0 && (
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
            </div>
        </div>
    )
}

