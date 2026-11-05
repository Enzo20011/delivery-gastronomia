import AuthProvider from "@/components/AuthProvider";
import AdminNav from "@/components/AdminNav";
import DemoBanner from "@/components/DemoBanner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-base-950">
        {process.env.NEXT_PUBLIC_DEMO_MODE === "1" && <DemoBanner />}
        <AdminNav />
        <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
      </div>
    </AuthProvider>
  );
}
