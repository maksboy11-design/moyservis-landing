/** Domain types — Lead */

export type LeadChannel = "form" | "callback" | "phone" | "vk" | "max" | "visit";

export type DeviceType = "phone" | "laptop" | "pc" | "console" | "other";

export type ContactPref = "phone" | "messenger";

export type LeadPayload = {
  name: string;
  phone: string;
  message?: string;
  deviceType: DeviceType;
  contactPref: ContactPref;
  callback: boolean;
  consent: boolean;
  source?: string;
  channel?: LeadChannel;
};
