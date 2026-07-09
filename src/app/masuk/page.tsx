import { redirect } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function MasukPage() {
  const user = await getCurrentUser();
  if (user) redirect("/beranda");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-teal-50 to-slate-100 px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30">
            <FlaskConical className="h-9 w-9" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Delta Indonesia Laboratory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manajemen Tugas — masuk untuk melihat tugas Anda
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
