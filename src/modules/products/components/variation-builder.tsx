"use client";

import { Plus, Trash2, GripVertical, Copy } from "lucide-react";

export type Variation = {
  id?: string;
  name: string;
  sku: string;
  price: number | string;
  salePrice: number | string;
  costPrice: number | string;
  usdtPrice: number | string;   // ← ✅ নতুন
  stock: number | string;
  unlimitedStock: boolean;
  status: "ACTIVE" | "INACTIVE";
  icon: string;
  sortOrder: number;
};

export function VariationBuilder({
  variations,
  onChange,
}: {
  variations: Variation[];
  onChange: (v: Variation[]) => void;
}) {
  const add = () => {
    onChange([
      ...variations,
      {
        name: "",
        sku: "",
        price: "",
        salePrice: "",
        costPrice: "",
        usdtPrice: "",         // ← ✅
        stock: "",
        unlimitedStock: true,
        status: "ACTIVE",
        icon: "",
        sortOrder: variations.length,
      },
    ]);
  };

  const update = (index: number, patch: Partial<Variation>) => {
    onChange(
      variations.map((v, i) => (i === index ? { ...v, ...patch } : v))
    );
  };

  const remove = (index: number) => {
    onChange(variations.filter((_, i) => i !== index));
  };

  const duplicate = (index: number) => {
    const copy = {
      ...variations[index],
      id: undefined,
      name: variations[index].name + " (copy)",
    };
    onChange([
      ...variations.slice(0, index + 1),
      copy,
      ...variations.slice(index + 1),
    ]);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...variations];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const moveDown = (index: number) => {
    if (index === variations.length - 1) return;
    const next = [...variations];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">
          মোট {variations.length} টা variation
        </p>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 bg-gradient-primary text-white font-medium px-4 py-2 rounded-lg transition text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Variation
        </button>
      </div>

      {variations.length === 0 && (
        <div className="bg-bg-secondary rounded-lg p-8 text-center border border-dashed border-border">
          <p className="text-text-muted text-sm">
            এখনো কোনো variation নেই। "Add Variation" ক্লিক করুন।
          </p>
        </div>
      )}

      <div className="space-y-3">
        {variations.map((v, i) => (
          <div
            key={i}
            className="bg-bg-secondary rounded-lg p-4 border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-text-muted">
                <GripVertical className="w-4 h-4" />
                <span className="text-xs font-mono">#{i + 1}</span>
                {v.id && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                    SAVED
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="p-1.5 rounded hover:bg-bg-card text-text-muted disabled:opacity-30"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(i)}
                  disabled={i === variations.length - 1}
                  className="p-1.5 rounded hover:bg-bg-card text-text-muted disabled:opacity-30"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => duplicate(i)}
                  className="p-1.5 rounded hover:bg-bg-card text-text-muted hover:text-primary"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="p-1.5 rounded hover:bg-danger/10 text-text-muted hover:text-danger"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2 md:col-span-2">
                <Label>Variation নাম *</Label>
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="100 Diamonds"
                  className={input}
                />
              </div>

              <div>
                <Label>Icon (optional)</Label>
                <input
                  type="text"
                  value={v.icon}
                  onChange={(e) => update(i, { icon: e.target.value })}
                  placeholder="💎"
                  className={input}
                />
              </div>

              <div>
                <Label>SKU</Label>
                <input
                  type="text"
                  value={v.sku}
                  onChange={(e) => update(i, { sku: e.target.value })}
                  placeholder="FF-100"
                  className={`${input} font-mono text-xs`}
                />
              </div>

              <div>
                <Label>Price (৳) *</Label>
                <input
                  type="number"
                  step="0.01"
                  value={v.price}
                  onChange={(e) => update(i, { price: e.target.value })}
                  placeholder="85"
                  className={input}
                />
              </div>

              {/* ✅ নতুন: USDT Price */}
              <div>
                <Label>USDT Price ($)</Label>
                <input
                  type="number"
                  step="0.01"
                  value={v.usdtPrice}
                  onChange={(e) => update(i, { usdtPrice: e.target.value })}
                  placeholder="auto (rate থেকে)"
                  className={input}
                />
                <p className="mt-1 text-[10px] text-text-muted">
                  খালি রাখলে auto-convert হবে
                </p>
              </div>

              <div>
                <Label>Sale Price (৳)</Label>
                <input
                  type="number"
                  step="0.01"
                  value={v.salePrice}
                  onChange={(e) => update(i, { salePrice: e.target.value })}
                  placeholder="optional"
                  className={input}
                />
              </div>

              <div>
                <Label>Cost Price (৳)</Label>
                <input
                  type="number"
                  step="0.01"
                  value={v.costPrice}
                  onChange={(e) => update(i, { costPrice: e.target.value })}
                  placeholder="admin only"
                  className={input}
                />
              </div>

              <div>
                <Label>Status</Label>
                <select
                  value={v.status}
                  onChange={(e) =>
                    update(i, {
                      status: e.target.value as "ACTIVE" | "INACTIVE",
                    })
                  }
                  className={input}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label>Stock</Label>
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) => update(i, { stock: e.target.value })}
                  placeholder="Unlimited"
                  disabled={v.unlimitedStock}
                  className={`${input} disabled:opacity-50`}
                />
              </div>

              <div className="col-span-2 md:col-span-3 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={v.unlimitedStock}
                    onChange={(e) =>
                      update(i, { unlimitedStock: e.target.checked })
                    }
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-text-primary">Unlimited stock</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const input =
  "w-full px-3 py-2 text-sm rounded-lg border border-border bg-bg-card text-text-primary focus:outline-none focus:border-primary transition";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-text-muted mb-1">
      {children}
    </label>
  );
}