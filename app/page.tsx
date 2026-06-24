import { InfonavitDashboard } from "@/modules/infonavit/components/infonavit-dashboard";
import { AlphaAuthPanel } from "@/platform/auth/alpha-auth-panel";
import { getCurrentPlatformSession } from "@/platform/auth/auth-session";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams?: Promise<{
    reason?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session = await getCurrentPlatformSession();
  const params = searchParams ? await searchParams : {};
  const reason = Array.isArray(params.reason)
    ? params.reason[0]
    : params.reason;

  return (
    <>
      <AlphaAuthPanel
        session={session}
        showInactiveMessage={reason === "inactive"}
      />
      {session ? <InfonavitDashboard /> : <AlphaLockedState />}
    </>
  );
}

function AlphaLockedState() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:px-8">
      <section className="rounded-md border border-line bg-white p-6">
        <h1 className="text-2xl font-bold text-ink">
          Acceso restringido a invitacion
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          Inicia sesión con una cuenta Google invitada para consultar reportes
          de la closed alpha. El acceso está protegido server-side mediante
          invitación directa y permisos de consulta.
        </p>
      </section>
    </main>
  );
}
