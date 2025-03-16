"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Home, Mail, Users, FileText, Send, Settings, LogOut, Tag } from "lucide-react"

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
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppSidebar() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(`${path}/`)
    }

    return (
        <>
            <Sidebar collapsible="icon">
                <SidebarHeader className="pb-0">
                    <div className="flex items-center px-2 py-3">
                        <Mail className="h-6 w-6 text-[var(--whatsapp-lightgreen)] mr-2" />
                        <span className="text-xl font-bold">EmailFlow</span>
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
                                            <Home className="h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive("/contacts")} tooltip="Contacts">
                                        <Link href="/contacts">
                                            <Users className="h-4 w-4" />
                                            <span>Contacts</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive("/templates")} tooltip="Templates">
                                        <Link href="/templates">
                                            <FileText className="h-4 w-4" />
                                            <span>Email Templates</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive("/broadcasts")} tooltip="Broadcasts">
                                        <Link href="/broadcasts">
                                            <Send className="h-4 w-4" />
                                            <span>Broadcasts</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive("/tags")} tooltip="Tags">
                                        <Link href="/tags">
                                            <Tag className="h-4 w-4" />
                                            <span>Tags</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild isActive={isActive("/analytics")} tooltip="Analytics">
                                        <Link href="/analytics">
                                            <BarChart3 className="h-4 w-4" />
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
                                            <Settings className="h-4 w-4" />
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
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <div className="p-3 mt-2">
                        <div className="flex items-center gap-3 rounded-md bg-[var(--whatsapp-darkgreen)]/20 p-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                <AvatarFallback className="bg-[var(--whatsapp-lightgreen)] text-white">JD</AvatarFallback>
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
        </>
    )
}

