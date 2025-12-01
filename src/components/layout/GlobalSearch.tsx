"use client";

import * as React from "react";
import {
  Badge,
  Box,
  Calculator,
  Calendar,
  CreditCard,
  Cuboid,
  LayoutDashboard,
  Paintbrush,
  Palette,
  Search,
  Settings,
  Smile,
  Truck,
  User,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import { Button } from "../ui/button";
import Link from "next/link";

export function GlobalSearch() {
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Supplier", href: "/suppliers", icon: Truck },
    {
      name: "Barang",
      child: [
        { name: "Grade", href: "/items/grades", icon: Badge },
        { name: "Bahan Baku", href: "/items/raw-materials", icon: Palette },
        {
          name: "Barang Setengah Jadi",
          href: "/items/semi-finished",
          icon: Cuboid,
        },
        { name: "Barang Jadi", href: "/items/finished", icon: Box },
        { name: "Aksesoris Cat", href: "/items/accessories", icon: Paintbrush },
      ],
    },
    {
      name: "Pembelian",
      child: [
        { name: "Pembelian Bahan Baku", href: "/purchases/raw-materials" },
        { name: "Pembelian Aksesoris", href: "/purchases/accessories" },
      ],
    },
    {
      name: "Penjualan",
      child: [
        { name: "Penjualan Barang Jadi", href: "/sales/finished-goods" },
        { name: "Penjualan Aksesoris", href: "/sales/accessories" },
      ],
    },
  ];

  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant={"outline"}
        className="hidden w-full justify-between sm:flex"
        onClick={() => setOpen(true)}
      >
        <div className="text-muted-foreground flex items-center gap-1">
          <Search className="mr-1 h-4 w-4" />
          Search
        </div>
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />

        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {navItems.map((item) => {
            const ParentIcon = item.icon;

            return item.child ? (
              <div key={item.name}>
                <CommandGroup heading={item.name}>
                  {item.child.map((child) => {
                    // @ts-expect-error Type 'string | undefined' is not assignable to type 'JSX.Element | undefined'. (ICON)
                    const ChildIcon = child.icon;

                    return (
                      <CommandItem key={child.name} asChild>
                        <Link href={child.href} className="cursor-pointer">
                          {ChildIcon && <ChildIcon className="mr-2 h-4 w-4" />}
                          {child.name}
                        </Link>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />
              </div>
            ) : (
              <CommandItem key={item.name} asChild>
                <Link href={item.href} className="cursor-pointer">
                  {ParentIcon && <ParentIcon className="mr-2 h-4 w-4" />}
                  {item.name}
                </Link>
              </CommandItem>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
