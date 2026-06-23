import { signIn, signOut } from "../../../auth";

export function AlphaAuthPanel() {
  return (
    <section className="rounded-md border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">
            Closed Alpha Access
          </h2>
          <p className="text-sm leading-6 text-slate-700">
            Acceso por invitacion directa con Google. La allowlist se valida
            server-side y no habilita signup publico.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark"
              type="submit"
            >
              Entrar con Google
            </button>
          </form>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50"
              type="submit"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
