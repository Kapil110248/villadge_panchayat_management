import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function CitizenLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="citizen" />
      <div className="flex-1 flex flex-col">
        <Navbar role="citizen" />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
