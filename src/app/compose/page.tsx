"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ComposePage() {
    const { toast } = useToast()
    const [emailData, setEmailData] = useState({
        subject: "",
        content: "",
        recipientType: "all",
    })
    const [isSending, setIsSending] = useState(false)

    const handleSendEmail = async () => {
        if (!emailData.subject || !emailData.content) {
            toast({
                title: "Missing information",
                description: "Please provide both subject and content for your email.",
                variant: "destructive",
            })
            return
        }

        setIsSending(true)

        // Simulate sending email
        await new Promise((resolve) => setTimeout(resolve, 1500))

        toast({
            title: "Email broadcast sent!",
            description: "Your email has been sent to all recipients.",
        })

        setIsSending(false)
        setEmailData({
            subject: "",
            content: "",
            recipientType: "all",
        })
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
                <div className="flex items-center space-x-2">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Compose Email</h1>
                </div>

                <Card className="p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="recipients">Recipients</Label>
                            <Select
                                value={emailData.recipientType}
                                onValueChange={(value) => setEmailData({ ...emailData, recipientType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select recipients" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Contacts</SelectItem>
                                    <SelectItem value="segment">Segment (Coming Soon)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject Line</Label>
                            <Input
                                id="subject"
                                value={emailData.subject}
                                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                                placeholder="Enter email subject"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Email Content</Label>
                            <Textarea
                                id="content"
                                value={emailData.content}
                                onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
                                placeholder="Write your email content here..."
                                className="min-h-[300px]"
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" asChild>
                                <Link href="/broadcasts">Preview Broadcasts</Link>
                            </Button>
                            <Button onClick={handleSendEmail} disabled={isSending} className="bg-blue hover:bg-blue-dark">
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
                </Card>
            </div>
        </div>
    )
}
