"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, Sparkles } from "lucide-react";
import type { SupportWidgetConfig } from "../types";
import {
  WhatsAppIcon,
  MessengerIcon,
  TelegramIcon,
  PhoneIcon,
  EmailIcon,
  TicketIcon,
} from "./brand-icons";

export function FloatingSupportWidget({
  config,
  isLoggedIn,
}: {
  config: SupportWidgetConfig;
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (
      config.enabled &&
      config.greetingEnabled &&
      !sessionStorage.getItem("support_greeting_shown")
    ) {
      const timer = setTimeout(() => {
        setShowGreeting(true);
        sessionStorage.setItem("support_greeting_shown", "true");
        setTimeout(() => setShowGreeting(false), 8000);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [config.enabled, config.greetingEnabled]);

  if (!mounted || !config.enabled) return null;

  const whatsappLink = config.channels.whatsapp.enabled
    ? `https://wa.me/${config.channels.whatsapp.number.replace(/[^0-9]/g, "")}`
    : null;

  const messengerLink = config.channels.messenger.enabled
    ? `https://m.me/${config.channels.messenger.username}`
    : null;

  const telegramLink = config.channels.telegram.enabled
    ? `https://t.me/${config.channels.telegram.username.replace("@", "")}`
    : null;

  const phoneLink = config.channels.phone.enabled
    ? `tel:${config.channels.phone.number}`
    : null;

  const emailLink = config.channels.email.enabled
    ? `mailto:${config.channels.email.email}`
    : null;

  const ticketLink = config.channels.ticket.enabled
    ? isLoggedIn
      ? "/account/support/new"
      : `/login?callbackUrl=${encodeURIComponent("/account/support/new")}`
    : null;

  const channels = [
    whatsappLink && {
      icon: WhatsAppIcon,
      label: config.channels.whatsapp.label,
      href: whatsappLink,
      external: true,
      color: "bg-[#25D366] text-white",
    },
    messengerLink && {
      icon: MessengerIcon,
      label: config.channels.messenger.label,
      href: messengerLink,
      external: true,
      color: "bg-gradient-to-br from-[#00B2FF] to-[#006AFF] text-white",
    },
    telegramLink && {
      icon: TelegramIcon,
      label: config.channels.telegram.label,
      href: telegramLink,
      external: true,
      color: "bg-[#0088cc] text-white",
    },
    phoneLink && {
      icon: PhoneIcon,
      label: config.channels.phone.label,
      href: phoneLink,
      external: false,
      color: "bg-success text-white",
    },
    emailLink && {
      icon: EmailIcon,
      label: config.channels.email.label,
      href: emailLink,
      external: false,
      color: "bg-accent text-white",
    },
    ticketLink && {
      icon: TicketIcon,
      label: config.channels.ticket.label,
      href: ticketLink,
      external: false,
      color: "bg-gradient-primary text-white",
    },
  ].filter(Boolean) as Array<{
    icon: any;
    label: string;
    href: string;
    external: boolean;
    color: string;
  }>;

  const position = config.position === "bottom-left" ? "left-5" : "right-5";
  const tooltipPosition =
    config.position === "bottom-left" ? "left-full ml-4" : "right-full mr-4";

  return (
    <>
      {/* Greeting tooltip */}
      {showGreeting && !open && (
        <div
          className={`fixed ${position} bottom-24 z-[10002] max-w-xs bg-bg-card border border-primary/30 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300`}
        >
          <button
            type="button"
            onClick={() => setShowGreeting(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-bg-secondary text-text-muted"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-text-primary">
                VerexTopUp Support
              </div>
              <div className="text-xs text-text-muted mt-0.5 leading-relaxed">
                {config.greetingMessageBn || config.greetingMessage}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel list */}
      <div
        className={`fixed ${position} bottom-24 z-[10002] flex flex-col gap-3 transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {channels.map((ch, idx) => {
          const Icon = ch.icon;
          return (
            <Link
              key={idx}
              href={ch.href}
              target={ch.external ? "_blank" : undefined}
              rel={ch.external ? "noopener noreferrer" : undefined}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${idx * 40}ms` : "0ms" }}
              className="group flex items-center justify-end gap-3 transition-all"
            >
              <span
                className={`bg-bg-card border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition ${tooltipPosition}`}
              >
                {ch.label}
              </span>
              <div
                className={`w-12 h-12 rounded-full ${ch.color} flex items-center justify-center shadow-lg hover:scale-110 transition`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main toggle button */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setShowGreeting(false);
        }}
        className={`fixed ${position} bottom-5 z-[10002] w-14 h-14 rounded-full bg-gradient-primary text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform ${
          !open ? "animate-pulse" : ""
        }`}
        aria-label="Support"
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}

        {!open && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-bg-card">
            <span className="absolute inset-0 rounded-full bg-success animate-ping" />
          </span>
        )}
      </button>
    </>
  );
}