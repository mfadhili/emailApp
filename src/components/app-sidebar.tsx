"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Home, Mail, Users, FileText, Send, Settings, LogOut, Tag, Menu } from "lucide-react"
import { useState } from "react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
    SidebarRail,
    SidebarTrigger,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`)
    }

    return (
        <>
            <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 md:hidden dark:bg-gray-900 dark:border-gray-800">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open sidebar</span>
                </Button>
                <div className="flex flex-1 items-center gap-x-4 lg:gap-x-6">
                    <div className="flex items-center">
                        <Mail className="h-6 w-6 text-[#00A5CF] mr-2" />
                        <span className="text-xl font-bold">EmailFlow</span>
                    </div>
                </div>
            </div>

            <SidebarProvider open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <Sidebar collapsible="icon">
                    <SidebarHeader className="pb-0">
                        <div className="flex items-center justify-between px-4 py-4">
                            <div className="flex items-center">
                                <Mail className="h-6 w-6 text-[#00A5CF] mr-2" />
                                <span className="text-xl font-bold">EmailFlow</span>
                            </div>
                            <SidebarTrigger className="hidden md:flex" />
                        </div>
                    </SidebarHeader>
                    <SidebarSeparator />
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive("/")} tooltip="Dashboard">
                                            <Link href="/">
                                                <Home className="h-5 w-5" />
                                                <span>Dashboard</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive("/contacts")} tooltip="Contacts">
                                            <Link href="/contacts">
                                                <Users className="h-5 w-5" />
                                                <span>Contacts</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive("/templates")} tooltip="Templates">
                                            <Link href="/templates">
                                                <FileText className="h-5 w-5" />
                                                <span>Email Templates</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive("/broadcasts")} tooltip="Broadcasts">
                                            <Link href="/broadcasts">
                                                <Send className="h-5 w-5" />
                                                <span>Broadcasts</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive("/tags")} tooltip="Tags">
                                            <Link href="/tags">
                                                <Tag className="h-5 w-5" />
                                                <span>Tags</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive("/analytics")} tooltip="Analytics">
                                            <Link href="/analytics">
                                                <BarChart3 className="h-5 w-5" />
                                                <span>Analytics</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />

                        <SidebarGroup>
                            <SidebarGroupLabel>Settings</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Settings">
                                            <Link href="/settings">
                                                <Settings className="h-5 w-5" />
                                                <span>Account Settings</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Logout">
                                    <LogOut className="h-5 w-5" />
                                    <span>Logout</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <div className="p-4 mt-2">
                            <div className="flex items-center gap-3 rounded-md bg-gray-100 dark:bg-navy/20 p-3 transition-colors">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                                    <AvatarFallback className="bg-[#25A18E] text-white">JD</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">John Doe</span>
                                    <span className="text-xs text-muted-foreground">Admin</span>
                                </div>
                            </div>
                        </div>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>
            </SidebarProvider>
        </>
    )
}
