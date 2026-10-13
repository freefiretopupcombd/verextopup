"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Plus, GripVertical } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  icon: string | null;
  price: number;
  salePrice: number | null;
  currency: string;
  status: string;
};

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  icon: string | null;
};

// ==================================================
// PRODUCT PICKER
// ==================================================
// Search + select products manually.
// - Search box with debounce
// - Results list
// - Selected products list (orderable)
// ==================================================
export function ProductPicker({
  selected,
  onChange,
  searchAction,
}: {
  selected: Product[];
  onChange: (products: Product[]) => void;
  searchAction: (query: string) => Promise<SearchResult[]>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await searchAction(query.trim());
        // Filter out already-selected
        const selectedIds = new Set(selected.map((p) => p.id));
        setResults(found.filter((r) => !selectedIds.has(r.id)));
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected, searchAction]);

  const handleAdd = async (result: SearchResult) => {
    // Fetch full product details
    const fullProduct: Product = {
      id: result.id,
      name: result.name,
      slug: result.slug,
      thumbnail: result.thumbnail,
      icon: result.icon,
      price: 0,
      salePrice: null,
      currency: "BDT",
      status: "ACTIVE",
    };

    onChange([...selected, fullProduct]);
    setQuery("");
    setResults([]);
    toast.success(`"${result.name}" যোগ হয়েছে`);
  };

  const handleRemove = (id: string) => {
    onChange(selected.filter((p) => p.id !== id));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const copy = [...selected];
    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
    onChange(copy);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === selected.length - 1) return;
    const copy = [...selected];
    [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name="productIds"
        value={JSON.stringify(selected.map((p) => p.id))}
      />

      {/* Search box */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Product search করুন..."
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-bg-card text-text-primary text-sm focus:outline-none focus:border-primary transition"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
        )}
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-lg max-h-60 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleAdd(r)}
              className="w-full flex items-center gap-3 p-3 hover:bg-bg-card transition text-left border-b border-border last:border-0"
            >
              <div className="w-10 h-10 rounded-lg bg-bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
                {r.thumbnail ? (
                  <img
                    src={r.thumbnail}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                ) : r.icon ? (
                  <span className="text-lg">{r.icon}</span>
                ) : (
                  <span className="text-lg">🎮</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">
                  {r.name}
                </div>
                <div className="text-xs text-text-muted font-mono truncate">
                  /{r.slug}
                </div>
              </div>
              <Plus className="w-4 h-4 text-primary shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Empty search result */}
      {query && !searching && results.length === 0 && (
        <p className="text-xs text-text-muted text-center py-2">
          কোনো product পাওয়া যায়নি
        </p>
      )}

      {/* Selected products */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">
            Selected ({selected.length})
          </span>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-danger hover:underline"
            >
              সব clear করুন
            </button>
          )}
        </div>

        {selected.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <p className="text-xs text-text-muted">
              উপরে search করে product select করুন
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {selected.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-2 p-2 bg-bg-secondary border border-border rounded-lg"
              >
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0}
                    className="text-text-muted hover:text-primary disabled:opacity-30 text-[10px] leading-none"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx === selected.length - 1}
                    className="text-text-muted hover:text-primary disabled:opacity-30 text-[10px] leading-none"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>

                <div className="w-9 h-9 rounded-md bg-bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {p.thumbnail ? (
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : p.icon ? (
                    <span className="text-sm">{p.icon}</span>
                  ) : (
                    <span className="text-sm">🎮</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-text-primary truncate">
                    {p.name}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(p.id)}
                  className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger transition shrink-0"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}