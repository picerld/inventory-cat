import {
  Menu,
  PaintbrushVertical,
  User,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { ModeToggle } from "../ui/mode-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { trpc } from "~/utils/trpc";
import Cookies from "js-cookie";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import React from "react";
import { skipToken } from "@tanstack/react-query";
import { LogoutButton } from "./LogoutButton";
import type { INavItem } from "./NavItemComponent";
import NavItemComponent from "./NavItemComponent";
import { useSidebar } from "~/context/SidebarContext";
import { GlobalSearch } from "./GlobalSearch";

export default function GuardedLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const pathName = usePathname();

  const { expandedItems, toggleExpanded, setExpanded } = useSidebar();

  const token = Cookies.get("auth.token");

  const { data: user } = trpc.auth.authMe.useQuery(
    token ? { token } : skipToken,
    {
      retry: false,
      enabled: !!token,
      refetchOnWindowFocus: false,
    },
  );

  const navItem: INavItem[] = [
    { name: "Dashboard", href: "/dashboard", active: false },
    { name: "Supplier", href: "/suppliers", active: false },
    {
      name: "Barang",
      href: "/items",
      active: false,
      children: [
        { name: "Grade", href: "/items/grades", active: false },
        { name: "Bahan Baku", href: "/items/raw-materials", active: false },
        {
          name: "Barang Setengah Jadi",
          href: "/items/semi-finished",
          active: false,
        },
        { name: "Barang Jadi", href: "/items/finished", active: false },
        { name: "Aksesoris Cat", href: "/items/accessories", active: false },
        { name: "Barang Return", href: "/items/returns", active: false },
      ],
    },
    {
      name: "Pembelian",
      href: "/purchases",
      active: false,
      children: [
        {
          name: "Pembelian Bahan Baku",
          href: "/purchases/raw-material",
          active: false,
        },
        {
          name: "Pembelian Aksesoris Cat",
          href: "/purchases/accessories",
          active: false,
        },
      ],
    },
    {
      name: "Penjualan",
      href: "/sales",
      active: false,
      children: [
        {
          name: "Penjualan Bahan Jadi",
          href: "/sales/finished",
          active: false,
        },
        {
          name: "Penjualan Aksesoris Cat",
          href: "/sales/accessories",
          active: false,
        },
      ],
    },
  ];

  const updatedNavItem = navItem.map((item) => ({
    ...item,
    active: pathName === item.href || pathName.includes(item.href),
    children: item.children?.map((child: INavItem) => ({
      ...child,
      active: pathName === child.href || pathName.includes(child.href),
    })),
  }));

  React.useEffect(() => {
    const parentsToExpand = updatedNavItem
      .filter((item) => item.children?.some((child) => child.active))
      .map((item) => item.name);

    setExpanded(parentsToExpand);
  }, [pathName]);

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="flex min-h-screen">
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 shrink-0 lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetHeader></SheetHeader>
                <SheetContent side="left" className="w-72">
                  <nav className="mt-6">
                    <div className="text-muted-foreground mb-4 px-3 text-xs font-semibold tracking-wider uppercase">
                      Menu
                    </div>
                    {updatedNavItem.map((item) => (
                      <NavItemComponent
                        key={item.name}
                        item={item}
                        isMobile={true}
                        expandedItems={expandedItems}
                        toggleExpanded={toggleExpanded}
                      />
                    ))}
                  </nav>
                  <SheetFooter className="mt-6 flex-col space-y-2">
                    <div className="bg-muted flex w-full items-center justify-center rounded-md border px-3 py-2 text-sm">
                      {user ? user.name : "Unknown"}
                    </div>
                    <LogoutButton />
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Link
                href="/"
                className="group group flex shrink-0 items-center gap-2"
              >
                <div className="bg-primary rounded-lg p-2 transition-all group-hover:scale-110 group-hover:shadow-lg">
                  <PaintbrushVertical className="text-primary-foreground h-5 w-5" />
                </div>
                <h1 className="hidden text-lg font-semibold tracking-tight lg:block">
                  Inventory
                </h1>
              </Link>

              <div className="hidden max-w-xs flex-1 lg:ml-16 lg:block">
                <GlobalSearch />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="lg:hidden">{/* <GlobalSearch /> */}</div>

              <ModeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-primary/10 relative rounded-full"
                  >
                    <Bell className="h-5 w-5" />
                    <Badge className="bg-destructive absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">
                      3
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="font-semibold">
                    Notifications
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem className="flex cursor-pointer flex-col items-start p-3">
                      <div className="flex w-full items-start gap-2">
                        <div className="bg-primary/10 rounded-full p-1.5">
                          <Bell className="text-primary h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            New order received
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            Order #1234 needs your attention
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            2 minutes ago
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex cursor-pointer flex-col items-start p-3">
                      <div className="flex w-full items-start gap-2">
                        <div className="rounded-full bg-blue-500/10 p-1.5">
                          <User className="h-3 w-3 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            New user registered
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            John Doe just signed up
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            1 hour ago
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex cursor-pointer flex-col items-start p-3">
                      <div className="flex w-full items-start gap-2">
                        <div className="rounded-full bg-green-500/10 p-1.5">
                          <Bell className="h-3 w-3 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Stock updated</p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            Item inventory has been updated
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            3 hours ago
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-primary cursor-pointer justify-center text-sm">
                    View all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="bg-primary/10 relative h-10 gap-2 rounded-full pr-3 pl-2"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user ? getUserInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium lg:inline-block">
                      {user ? user.name : "Unknown"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm leading-none font-medium">
                        {user ? user.name : "Unknown"}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user?.username || "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="bg-background fixed top-16 left-0 hidden h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r lg:block">
          <nav className="flex h-full flex-col pt-4">
            <div className="text-muted-foreground mb-2 px-5 text-xs font-semibold tracking-wider uppercase">
              Menu
            </div>
            {updatedNavItem.map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                expandedItems={expandedItems}
                toggleExpanded={toggleExpanded}
              />
            ))}

            <div className="mt-auto border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hover:bg-muted h-auto w-full justify-start gap-3 p-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user ? getUserInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
                      <p className="truncate text-sm font-medium">
                        {user ? user.name : "Unknown"}
                      </p>
                      <p className="text-muted-foreground truncate text-xs">
                        {user?.username || "user@example.com"}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <LogoutButton />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>

        <div className="min-h-screen flex-1 pt-16 lg:ml-64">
          <div className="min-h-[calc(100vh-4rem)] w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="bg-card rounded-lg border p-6">{children}</div>
          </div>
          <footer className="mt-auto border-t py-6">
            <p className="text-muted-foreground text-center text-sm">
              &copy; {new Date().getFullYear()}. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
