"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tag } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"

// Dynamically import AceEditor to avoid SSR issues
const AceEditor = dynamic(
    async () => {
        const ace = await import("react-ace")
        // Import required ace modules
        await import("ace-builds/src-noconflict/mode-html")
        await import("ace-builds/src-noconflict/theme-tomorrow")
        await import("ace-builds/src-noconflict/ext-language_tools")
        return ace
    },
    { ssr: false },
)

// Personalization variables that can be inserted into templates
const PERSONALIZATION_VARS = [
    { name: "Business Name", variable: "{{businessName}}", description: "Inserts the contact's business name" },
    { name: "Contact Email", variable: "{{email}}", description: "Inserts the contact's email address" },
    { name: "Website", variable: "{{website}}", description: "Inserts the contact's website URL" },
    { name: "Country", variable: "{{country}}", description: "Inserts the contact's country" },
]

interface HtmlCodeEditorProps {
    value: string
    onChange: (value: string) => void
    label?: string
    height?: number
    placeholder?: string
}

export function HtmlCodeEditor({
                                   value,
                                   onChange,
                                   label,
                                   height = 300,
                                   placeholder = "<p>Your HTML content here...</p>",
                               }: HtmlCodeEditorProps) {
    const [editorValue, setEditorValue] = useState(value || "")
    const [previewHtml, setPreviewHtml] = useState("")
    const [editorInstance, setEditorInstance] = useState<any>(null)

    // Update preview when value changes
    useEffect(() => {
        setPreviewHtml(editorValue)
    }, [editorValue])

    // Update editor value when external value changes
    useEffect(() => {
        if (value !== editorValue) {
            setEditorValue(value)
        }
    }, [value])

    const handleChange = (newValue: string) => {
        setEditorValue(newValue)
        onChange(newValue)
    }

    const insertVariable = (variable: string) => {
        if (editorInstance) {
            editorInstance.session.insert(editorInstance.getCursorPosition(), variable)
        }
    }

    const wrapWithDefaultStyling = () => {
        // Check if already wrapped
        if (editorValue.includes('<div style="font-family:')) {
            return
        }

        const wrappedHtml = `<div style="font-family: Arial, sans-serif; padding: 10px; line-height: 1.6;">${editorValue}</div>`
        setEditorValue(wrappedHtml)
        onChange(wrappedHtml)
    }

    return (
        <div className="space-y-2">
            {label && (
                <div className="flex items-center justify-between">
                    <Label>{label}</Label>
                    <div className="flex space-x-2">
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

                        <Button variant="outline" size="sm" onClick={wrapWithDefaultStyling}>
                            Add Default Styling
                        </Button>
                    </div>
                </div>
            )}

            <Tabs defaultValue="editor">
                <TabsList className="mb-2">
                    <TabsTrigger value="editor">HTML Editor</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="mt-0">
                    <div className="border rounded-md overflow-hidden">
                        {typeof window !== "undefined" && (
                            <AceEditor
                                mode="html"
                                theme="tomorrow"
                                onChange={handleChange}
                                value={editorValue}
                                name="html-editor"
                                editorProps={{ $blockScrolling: true }}
                                setOptions={{
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true,
                                    enableSnippets: true,
                                    showLineNumbers: true,
                                    tabSize: 2,
                                }}
                                placeholder={placeholder}
                                width="100%"
                                height={`${height}px`}
                                fontSize={14}
                                showPrintMargin={false}
                                onLoad={(editor) => {
                                    setEditorInstance(editor)
                                    editor.focus()
                                }}
                            />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Use HTML tags to format your email. Add variables like {`{{`}businessName{`}}`} for personalization.
                    </p>
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-md p-4 overflow-auto bg-white" style={{ height: `${height}px` }}>
                        {previewHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                        ) : (
                            <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                                <p>HTML preview will appear here</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

