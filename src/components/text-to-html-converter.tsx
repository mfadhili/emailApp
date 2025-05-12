"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { textToHtml } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function TextToHtmlConverter({ onConvert }: { onConvert: (html: string) => void }) {
    const [text, setText] = useState("")
    const { toast } = useToast()

    const handleConvert = () => {
        if (!text.trim()) {
            toast({
                title: "No text to convert",
                description: "Please enter some text to convert to HTML.",
                variant: "destructive",
            })
            return
        }

        const html = textToHtml(text)
        onConvert(html)

        toast({
            title: "Conversion successful",
            description: "Your text has been converted to HTML.",
        })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="plainText">Plain Text</Label>
                <ScrollArea className="h-[300px] border rounded-md">
                    <Textarea
                        id="plainText"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste your plain text email content here..."
                        className="min-h-[300px] border-0"
                    />
                </ScrollArea>
            </div>

            <Button onClick={handleConvert} className="w-full">
                Convert to HTML
            </Button>
        </div>
    )
}
