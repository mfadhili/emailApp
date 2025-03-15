"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Home, Mail, MessageSquare, Settings, Tag, Users } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AppSidebar() {
    const pathname = usePathname()

    const menuItems = [
        {
            title: "Dashboard",
            icon: Home,
            href: "/",
        },
        {
            title: "Contacts",
            icon: Users,
            href: "/contacts",
        },
        {
            title: "Templates",
            icon: Mail,
            href: "/templates",
        },
        {
            title: "Broadcasts",
            icon: MessageSquare,
            href: "/broadcasts",
        },
        // {
        //     title: "Tags",
        //     icon: Tag,
        //     href: "/tags",
        // },
        // {
        //     title: "Analytics",
        //     icon: BarChart3,
        //     href: "/analytics",
        // },
        // {
        //     title: "Settings",
        //     icon: Settings,
        //     href: "/settings",
        // },
    ]

    return (
        <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader className="border-b border-sidebar-border">
                <div className="flex items-center gap-2 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md">
                        <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold  ">EmailFlow</span>
                        <span className="text-xs  ">Marketing Platform</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                                <Link href={item.href}>
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start px-2  ">
                            <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                                <AvatarFallback className="text-xs">JD</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="text-sm">John Doe</span>
                                <span className="text-xs  ">Admin</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}

