"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Send,
    Filter,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Download,
    Upload,
    FileSpreadsheet,
    AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
    getContacts,
    createContact,
    updateContact,
    deleteContact,
    getTags,
    createTag,
    getTemplates,
    sendEmailToContacts,
    importContacts,
    exportContacts,
} from "@/lib/actions"
import type { Contact, Tag, EmailTemplate } from "@/lib/models"
import { MultiSelect } from "@/components/multi-select"
import countryList from "react-select-country-list"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import * as XLSX from "xlsx";

export default function ContactsPage() {
    const { toast } = useToast()
    const [contacts, setContacts] = useState<Contact[]>([])
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editingContact, setEditingContact] = useState<Contact | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [tags, setTags] = useState<Tag[]>([])
    const [selectedTag, setSelectedTag] = useState<string | null>(null)
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [sendEmailOpen, setSendEmailOpen] = useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
    const [selectAll, setSelectAll] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState("10")
    const [currentPage, setCurrentPage] = useState(1)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [importOpen, setImportOpen] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importCountry, setImportCountry] = useState("")
    const [importTags, setImportTags] = useState<string[]>([])
    const [importErrors, setImportErrors] = useState<{ row: number; message: string }[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const countries = countryList().getData()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        website: "",
        country: "",
        tags: [] as string[],
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                const [contactsData, tagsData, templatesData] = await Promise.all([getContacts(), getTags(), getTemplates()])
                setContacts(contactsData)
                setFilteredContacts(contactsData)
                setTags(tagsData)
                setTemplates(templatesData)
            } catch (error) {
                console.error("Error loading data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load contacts",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [toast])

    useEffect(() => {
        let result = [...contacts]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (contact) =>
                    contact.name.toLowerCase().includes(query) ||
                    contact.email.toLowerCase().includes(query) ||
                    contact.phone?.toLowerCase().includes(query) ||
                    contact.website?.toLowerCase().includes(query),
            )
        }

        // Apply tag filter
        if (selectedTag) {
            result = result.filter((contact) => contact.tags?.includes(selectedTag))
        }

        setFilteredContacts(result)
        setCurrentPage(1) // Reset to first page when filters change
    }, [contacts, searchQuery, selectedTag])

    // Pagination logic
    const totalItems = filteredContacts.length
    const itemsPerPageNumber = Number.parseInt(itemsPerPage)
    const totalPages = Math.ceil(totalItems / itemsPerPageNumber)

    const paginatedContacts = filteredContacts.slice(
        (currentPage - 1) * itemsPerPageNumber,
        currentPage * itemsPerPageNumber,
    )

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            website: "",
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

    const handleImportOpenChange = (open: boolean) => {
        setImportOpen(open)
        if (!open) {
            setImportFile(null)
            setImportCountry("")
            setImportTags([])
            setImportErrors([])
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleEditContact = (contact: Contact) => {
        setEditingContact(contact)
        setFormData({
            name: contact.name,
            email: contact.email,
            phone: contact.phone || "",
            website: contact.website || "",
            country: contact.country || "",
            tags: contact.tags || [],
        })
        setOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) {
            toast({
                title: "Missing information",
                description: "Please provide name and email.",
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
                    title: "Contact created",
                    description: "The contact has been created successfully.",
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

    const handleBatchDelete = async () => {
        if (selectedContactIds.length === 0) {
            toast({
                title: "No contacts selected",
                description: "Please select at least one contact to delete.",
                variant: "destructive",
            })
            return
        }

        setIsDeleting(true)
        try {
            // Delete each selected contact
            await Promise.all(selectedContactIds.map((id) => deleteContact(id)))

            // Refresh contacts
            const updatedContacts = await getContacts()
            setContacts(updatedContacts)

            // Reset selection
            setSelectedContactIds([])
            setSelectAll(false)
            setConfirmDeleteOpen(false)

            toast({
                title: "Contacts deleted",
                description: `${selectedContactIds.length} contacts have been deleted successfully.`,
            })
        } catch (error) {
            console.error("Error deleting contacts:", error)
            toast({
                title: "Error",
                description: "Failed to delete contacts",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleSelectContact = (id: string) => {
        setSelectedContactIds((prev) => {
            if (prev.includes(id)) {
                return prev.filter((contactId) => contactId !== id)
            } else {
                return [...prev, id]
            }
        })
    }

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedContactIds([])
        } else {
            setSelectedContactIds(
                paginatedContacts.map((contact) => {
                    return typeof contact._id === "string" ? contact._id : contact._id?.toString() || ""
                }),
            )
        }
        setSelectAll(!selectAll)
    }

    const handleSendEmail = async () => {
        if (selectedContactIds.length === 0) {
            toast({
                title: "No contacts selected",
                description: "Please select at least one contact to send email.",
                variant: "destructive",
            })
            return
        }

        if (!selectedTemplateId) {
            toast({
                title: "No template selected",
                description: "Please select an email template.",
                variant: "destructive",
            })
            return
        }

        setIsSending(true)
        try {
            await sendEmailToContacts(selectedTemplateId, selectedContactIds)

            setSendEmailOpen(false)
            setSelectedContactIds([])
            setSelectAll(false)
            setSelectedTemplateId("")

            toast({
                title: "Email sent",
                description: `Email has been sent to ${selectedContactIds.length} contacts.`,
            })
        } catch (error) {
            console.error("Error sending email:", error)
            toast({
                title: "Error",
                description: "Failed to send email",
                variant: "destructive",
            })
        } finally {
            setIsSending(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImportFile(e.target.files[0])
            setImportErrors([]) // Clear previous errors
        }
    }

    const handleImportContacts = async () => {
        if (!importFile) {
            toast({
                title: "No file selected",
                description: "Please select a file to import.",
                variant: "destructive",
            })
            return
        }

        setIsImporting(true)
        try {
            const formData = new FormData()
            formData.append("file", importFile)
            formData.append("country", importCountry)
            formData.append("tags", JSON.stringify(importTags))

            // Call the server action to import contacts
            const result = await importContacts(formData)

            // Refresh contacts
            const updatedContacts = await getContacts()
            setContacts(updatedContacts)

            // Check for errors
            if (result.errors > 0 && result.errorDetails) {
                setImportErrors(result.errorDetails)
                toast({
                    title: "Import completed with errors",
                    description: `${result.imported} contacts imported, ${result.errors} errors found.`,
                    variant: "destructive",
                })
            } else {
                handleImportOpenChange(false)
                toast({
                    title: "Contacts imported",
                    description: `${result.imported} contacts have been imported successfully.`,
                })
            }
        } catch (error) {
            console.error("Error importing contacts:", error)
            toast({
                title: "Error",
                description: "Failed to import contacts",
                variant: "destructive",
            })
        } finally {
            setIsImporting(false)
        }
    }

    const handleExportContacts = async () => {
        try {
            // If contacts are selected, export only those, otherwise export all
            const contactsToExport =
                selectedContactIds.length > 0
                    ? contacts.filter((c) => {
                        const id = typeof c._id === "string" ? c._id : c._id?.toString() || ""
                        return selectedContactIds.includes(id)
                    })
                    : contacts

            if (contactsToExport.length === 0) {
                toast({
                    title: "No contacts to export",
                    description: "There are no contacts to export.",
                    variant: "destructive",
                })
                return
            }

            // Call the server action to export contacts
            const blob = await exportContacts(contactsToExport)

            // Create a download link and trigger the download
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `contacts_export_${new Date().toISOString().split("T")[0]}.xlsx`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast({
                title: "Contacts exported",
                description: `${contactsToExport.length} contacts have been exported successfully.`,
            })
        } catch (error) {
            console.error("Error exporting contacts:", error)
            toast({
                title: "Error",
                description: "Failed to export contacts",
                variant: "destructive",
            })
        }
    }

    const downloadSampleTemplate = () => {
        // Create a workbook with sample data
        // const XLSX = require("xlsx")
        const worksheet = XLSX.utils.json_to_sheet([
            {
                Name: "Acme Inc.",
                Email: "contact@acme.com",
                Phone: "+1 (555) 123-4567",
                Website: "https://acme.com",
                Country: "US",
            },
            {
                Name: "Widget Co.",
                Email: "info@widgetco.com",
                Phone: "+1 (555) 987-6543",
                Website: "https://widgetco.com",
                Country: "CA",
            },
            {
                Name: "Example LLC",
                Email: "hello@example.com",
                Phone: "+1 (555) 555-5555",
                Website: "https://example.com",
                Country: "UK",
            },
        ])

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts")

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

        // Create a Blob and download
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "contacts_import_template.xlsx"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
                    <p className="text-muted-foreground">Manage your contacts and send emails.</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedContactIds.length > 0 && (
                        <>
                            <Button variant="outline" className="gap-1" onClick={() => setConfirmDeleteOpen(true)}>
                                <Trash2 className="h-4 w-4" />
                                Delete ({selectedContactIds.length})
                            </Button>
                            <Button variant="default" className="gap-1" onClick={() => setSendEmailOpen(true)}>
                                <Send className="h-4 w-4" />
                                Send Email
                            </Button>
                        </>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Import/Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Manage Contacts</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setImportOpen(true)}>
                                <Upload className="h-4 w-4 mr-2" />
                                Import Contacts
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportContacts}>
                                <Download className="h-4 w-4 mr-2" />
                                Export Contacts
                                {selectedContactIds.length > 0 && ` (${selectedContactIds.length})`}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={downloadSampleTemplate}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Download Template
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog open={open} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button className="bg-whatsapp-lightgreen hover:bg-whatsapp-green">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Contact
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
                                <DialogDescription>
                                    {editingContact ? "Update contact information" : "Add a new contact to your list."}
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
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+1 (555) 123-4567"
                                        />
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
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Select
                                        value={formData.country}
                                        onValueChange={(value) => setFormData({ ...formData, country: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a country" />
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
                                <div className="grid gap-2">
                                    <Label>Tags</Label>
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
                                <Button onClick={handleSubmit} className="bg-whatsapp-lightgreen hover:bg-whatsapp-green">
                                    {editingContact ? "Update Contact" : "Add Contact"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search contacts..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={selectedTag || ""} onValueChange={(value) => setSelectedTag(value || null)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by tag" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tags</SelectItem>
                            {tags.map((tag) => (
                                <SelectItem key={tag._id as string} value={tag.name}>
                                    {tag.name}
                                </SelectItem>
                            ))}
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
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectAll && paginatedContacts.length > 0}
                                    onCheckedChange={handleSelectAll}
                                    disabled={paginatedContacts.length === 0}
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="hidden md:table-cell">Phone</TableHead>
                            <TableHead className="hidden md:table-cell">Country</TableHead>
                            <TableHead className="hidden md:table-cell">Tags</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        <span className="ml-2">Loading contacts...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : paginatedContacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    {searchQuery || selectedTag ? "No contacts match your search" : "No contacts added yet"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedContacts.map((contact) => {
                                const contactId = typeof contact._id === "string" ? contact._id : contact._id?.toString() || ""
                                return (
                                    <TableRow key={contactId}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedContactIds.includes(contactId)}
                                                onCheckedChange={() => handleSelectContact(contactId)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{contact.name}</TableCell>
                                        <TableCell>{contact.email}</TableCell>
                                        <TableCell className="hidden md:table-cell">{contact.phone || "-"}</TableCell>
                                        <TableCell className="hidden md:table-cell">{contact.country || "-"}</TableCell>
                                        <TableCell className="hidden md:table-cell">
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
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleEditContact(contact)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contactId)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Filter className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedContactIds([contactId])
                                                                setSendEmailOpen(true)
                                                            }}
                                                        >
                                                            <Send className="h-4 w-4 mr-2" />
                                                            Send Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSearchQuery("")
                                                                setSelectedTag(contact.tags?.[0] || null)
                                                            }}
                                                        >
                                                            <Filter className="h-4 w-4 mr-2" />
                                                            Filter by Tag
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
            {filteredContacts.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPageNumber + 1} to{" "}
                        {Math.min(currentPage * itemsPerPageNumber, totalItems)} of {totalItems} contacts
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

            {/* Import Contacts Dialog */}
            <Dialog open={importOpen} onOpenChange={handleImportOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Import Contacts</DialogTitle>
                        <DialogDescription>
                            Upload a CSV or Excel file with your contacts. Download the template for the correct format.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload">Upload File</TabsTrigger>
                                <TabsTrigger value="template">Template</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="file">Select File</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                    />
                                    <p className="text-sm text-muted-foreground">Accepted formats: CSV, Excel (.xlsx, .xls)</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="importCountry">Default Country (Optional)</Label>
                                    <Select value={importCountry} onValueChange={setImportCountry}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a country" />
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
                                    <p className="text-sm text-muted-foreground">
                                        This country will be applied to all imported contacts if not specified in the file.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Default Tags (Optional)</Label>
                                    <MultiSelect
                                        selected={importTags}
                                        setSelected={setImportTags}
                                        options={tags.map((tag) => ({ value: tag.name, label: tag.name }))}
                                        placeholder="Select tags to apply to all imported contacts"
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
                                    <p className="text-sm text-muted-foreground">These tags will be applied to all imported contacts.</p>
                                </div>

                                {importErrors.length > 0 && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Import Errors</AlertTitle>
                                        <AlertDescription>
                                            <ScrollArea className="h-[100px] mt-2">
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {importErrors.map((error, index) => (
                                                        <li key={index} className="text-sm">
                                                            Row {error.row}: {error.message}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </ScrollArea>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </TabsContent>
                            <TabsContent value="template" className="space-y-4">
                                <div className="rounded-md border p-4 bg-muted/30">
                                    <h3 className="font-medium mb-2">Sample Template Format</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Your import file should have the following columns:
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-border">
                                            <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Phone
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Website
                                                </th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Country
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                            <tr>
                                                <td className="px-3 py-2 text-sm">Acme Inc.</td>
                                                <td className="px-3 py-2 text-sm">contact@acme.com</td>
                                                <td className="px-3 py-2 text-sm">+1 (555) 123-4567</td>
                                                <td className="px-3 py-2 text-sm">https://acme.com</td>
                                                <td className="px-3 py-2 text-sm">US</td>
                                            </tr>
                                            <tr>
                                                <td className="px-3 py-2 text-sm">Widget Co.</td>
                                                <td className="px-3 py-2 text-sm">info@widgetco.com</td>
                                                <td className="px-3 py-2 text-sm">+1 (555) 987-6543</td>
                                                <td className="px-3 py-2 text-sm">https://widgetco.com</td>
                                                <td className="px-3 py-2 text-sm">CA</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4">
                                        <Button onClick={downloadSampleTemplate} variant="outline" className="w-full">
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Template
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleImportOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleImportContacts}
                            disabled={isImporting || !importFile}
                            className="bg-whatsapp-lightgreen hover:bg-whatsapp-green"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Import Contacts
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Email Dialog */}
            <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Send Email to Selected Contacts</DialogTitle>
                        <DialogDescription>
                            Select an email template to send to {selectedContactIds.length} selected contact
                            {selectedContactIds.length !== 1 ? "s" : ""}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="template">Email Template</Label>
                            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="h-[200px]">
                                        {templates.map((template) => (
                                            <SelectItem
                                                key={typeof template._id === "string" ? template._id : template._id?.toString()}
                                                value={typeof template._id === "string" ? template._id : template._id?.toString() || ""}
                                            >
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedTemplateId && (
                            <div className="space-y-2 border-t pt-4">
                                <Label>Preview</Label>
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium">
                                        Subject:{" "}
                                        {
                                            templates.find((t) =>
                                                typeof t._id === "string"
                                                    ? t._id === selectedTemplateId
                                                    : t._id?.toString() === selectedTemplateId,
                                            )?.subject
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSendEmailOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendEmail}
                            disabled={isSending || !selectedTemplateId}
                            className="bg-whatsapp-lightgreen hover:bg-whatsapp-green"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Email
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {selectedContactIds.length} selected contact
                            {selectedContactIds.length !== 1 ? "s" : ""}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBatchDelete}
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

