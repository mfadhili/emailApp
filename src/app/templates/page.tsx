"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Send, Tag, Copy, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { EmailTemplate } from "@/lib/models"
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "@/lib/actions"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HtmlCodeEditor } from "@/components/html-code-editor"
import { EMAIL_TEMPLATES } from "@/components/email-templates/sample-template"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Personalization variables that can be inserted into templates
const PERSONALIZATION_VARS = [
    { name: "Business Name", variable: "{{businessName}}", description: "Inserts the contact's business name" },
    { name: "Contact Email", variable: "{{email}}", description: "Inserts the contact's email address" },
    { name: "Website", variable: "{{website}}", description: "Inserts the contact's website URL" },
    { name: "Country", variable: "{{country}}", description: "Inserts the contact's country" },
]

export default function TemplatesPage() {
    const { toast } = useToast()
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
    const [sampleTemplatesOpen, setSampleTemplatesOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([])

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState("9")

    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        content: "",
        html: "",
    })

    // References to the textarea elements for inserting variables
    const [activeField, setActiveField] = useState<"subject" | "content" | "html" | null>(null)

    useEffect(() => {
        // Check if we're coming from the HTML converter
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search)
            const createFromHtml = urlParams.get("createFromHtml")

            if (createFromHtml === "true") {
                const savedHtml = localStorage.getItem("template_html")
                if (savedHtml) {
                    setFormData((prev) => ({
                        ...prev,
                        html: savedHtml,
                    }))
                    setOpen(true)
                    // Clear the saved HTML
                    localStorage.removeItem("template_html")
                }
            }
        }

        const loadTemplates = async () => {
            try {
                const templatesData = await getTemplates()
                setTemplates(templatesData)
                setFilteredTemplates(templatesData)
            } catch (error) {
                console.error("Error loading templates:", error)
                toast({
                    title: "Error",
                    description: "Failed to load email templates",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadTemplates()
    }, [toast])

    useEffect(() => {
        let result = [...templates]

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (template) => template.name.toLowerCase().includes(query) || template.subject.toLowerCase().includes(query),
            )
        }

        setFilteredTemplates(result)
        setCurrentPage(1) // Reset to first page when filters change
    }, [templates, searchQuery])

    // Pagination logic
    const totalItems = filteredTemplates.length
    const itemsPerPageNumber = Number.parseInt(itemsPerPage)
    const totalPages = Math.ceil(totalItems / itemsPerPageNumber)

    const paginatedTemplates = filteredTemplates.slice(
        (currentPage - 1) * itemsPerPageNumber,
        currentPage * itemsPerPageNumber,
    )

    const resetForm = () => {
        setFormData({
            name: "",
            subject: "",
            content: "",
            html: "",
        })
        setEditingTemplate(null)
    }

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) {
            resetForm()
        }
    }

    const handleEditTemplate = (template: EmailTemplate) => {
        setEditingTemplate(template)
        setFormData({
            name: template.name,
            subject: template.subject,
            content: template.content,
            html: template.html,
        })
        setOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.subject || !formData.content) {
            toast({
                title: "Missing information",
                description: "Please provide name, subject, and content.",
                variant: "destructive",
            })
            return
        }

        // If HTML is not provided, use the content as HTML
        const templateData = {
            ...formData,
            html: formData.html || `<p>${formData.content}</p>`,
        }

        try {
            if (editingTemplate) {
                await updateTemplate(editingTemplate._id as string, templateData)
                toast({
                    title: "Template updated",
                    description: "The email template has been updated successfully.",
                })
            } else {
                await createTemplate(templateData)
                toast({
                    title: "Template created",
                    description: "The email template has been created successfully.",
                })
            }

            // Refresh templates
            const updatedTemplates = await getTemplates()
            setTemplates(updatedTemplates)

            setOpen(false)
            resetForm()
        } catch (error) {
            console.error("Error saving template:", error)
            toast({
                title: "Error",
                description: "Failed to save email template",
                variant: "destructive",
            })
        }
    }

    const handleDeleteTemplate = async (id: string) => {
        try {
            await deleteTemplate(id)

            // Refresh templates
            const updatedTemplates = await getTemplates()
            setTemplates(updatedTemplates)

            toast({
                title: "Template deleted",
                description: "The email template has been deleted successfully.",
            })
        } catch (error) {
            console.error("Error deleting template:", error)
            toast({
                title: "Error",
                description: "Failed to delete email template",
                variant: "destructive",
            })
        }
    }

    // Insert personalization variable at cursor position or at the end
    const insertVariable = (variable: string) => {
        if (!activeField) return

        const field = activeField
        const currentValue = formData[field]

        // Insert at cursor position if supported, otherwise append to the end
        const textArea = document.getElementById(field) as HTMLTextAreaElement

        if (textArea && typeof textArea.selectionStart === "number") {
            const startPos = textArea.selectionStart
            const endPos = textArea.selectionEnd

            const newValue = currentValue.substring(0, startPos) + variable + currentValue.substring(endPos)

            setFormData({ ...formData, [field]: newValue })

            // Set cursor position after the inserted variable
            setTimeout(() => {
                textArea.focus()
                textArea.setSelectionRange(startPos + variable.length, startPos + variable.length)
            }, 0)
        } else {
            // Fallback: append to the end
            setFormData({ ...formData, [field]: currentValue + variable })
        }
    }

    const handleUseSampleTemplate = (template: (typeof EMAIL_TEMPLATES)[0]) => {
        setFormData({
            name: template.name,
            subject: template.subject,
            content: template.content,
            html: template.html,
        })
        setSampleTemplatesOpen(false)
        setOpen(true)
    }

    // Keep all the existing state and functions
    // ...

    // Only updating the top part of the return for brevity
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
                        <p className="text-muted-foreground">Create and manage email templates for your campaigns.</p>
                    </div>
                    <div className="flex space-x-2">
                        <Dialog open={sampleTemplatesOpen} onOpenChange={setSampleTemplatesOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Use Sample Template
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Sample Email Templates</DialogTitle>
                                    <DialogDescription>Choose a sample template to get started quickly.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    {EMAIL_TEMPLATES.map((template, index) => (
                                        <Card
                                            key={index}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => handleUseSampleTemplate(template)}
                                        >
                                            <CardHeader className="py-4">
                                                <CardTitle className="text-base">{template.name}</CardTitle>
                                                <CardDescription className="text-xs truncate">{template.subject}</CardDescription>
                                            </CardHeader>
                                        </Card>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={open} onOpenChange={handleOpenChange}>
                            <DialogTrigger asChild>
                                <Button className="bg-blue hover:bg-blue-dark">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Template
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
                                <ScrollArea className="max-h-[80vh]">
                                    <DialogHeader>
                                        <DialogTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
                                        <DialogDescription>
                                            {editingTemplate
                                                ? "Update your email template"
                                                : "Create a new email template for your campaigns."}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Template Name</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Monthly Newsletter"
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="subject">Email Subject</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setActiveField("subject")}>
                                                            <Tag className="h-3.5 w-3.5 mr-1" />
                                                            Add Variable
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80">
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium">Personalization Variables</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Insert variables that will be replaced with contact data when the email is sent.
                                                            </p>
                                                            <ScrollArea className="h-[200px]">
                                                                <div className="grid gap-1.5 mt-3">
                                                                    {PERSONALIZATION_VARS.map((variable) => (
                                                                        <Button
                                                                            key={variable.variable}
                                                                            variant="outline"
                                                                            className="justify-start"
                                                                            onClick={() => insertVariable(variable.variable)}
                                                                        >
                                                                            <span className="font-mono text-sm">{variable.variable}</span>
                                                                            <span className="ml-2 text-xs text-muted-foreground">- {variable.name}</span>
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </ScrollArea>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <Input
                                                id="subject"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="Your Monthly Update from Acme Inc."
                                                onFocus={() => setActiveField("subject")}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="content">Plain Text Content</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="sm" onClick={() => setActiveField("content")}>
                                                            <Tag className="h-3.5 w-3.5 mr-1" />
                                                            Add Variable
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80">
                                                        <div className="space-y-2">
                                                            <h4 className="font-medium">Personalization Variables</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                Insert variables that will be replaced with contact data when the email is sent.
                                                            </p>
                                                            <ScrollArea className="h-[200px]">
                                                                <div className="grid gap-1.5 mt-3">
                                                                    {PERSONALIZATION_VARS.map((variable) => (
                                                                        <Button
                                                                            key={variable.variable}
                                                                            variant="outline"
                                                                            className="justify-start"
                                                                            onClick={() => insertVariable(variable.variable)}
                                                                        >
                                                                            <span className="font-mono text-sm">{variable.variable}</span>
                                                                            <span className="ml-2 text-xs text-muted-foreground">- {variable.name}</span>
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                            </ScrollArea>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <ScrollArea className="h-[150px] border rounded-md">
                                                <Textarea
                                                    id="content"
                                                    value={formData.content}
                                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                    placeholder="Write your email content here..."
                                                    className="min-h-[150px] border-0"
                                                    onFocus={() => setActiveField("content")}
                                                />
                                            </ScrollArea>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                <p>{'Example: "Hello {{businessName}}, We wanted to share our latest updates with you..."'}</p>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <HtmlCodeEditor
                                                label="HTML Content"
                                                value={formData.html}
                                                onChange={(content) => setFormData({ ...formData, html: content })}
                                                height={300}
                                                placeholder="<p>Your HTML content here...</p>"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleSubmit} className="bg-blue hover:bg-blue-dark">
                                            {editingTemplate ? "Update Template" : "Create Template"}
                                        </Button>
                                    </DialogFooter>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    </div>
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
                                placeholder="Search templates..."
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
                                    <SelectValue placeholder="9" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="6">6</SelectItem>
                                    <SelectItem value="9">9</SelectItem>
                                    <SelectItem value="12">12</SelectItem>
                                    <SelectItem value="24">24</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* The rest of the component remains the same */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="ml-2">Loading templates...</span>
                </div>
            ) : paginatedTemplates.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                    <p className="text-muted-foreground">
                        {searchQuery ? "No templates match your search" : "No email templates created yet."}
                    </p>
                    <Button onClick={() => setOpen(true)} className="bg-blue hover:bg-blue-dark">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Template
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedTemplates.map((template) => {
                        const templateId = typeof template._id === "string" ? template._id : template._id?.toString() || ""
                        return (
                            <Card key={templateId}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="truncate">{template.name}</span>
                                    </CardTitle>
                                    <CardDescription className="truncate">{template.subject}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-[100px]">
                                        <p className="text-sm text-muted-foreground">{template.content}</p>
                                    </ScrollArea>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleEditTemplate(template)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleDeleteTemplate(templateId)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Button variant="default" size="sm" asChild>
                                        <a href={`/broadcasts/new?template=${templateId}`}>
                                            <Send className="h-4 w-4 mr-2" />
                                            Use Template
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {filteredTemplates.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPageNumber + 1} to{" "}
                        {Math.min(currentPage * itemsPerPageNumber, totalItems)} of {totalItems} templates
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
        </div>
    )
}
