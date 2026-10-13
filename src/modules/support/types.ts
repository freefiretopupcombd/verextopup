// ==================================================
// SUPPORT WIDGET CONFIG
// ==================================================

export type SupportChannel =
  | "whatsapp"
  | "messenger"
  | "telegram"
  | "phone"
  | "email"
  | "ticket";

export type SupportWidgetConfig = {
  enabled: boolean;
  position: "bottom-right" | "bottom-left";
  greetingEnabled: boolean;
  greetingMessage: string;
  greetingMessageBn: string;

  channels: {
    whatsapp: {
      enabled: boolean;
      number: string; // +8801700000000
      label: string;
    };
    messenger: {
      enabled: boolean;
      username: string; // yourpage (without @)
      label: string;
    };
    telegram: {
      enabled: boolean;
      username: string; // yourchannel (without @)
      label: string;
    };
    phone: {
      enabled: boolean;
      number: string;
      label: string;
    };
    email: {
      enabled: boolean;
      email: string;
      label: string;
    };
    ticket: {
      enabled: boolean;
      label: string;
    };
  };
};

export const DEFAULT_SUPPORT_CONFIG: SupportWidgetConfig = {
  enabled: true,
  position: "bottom-right",
  greetingEnabled: true,
  greetingMessage: "Need help? Chat with us!",
  greetingMessageBn: "সাহায্য দরকার? আমাদের সাথে চ্যাট করুন!",
  channels: {
    whatsapp: {
      enabled: true,
      number: "+8801700000000",
      label: "WhatsApp",
    },
    messenger: {
      enabled: true,
      username: "verextopup",
      label: "Messenger",
    },
    telegram: {
      enabled: true,
      username: "verextopup",
      label: "Telegram",
    },
    phone: {
      enabled: false,
      number: "+8801700000000",
      label: "Call Us",
    },
    email: {
      enabled: true,
      email: "support@verextopup.com",
      label: "Email",
    },
    ticket: {
      enabled: true,
      label: "Support Ticket",
    },
  },
};

export const SUPPORT_CONFIG_KEY = "support_widget_config";