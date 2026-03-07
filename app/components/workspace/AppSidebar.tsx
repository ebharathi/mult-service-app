"use client";

import { useSession, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { useWorkspace } from "./WorkspaceProvider";
import { useState } from "react";
import { InviteMemberDialog } from "./InviteMemberDialog";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  LogOut,
  ChevronsUpDown,
  Settings,
  Brain,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const { data: session } = useSession();
  const { currentWorkspace } = useWorkspace();
  const [showInvite, setShowInvite] = useState(false);
  const pathname = usePathname();

  const isAdmin = currentWorkspace?.members?.find(
    (m) => m.user_id === session?.user?.id
  )?.role === "ADMIN";

  const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Memory Graph", href: "/dashboard/memory", icon: Brain },
    { title: "Members", href: "/dashboard/members", icon: Users },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    signOut({ redirect: false }).then(() => {
      window.location.href = "/";
    });
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <WorkspaceSwitcher />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>
              Members
              {isAdmin && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="ml-auto"
                >
                  <UserPlus className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              )}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {currentWorkspace?.members?.map((member) => (
                  <SidebarMenuItem key={member.id}>
                    <SidebarMenuButton className="h-auto py-2">
                      <Avatar className="size-6">
                        <AvatarImage src={member.user.image} />
                        <AvatarFallback className="text-xs">
                          {member.user.name?.charAt(0)?.toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm">{member.user.name || member.user.email}</span>
                      </div>
                    </SidebarMenuButton>
                    <SidebarMenuAction className="pointer-events-none">
                      <Badge variant={member.role === "ADMIN" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {member.role}
                      </Badge>
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="size-8">
                      <AvatarImage src={session?.user?.image} />
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session?.user?.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {session?.user?.email}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                  side="top"
                  align="start"
                  sideOffset={4}
                >
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2">
                    <LogOut className="size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <InviteMemberDialog open={showInvite} onOpenChange={setShowInvite} />
    </>
  );
}
