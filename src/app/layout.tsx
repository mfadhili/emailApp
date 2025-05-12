import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


export const metadata: Metadata = {
    title: "EmailFlow - Email Marketing Platform",
    description: "A powerful email marketing platform for businesses",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={"graphik-font "}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <SidebarProvider>
                <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
                    <AppSidebar/>
                    <main className="flex-1 overflow-auto transition-all duration-200 ease-in-out">
                        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
                    </main>
                </div>
            </SidebarProvider>
            <Toaster/>
        </ThemeProvider>
        </body>
        </html>
    )
}