import { SettingsForm } from "./SettingsForm";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Loyalty, referrals, delivery, and ordering rules — changes apply immediately.
      </p>
      <div className="mt-4">
        <SettingsForm />
      </div>
    </div>
  );
}
