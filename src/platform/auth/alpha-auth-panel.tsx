import { signIn, signOut } from "../../../auth";
import { getAlphaAuthViewModel } from "@/platform/auth/alpha-auth-view-model";
import { InactivitySignOut } from "@/platform/auth/inactivity-signout";
import type { OptionalPlatformSession } from "@/platform/auth/session-placeholder";

type AlphaAuthPanelProps = {
  session: OptionalPlatformSession;
  showInactiveMessage?: boolean;
};

export function AlphaAuthPanel({
  session,
  showInactiveMessage = false
}: AlphaAuthPanelProps) {
  const viewModel = getAlphaAuthViewModel(session);

  return (
    <section className="rounded-md border border-line bg-white p-4">
      <InactivitySignOut enabled={viewModel.isSignedIn} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">
            Closed Alpha Access
          </h2>
          <p className="text-sm leading-6 text-slate-700">
            Acceso exclusivo por invitación. Inicia sesión con la cuenta Google
            autorizada para consultar reportes protegidos server-side.
          </p>
          {showInactiveMessage ? (
            <p className="mt-2 text-sm font-medium text-amber-700">
              Tu sesión se cerró por inactividad.
            </p>
          ) : null}
          {viewModel.accountLabel ? (
            <p className="mt-2 text-xs text-slate-500">
              Cuenta activa: {viewModel.accountLabel}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {viewModel.isSignedIn ? (
            <>
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/" });
                }}
              >
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
                  type="submit"
                >
                  Cambiar cuenta
                </button>
              </form>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
                  type="submit"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
                type="submit"
              >
                Entrar con Google
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
