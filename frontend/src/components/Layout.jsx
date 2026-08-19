import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";
import LiveBackground from "./ui/LiveBackground.jsx";
import PageTransition from "./ui/PageTransition.jsx";

const nav = [
  { to: "/", label: "Queue", end: true },
  { to: "/tickets/new", label: "New ticket", end: false },
];

export default function Layout() {
  return (
    <div className="relative min-h-screen text-white">
      <LiveBackground />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sm font-semibold text-zinc-950">
              G
            </div>
            <div>
              <p className="font-display text-xl leading-none tracking-tight">Ganesh</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/40">
                Support desk
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className="relative rounded-full px-4 py-2 text-sm"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 ${isActive ? "text-zinc-950" : "text-white/70"}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </motion.header>

        <main className="mt-8 flex-1">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>

        <footer className="mt-10 border-t border-white/10 pt-4 text-center text-xs text-white/35">
          All rights reserved by Anonmoyous Developer
        </footer>
      </div>
    </div>
  );
}
