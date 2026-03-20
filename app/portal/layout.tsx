import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getPortalAccessState } from "@/lib/auth/portal-access";
import PortalSidebar from "@/app/components/PortalSidebar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") ?? "";
  const isPortalLoginPath = pathname === "/portal/login";
  if (isPortalLoginPath) {
    return children;
  }

  const state = await getPortalAccessState();

  if (state.status === "unauthenticated") {
    redirect("/portal/login?next=/portal");
  }

  if (state.status === "forbidden") {
    return (
      <main className="p-6">
        <div className="rounded-[var(--r)] border p-5" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
          <h1 className="pg-title">Access Pending</h1>
          <p className="pg-sub">{state.message}</p>
        </div>
      </main>
    );
  }

  return (
    <div className="shell">
      <PortalSidebar
        email={state.access.email}
        clientId={state.access.clientId}
      />
      <main className="p-6">{children}</main>
    </div>
  );
}
