import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { StickyCartBar } from "@/components/layout/StickyCartBar";
import { ChatWidget } from "@/components/ai/ChatWidget";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1 pb-24 sm:pb-8">{children}</main>
      <StickyCartBar />
      <BottomNav />
      <ChatWidget />
    </>
  );
}
