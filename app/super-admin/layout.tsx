import { SuperAdminSidebar } from "@/components/admin/SuperAdminSidebar";
import { ToastProvider } from "@/components/providers/ToastContext";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-black text-white flex">
                <SuperAdminSidebar />
                <main className="flex-1 ml-64 p-8 bg-zinc-950/50">
                    {children}
                </main>
            </div>
        </ToastProvider>
    );
}
