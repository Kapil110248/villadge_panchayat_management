import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function ClerkLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="clerk" />
      <div className="flex-1 flex flex-col">
        <Navbar role="clerk" />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
