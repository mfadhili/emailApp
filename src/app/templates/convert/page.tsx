"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { TextToHtmlConverter } from "@/components/text-to-html-converter"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function ConvertTextToHtmlPage() {
    const [convertedHtml, setConvertedHtml] = useState<string>("")
    const router = useRouter()

    const handleCreateTemplate = () => {
        // Store the HTML in localStorage to use it in the template creation page
        if (convertedHtml) {
            localStorage.setItem("template_html", convertedHtml)
            router.push("/templates?createFromHtml=true")
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center space-x-2">
                    <Link href="/templates">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Templates
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Convert Text to HTML</h1>
                </div>

                <Card className="p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <TextToHtmlConverter onConvert={setConvertedHtml} />

                        <div className="space-y-2">
                            <Label>HTML Preview</Label>
                            <div className="border rounded-md p-4 h-[300px] overflow-auto bg-muted/30">
                                {convertedHtml ? (
                                    <div dangerouslySetInnerHTML={{ __html: convertedHtml }} />
                                ) : (
                                    <div className="text-muted-foreground text-center h-full flex items-center justify-center">
                                        <p>HTML preview will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {convertedHtml && (
                        <div className="mt-6">
                            <Button onClick={handleCreateTemplate} className="bg-teal hover:bg-teal-dark">
                                Create Template with This HTML
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
