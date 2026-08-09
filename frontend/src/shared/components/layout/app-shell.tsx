"use client";

import { LogOut, Menu, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Brand } from "@/shared/components/layout/brand";
import {
  Navigation,
  type NavigationItem,
} from "@/shared/components/layout/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";

export type ShellUser = {
  displayName: string;
  email: string;
  role: string;
};

type AppShellProps = {
  children: ReactNode;
  navigation: readonly NavigationItem[];
  onLogout?: () => void;
  user: ShellUser;
};

export function AppShell({
  children,
  navigation,
  onLogout,
  user,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-muted/35 min-h-svh">
      <aside className="bg-background fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:flex lg:flex-col">
        <div className="px-5 py-5">
          <Brand />
        </div>
        <Separator />
        <div className="flex-1 overflow-y-auto p-3">
          <Navigation items={navigation} />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="bg-background/95 sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          <Sheet onOpenChange={setMobileOpen} open={mobileOpen}>
            <SheetTrigger asChild>
              <Button
                aria-label="Open navigation"
                className="lg:hidden"
                size="icon"
                variant="outline"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-72 p-0" side="left">
              <SheetHeader className="border-b px-5 py-5 text-left">
                <SheetTitle>
                  <Brand />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Application navigation
                </SheetDescription>
              </SheetHeader>
              <div className="p-3">
                <Navigation
                  items={navigation}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <Brand compact />
          </div>
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-10 gap-3 px-2" variant="ghost">
                  <span className="bg-muted flex size-8 items-center justify-center rounded-full">
                    <UserRound className="size-4" aria-hidden="true" />
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block max-w-40 truncate text-sm font-medium">
                      {user.displayName}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {user.role}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <span className="block truncate">{user.displayName}</span>
                  <span className="text-muted-foreground block truncate text-xs font-normal">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                {onLogout ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={onLogout}>
                      <LogOut aria-hidden="true" />
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
