import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { BRAND, WHATSAPP_NUMBER, buildWhatsAppLink } from "@/lib/constants";

export const metadata = { title: "Contact Us — AG Fresh Eggs" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-foreground">Contact Us</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Questions about an order, delivery, or bulk pricing? Reach {BRAND.parentCompany}
        {" "}directly — we usually reply within the hour.
      </p>

      <div className="mt-6 flex flex-col overflow-hidden rounded-2xl border border-border bg-white">
        <a
          href={buildWhatsAppLink("Namaste AG Enterprises, mujhe kuch puchna hai.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium text-foreground"
        >
          <MessageCircle size={18} className="text-ag-green" />
          <div>
            <p>WhatsApp</p>
            <p className="text-xs font-normal text-foreground-muted">
              +{WHATSAPP_NUMBER.replace(/^91/, "91 ")} — fastest way to reach us
            </p>
          </div>
        </a>
        <a
          href={`tel:+${WHATSAPP_NUMBER}`}
          className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-sm font-medium text-foreground"
        >
          <Phone size={18} className="text-ag-green" />
          <div>
            <p>Call us</p>
            <p className="text-xs font-normal text-foreground-muted">{BRAND.contactPhoneDisplay}</p>
          </div>
        </a>
        <a
          href={`mailto:${BRAND.contactEmail}`}
          className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-foreground"
        >
          <Mail size={18} className="text-ag-green" />
          <div>
            <p>Email</p>
            <p className="text-xs font-normal text-foreground-muted">{BRAND.contactEmail}</p>
          </div>
        </a>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-white p-4 text-sm text-foreground-muted">
        <MapPin size={18} className="mt-0.5 shrink-0 text-ag-green" />
        <p>
          {BRAND.parentCompany} delivers within 3&nbsp;KM of {BRAND.serviceLocationLabel}.
        </p>
      </div>

      <LinkButton
        href={buildWhatsAppLink("Namaste AG Enterprises, mujhe kuch puchna hai.")}
        className="mt-6 w-full"
      >
        Message us on WhatsApp
      </LinkButton>
    </div>
  );
}
