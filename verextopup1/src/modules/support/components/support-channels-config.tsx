"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import {
  WhatsAppIcon,
  MessengerIcon,
  TelegramIcon,
  PhoneIcon,
  EmailIcon,
  TicketIcon,
} from "./brand-icons";
import { toast } from "sonner";
import { saveSupportWidgetAction } from "../actions";
import type { SupportWidgetConfig } from "../types";

export function SupportChannelsConfig({
  initial,
}: {
  initial: SupportWidgetConfig;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await saveSupportWidgetAction(
        { success: false },
        formData
      );
      if (result.success) {
        toast.success(result.message || "Saved!");
      } else {
        toast.error(result.message || "Failed");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Master toggle */}
      <Section title="🎛️ Master Control">
        <Toggle
          name="enabled"
          label="Enable Floating Support Widget"
          description="সাইটের সব page এ floating widget দেখাবে"
          defaultChecked={initial.enabled}
        />
      </Section>

      {/* Position & Greeting */}
      <Section title="📍 Position & Greeting">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Widget Position</Label>
            <select
              name="position"
              defaultValue={initial.position}
              className={input()}
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>

          <div>
            <Toggle
              name="greetingEnabled"
              label="Auto Greeting"
              description="প্রথম visit এ greeting popup"
              defaultChecked={initial.greetingEnabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div>
            <Label>Greeting (English)</Label>
            <input
              name="greetingMessage"
              defaultValue={initial.greetingMessage}
              placeholder="Need help? Chat with us!"
              className={input()}
              maxLength={120}
            />
          </div>
          <div>
            <Label>Greeting (বাংলা)</Label>
            <input
              name="greetingMessageBn"
              defaultValue={initial.greetingMessageBn}
              placeholder="সাহায্য দরকার? আমাদের সাথে চ্যাট করুন!"
              className={input()}
              maxLength={120}
            />
          </div>
        </div>
      </Section>

      {/* Channels */}
      <Section title="📱 Support Channels">
        <div className="space-y-4">
          {/* WhatsApp */}
          <ChannelRow
            icon={WhatsAppIcon} 
            name="whatsapp"
            label="WhatsApp"
            color="text-[#25D366]"
            enabled={initial.channels.whatsapp.enabled}
            fieldLabel="WhatsApp Number"
            fieldName="whatsapp_number"
            fieldValue={initial.channels.whatsapp.number}
            fieldPlaceholder="+8801700000000"
            channelLabel={initial.channels.whatsapp.label}
            channelLabelName="whatsapp_label"
          />

          {/* Messenger */}
          <ChannelRow
            icon={MessengerIcon}
            name="messenger"
            label="Messenger"
            color="text-[#0084FF]"
            enabled={initial.channels.messenger.enabled}
            fieldLabel="Facebook Username (without @)"
            fieldName="messenger_username"
            fieldValue={initial.channels.messenger.username}
            fieldPlaceholder="yourpage"
            channelLabel={initial.channels.messenger.label}
            channelLabelName="messenger_label"
          />

          {/* Telegram */}
          <ChannelRow
            icon={TelegramIcon}
            name="telegram"
            label="Telegram"
            color="text-[#0088cc]"
            enabled={initial.channels.telegram.enabled}
            fieldLabel="Telegram Username (without @)"
            fieldName="telegram_username"
            fieldValue={initial.channels.telegram.username}
            fieldPlaceholder="yourchannel"
            channelLabel={initial.channels.telegram.label}
            channelLabelName="telegram_label"
          />

          {/* Phone */}
          <ChannelRow
            icon={PhoneIcon}   
            name="phone"
            label="Phone Call"
            color="text-success"
            enabled={initial.channels.phone.enabled}
            fieldLabel="Phone Number"
            fieldName="phone_number"
            fieldValue={initial.channels.phone.number}
            fieldPlaceholder="+8801700000000"
            channelLabel={initial.channels.phone.label}
            channelLabelName="phone_label"
          />

          {/* Email */}
          <ChannelRow
            icon={EmailIcon}
            name="email"
            label="Email"
            color="text-accent"
            enabled={initial.channels.email.enabled}
            fieldLabel="Email Address"
            fieldName="email_address"
            fieldValue={initial.channels.email.email}
            fieldPlaceholder="support@example.com"
            channelLabel={initial.channels.email.label}
            channelLabelName="email_label"
          />

          {/* Ticket */}
          <div className="bg-bg-secondary rounded-lg p-3 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 min-w-[140px]">
              <TicketIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-primary">
                Support Ticket
              </span>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                name="ticket_enabled"
                defaultChecked={initial.channels.ticket.enabled}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="text-text-secondary">Enabled</span>
            </label>
            <input
              name="ticket_label"
              defaultValue={initial.channels.ticket.label}
              placeholder="Label"
              className={`${input()} flex-1 min-w-[120px] max-w-[200px]`}
              maxLength={20}
            />
          </div>
        </div>
      </Section>

      {/* Submit */}
      <div className="sticky bottom-4 bg-bg-card border border-border rounded-xl p-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-gradient-primary text-white font-semibold px-6 py-3 rounded-lg transition flex items-center gap-2 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isPending ? "Saving..." : "Save Settings"}
        </button>
        <p className="text-xs text-text-muted">
          পরিবর্তন সব user এর কাছে সাথে সাথে দেখা যাবে
        </p>
      </div>
    </form>
  );
}

// ==================================================
// HELPER COMPONENTS
// ==================================================
function input() {
  return "w-full px-3 py-2 rounded-lg border border-border bg-bg-card text-text-primary focus:outline-none focus:border-primary transition text-sm";
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 mt-0.5 text-primary rounded"
      />
      <div>
        <span className="text-sm font-medium text-text-primary">{label}</span>
        {description && (
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        )}
      </div>
    </label>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-text-muted mb-1.5">
      {children}
    </label>
  );
}

function ChannelRow({
  icon: Icon,
  name,
  label,
  color,
  enabled,
  fieldLabel,
  fieldName,
  fieldValue,
  fieldPlaceholder,
  channelLabel,
  channelLabelName,
}: {
  icon: any;
  name: string;
  label: string;
  color: string;
  enabled: boolean;
  fieldLabel: string;
  fieldName: string;
  fieldValue: string;
  fieldPlaceholder: string;
  channelLabel: string;
  channelLabelName: string;
}) {
  return (
    <div className="bg-bg-secondary rounded-lg p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 min-w-[140px]">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-medium text-text-primary">{label}</span>
        </div>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            name={`${name}_enabled`}
            defaultChecked={enabled}
            className="w-4 h-4 text-primary rounded"
          />
          <span className="text-text-secondary">Enabled</span>
        </label>

        <input
          name={channelLabelName}
          defaultValue={channelLabel}
          placeholder="Label"
          className={`${input()} max-w-[160px]`}
          maxLength={20}
        />
      </div>

      <div>
        <Label>{fieldLabel}</Label>
        <input
          name={fieldName}
          defaultValue={fieldValue}
          placeholder={fieldPlaceholder}
          className={input()}
        />
      </div>
    </div>
  );
}