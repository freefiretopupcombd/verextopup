import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";

export function ContactCards({
  supportEmail,
  whatsappNumber,
  isLoggedIn,
}: {
  supportEmail: string;
  whatsappNumber: string;
  isLoggedIn: boolean;
}) {
  const ticketHref = isLoggedIn
    ? "/account/support/new"
    : `/login?callbackUrl=${encodeURIComponent("/account/support/new")}`;

  const cards = [
    {
      icon: Send,
      title: "Support Ticket",
      description: isLoggedIn
        ? "নতুন ticket তৈরি করুন"
        : "Login করে ticket তৈরি করুন",
      action: isLoggedIn ? "Create Ticket" : "Login to Continue",
      href: ticketHref,
      color: "primary",
      badge: "Fastest",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: supportEmail,
      action: "Send Email",
      href: `mailto:${supportEmail}`,
      color: "accent",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: whatsappNumber,
      action: "Chat Now",
      href: `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`,
      color: "success",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "9 AM - 9 PM (BST)",
      action: "Coming Soon",
      href: "#",
      color: "warning",
      disabled: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const colors = {
          primary: "bg-primary/10 text-primary group-hover:bg-primary/20",
          accent: "bg-accent/10 text-accent group-hover:bg-accent/20",
          success: "bg-success/10 text-success group-hover:bg-success/20",
          warning: "bg-warning/10 text-warning group-hover:bg-warning/20",
        };

        if (card.disabled) {
          return (
            <div
              key={card.title}
              className="relative bg-bg-card border border-border rounded-xl p-5 opacity-60 cursor-not-allowed"
            >
              <div
                className={`w-11 h-11 rounded-xl ${colors[card.color as keyof typeof colors]} flex items-center justify-center mb-3`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-text-primary text-sm">
                {card.title}
              </h3>
              <p className="text-xs text-text-muted mt-1">{card.description}</p>
              <div className="text-[11px] text-text-dim mt-3">
                {card.action}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={card.title}
            href={card.href}
            className="group relative bg-bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-lg transition"
          >
            {card.badge && (
              <span className="absolute top-3 right-3 text-[9px] font-bold uppercase bg-success/15 text-success px-2 py-0.5 rounded">
                {card.badge}
              </span>
            )}
            <div
              className={`w-11 h-11 rounded-xl ${colors[card.color as keyof typeof colors]} flex items-center justify-center mb-3 transition group-hover:scale-110`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-text-primary text-sm">
              {card.title}
            </h3>
            <p className="text-xs text-text-muted mt-1 truncate">
              {card.description}
            </p>
            <div className="text-[11px] text-primary mt-3 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              {card.action} →
            </div>
          </Link>
        );
      })}
    </div>
  );
}