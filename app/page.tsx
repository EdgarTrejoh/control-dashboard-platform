import { InfonavitDashboard } from "@/modules/infonavit/components/infonavit-dashboard";
import { AlphaAuthPanel } from "@/platform/auth/alpha-auth-panel";
import { getCurrentPlatformSession } from "@/platform/auth/auth-session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getCurrentPlatformSession();

  return (
    <>
      <AlphaAuthPanel />
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
          Inicia sesion con una cuenta Google invitada para consultar reportes
          de la closed alpha. Los endpoints de reporte se protegeran
          server-side en Closed Alpha 2.
        </p>
      </section>
    </main>
  );
}
