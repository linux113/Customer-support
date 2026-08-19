import { NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Queue", end: true },
  { to: "/tickets/new", label: "New ticket", end: false },
];

export default function Layout() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-ink-900 text-cream-50 shadow-card">
              <span className="font-display text-lg leading-none">D</span>
              <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-brass-400" />
            </div>
            <div>
              <p className="font-display text-xl leading-none tracking-tight">
                Datastraw
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-ink-500">
                Support desk
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-full border border-ink-900/10 bg-white/70 p-1 shadow-inset backdrop-blur">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-ink-900 text-cream-50"
                      : "text-ink-700 hover:bg-ink-900/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mt-8 flex-1">
          <Outlet />
        </main>

        <footer className="mt-10 flex flex-col gap-1 border-t border-ink-900/10 pt-4 text-xs text-ink-500 sm:flex-row sm:justify-between">
          <span>Datastraw internship assessment · Customer Support CRM</span>
          <span>Tickets persist on the server. Notes are internal only.</span>
        </footer>
      </div>
    </div>
  );
}
