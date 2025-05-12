"use client"

import { useState, useEffect } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tag } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

// Personalization variables that can be inserted into templates
const PERSONALIZATION_VARS = [
    { name: "Business Name", variable: "{{businessName}}", description: "Inserts the contact's business name" },
    { name: "Contact Email", variable: "{{email}}", description: "Inserts the contact's email address" },
    { name: "Website", variable: "{{website}}", description: "Inserts the contact's website URL" },
    { name: "Country", variable: "{{country}}", description: "Inserts the contact's country" },
]

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    label?: string
    height?: number
    placeholder?: string
}

export function RichTextEditor({
                                   value,
                                   onChange,
                                   label,
                                   height = 300,
                                   placeholder = "Write your content here...",
                               }: RichTextEditorProps) {
    const [editorKey, setEditorKey] = useState<number>(1)

    const [editorRef, setEditorRef] = useState<any>(null)

    // Force re-render of editor when value changes externally
    useEffect(() => {
        setEditorKey((prev) => prev + 1)
    }, [])

    const insertVariable = (variable: string) => {
        if (editorRef) {
            editorRef.insertContent(variable)
        }
    }

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex items-center justify-between">
                    <Label>{label}</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm">
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
            )}
            <div className="border rounded-md">
                <Editor
                    key={editorKey}
                    apiKey="your-tinymce-api-key" // You'll need to get a free API key from TinyMCE
                    onInit={(evt, editor) => setEditorRef(editor)}
                    initialValue={value}
                    init={{
                        height,
                        menubar: false,
                        plugins: [
                            "advlist",
                            "autolink",
                            "lists",
                            "link",
                            "image",
                            "charmap",
                            "preview",
                            "anchor",
                            "searchreplace",
                            "visualblocks",
                            "code",
                            "fullscreen",
                            "insertdatetime",
                            "media",
                            "table",
                            "code",
                            "help",
                            "wordcount",
                        ],
                        toolbar:
                            "undo redo | blocks | " +
                            "bold italic forecolor | alignleft aligncenter " +
                            "alignright alignjustify | bullist numlist outdent indent | " +
                            "removeformat | help",
                        content_style: "body { font-family:Inter,Arial,sans-serif; font-size:14px }",
                        placeholder,
                        branding: false,
                    }}
                    onEditorChange={onChange}
                />
            </div>
        </div>
    )
}

