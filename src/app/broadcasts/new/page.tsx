"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { EmailTemplate, Tag } from "@/lib/models"
import { getTemplates, getTemplateById, getTags, sendBroadcast } from "@/lib/actions"
import { MultiSelect } from "@/components/multi-select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function NewBroadcastPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const templateId = searchParams.get("template")
    const { toast } = useToast()

    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [tags, setTags] = useState<Tag[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)

    const [formData, setFormData] = useState({
        templateId: templateId || "",
        recipientType: "all",
        recipientTags: [] as string[],
    })

    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const [templatesData, tagsData] = await Promise.all([getTemplates(), getTags()])

                setTemplates(templatesData)
                setTags(tagsData)

                // If template ID is provided, load the template
                if (templateId) {
                    const template = await getTemplateById(templateId)
                    if (template) {
                        setSelectedTemplate(template)
                        setFormData((prev) => ({ ...prev, templateId }))
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error)
                toast({
                    title: "Error",
                    description: "Failed to load templates and tags",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [templateId, toast])

    const handleTemplateChange = async (id: string) => {
        setFormData({ ...formData, templateId: id })

        try {
            const template = await getTemplateById(id)
            setSelectedTemplate(template)
        } catch (error) {
            console.error("Error loading template:", error)
            toast({
                title: "Error",
                description: "Failed to load template details",
                variant: "destructive",
            })
        }
    }

    const handleSendBroadcast = async () => {
        if (!formData.templateId) {
            toast({
                title: "Missing template",
                description: "Please select an email template.",
                variant: "destructive",
            })
            return
        }

        if (formData.recipientType === "tags" && formData.recipientTags.length === 0) {
            toast({
                title: "Missing recipients",
                description: "Please select at least one tag for recipients.",
                variant: "destructive",
            })
            return
        }

        setIsSending(true)

        try {
            await sendBroadcast(formData.templateId, {
                type: formData.recipientType as "all" | "tags",
                tags: formData.recipientType === "tags" ? formData.recipientTags : undefined,
            })

            toast({
                title: "Broadcast sent!",
                description: "Your email has been sent to the selected recipients.",
            })

            router.push("/broadcasts")
        } catch (error) {
            console.error("Error sending broadcast:", error)
            toast({
                title: "Error",
                description: "Failed to send broadcast",
                variant: "destructive",
            })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center space-x-2">
                    <Link href="/broadcasts">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Broadcasts
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Send New Broadcast</h1>
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <Card className="p-6">
                        <ScrollArea className="max-h-[calc(100vh-200px)]">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="template">Email Template</Label>
                                    <Select value={formData.templateId} onValueChange={handleTemplateChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <ScrollArea className="h-[200px]">
                                                {templates.map((template) => (
                                                    <SelectItem key={template._id?.toString()} value={template._id?.toString() || ""}>
                                                        {template.name}
                                                    </SelectItem>
                                                ))}
                                            </ScrollArea>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recipients">Recipients</Label>
                                    <Select
                                        value={formData.recipientType}
                                        onValueChange={(value) => setFormData({ ...formData, recipientType: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select recipients" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Contacts</SelectItem>
                                            <SelectItem value="tags">By Tags</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.recipientType === "tags" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Select Tags</Label>
                                        <MultiSelect
                                            selected={formData.recipientTags}
                                            setSelected={(selected) => setFormData({ ...formData, recipientTags: selected })}
                                            options={tags.map((tag) => ({ value: tag.name, label: tag.name }))}
                                            placeholder="Select tags for recipients"
                                        />
                                    </div>
                                )}

                                {selectedTemplate && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-lg font-medium">Preview Email</h3>

                                        <Tabs defaultValue="text">
                                            <TabsList>
                                                <TabsTrigger value="text">Text</TabsTrigger>
                                                <TabsTrigger value="html">HTML</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="text" className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Subject</Label>
                                                    <Input value={selectedTemplate.subject} readOnly />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Content</Label>
                                                    <ScrollArea className="border rounded-md p-4 h-[300px] whitespace-pre-wrap">
                                                        {selectedTemplate.content.split(/(\{\{[^}]+\}\})/).map((part, i) => {
                                                            if (part.match(/\{\{[^}]+\}\}/)) {
                                                                return (
                                                                    <Badge key={i} variant="outline" className="font-mono text-xs">
                                                                        {part}
                                                                    </Badge>
                                                                )
                                                            }
                                                            return <span key={i}>{part}</span>
                                                        })}
                                                    </ScrollArea>
                                                </div>
                                            </TabsContent>
                                            <TabsContent value="html" className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>HTML Content</Label>
                                                    <ScrollArea className="border rounded-md p-4 h-[300px] bg-muted/30">
                                                        <div dangerouslySetInnerHTML={{ __html: selectedTemplate.html }} />
                                                    </ScrollArea>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/broadcasts">Cancel</Link>
                                    </Button>
                                    <Button
                                        onClick={handleSendBroadcast}
                                        disabled={isSending || !formData.templateId}
                                        className="bg-blue hover:bg-blue-dark"
                                    >
                                        {isSending ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Broadcast
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </ScrollArea>
                    </Card>
                )}
            </div>
        </div>
    )
}
