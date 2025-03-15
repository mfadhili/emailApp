import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ subsets: ["latin"] })

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
        <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <SidebarProvider>
                <div className="flex min-h-screen">
                    <AppSidebar />
                    <main className="flex-1 overflow-auto">
                        <div className="mx-auto max-w-6xl p-4 md:p-6">{children}</div>
                    </main>
                </div>
            </SidebarProvider>
            <Toaster />
        </ThemeProvider>
        </body>
        </html>
    )
}

