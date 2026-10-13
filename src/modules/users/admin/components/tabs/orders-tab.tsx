import Link from "next/link";
import { ShoppingBag, ExternalLink } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
};

export function OrdersTab({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-12 text-center">
        <ShoppingBag className="w-10 h-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted">এই user এর কোনো order নেই</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary border-b border-border">
            <tr className="text-left">
              <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                Order
              </th>
              <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-right">
                Amount
              </th>
              <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-center">
                Payment
              </th>
              <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold text-center">
                Status
              </th>
              <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-text-muted font-semibold hidden md:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-bg-secondary/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders?search=${o.orderNumber}`}
                    className="font-mono text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    #{o.orderNumber}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
                <td className="px-4 py-3 text-right font-bold text-text-primary">
                  ৳{o.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      o.paymentStatus === "PAID"
                        ? "text-success"
                        : o.paymentStatus === "UNPAID"
                          ? "text-warning"
                          : "text-danger"
                    }`}
                  >
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[10px] font-bold uppercase bg-bg-secondary text-text-secondary px-2 py-0.5 rounded">
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-text-muted">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}