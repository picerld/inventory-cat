"use client";

import { useEffect, useState } from "react";
import { trpc } from "~/utils/trpc";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Box, CornerDownRight, Search } from "lucide-react";
import Link from "next/link";
import useDebounce from "~/hooks/use-debounce";

export default function GlobalSearch() {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const [query, setQuery] = useState<string>("");
  const debouncedSearch = useDebounce(query, 500);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hidden px-5 sm:flex w-full justify-start">
          <Search className="mr-1 h-4 w-4" />
          Cari di sini!
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Cari barang kamu di sini!
          </DialogTitle>
          <DialogDescription>
            Klik pada barang yang ingin kamu cari.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Cari barang atau menu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="flex flex-col space-y-2">
            {!debouncedSearch.length && (
              <p className="text-muted-foreground">
                Cari barang yang ingin kamu cari di sini!
              </p>
            )}
            <p className="text-muted-foreground text-sm">No results found.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
