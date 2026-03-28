"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  categories: { id: string; name: string; slug: string }[];
}

export function FilterBar({ categories }: FilterBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get("category");
  const currentQuery = searchParams.get("q")?.toString() || "";

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (currentCategory === slug) {
      params.delete("category"); // Toggle off
    } else {
      params.set("category", slug);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-6 mb-12 w-full">
      <div className="relative max-w-md w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          className="w-full bg-muted/50 border-0 rounded-full pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-shadow"
          placeholder="Search catalog..."
          defaultValue={currentQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        <button
          onClick={() => {
            const params = new URLSearchParams(searchParams);
            params.delete("category");
            startTransition(() => router.replace(`${pathname}?${params.toString()}`));
          }}
          className={cn(
            "snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all",
            !currentCategory
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          All Iterms
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={cn(
              "snap-start whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all border border-transparent",
              currentCategory === cat.slug
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted select-none hover:text-foreground hover:border-border/50"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
