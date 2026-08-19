import { motion } from "framer-motion";
import GlowButton from "./ui/GlowButton.jsx";

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.07 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const TICKER = [
  "Payment failed · TKT-001",
  "Password reset · TKT-002",
  "Invoice GSTIN · TKT-003",
  "Checkout crash · TKT-004",
  "Wrong address · TKT-005",
  "Duplicate charge · TKT-006",
];

export default function Hero({ onCreate, stats }) {
  return (
    <section className="hero-stage relative overflow-hidden rounded-[28px] px-6 py-12 sm:px-10 sm:py-16">
      <motion.p
        custom={0}
        variants={fade}
        initial="hidden"
        animate="show"
        className="text-[11px] uppercase tracking-[0.28em] text-white/45"
      >
        Ganesh · Support CRM
      </motion.p>

      <motion.h1
        custom={1}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-4 max-w-3xl font-display text-5xl leading-[0.92] tracking-tight text-white sm:text-6xl lg:text-7xl"
      >
        Customer
        <br />
        Support
      </motion.h1>

      <motion.p
        custom={2}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-5 max-w-lg text-base leading-7 text-white/55"
      >
        File cases, search the queue, change status and leave internal notes.
        Built for agents and managers.
      </motion.p>

      <motion.div
        custom={3}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <GlowButton onClick={onCreate}>Create ticket</GlowButton>
        <a
          href="#queue"
          className="rounded-full border border-white/15 px-6 py-3.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
        >
          Jump to queue
        </a>
      </motion.div>

      <motion.dl
        custom={4}
        variants={fade}
        initial="hidden"
        animate="show"
        className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        <HeroStat label="Total" value={stats?.total} />
        <HeroStat label="Open" value={stats?.open} />
        <HeroStat label="In progress" value={stats?.in_progress} />
        <HeroStat label="Closed" value={stats?.closed} />
      </motion.dl>

      <div className="hx-ticker mt-10" aria-hidden>
        <div className="hx-ticker-track">
          {[...TICKER, ...TICKER].map((item, index) => (
            <span key={`${item}-${index}`} className="hx-ticker-item">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
      <dt className="text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</dt>
      <dd className="mt-1 font-display text-2xl leading-none text-white">{value ?? "—"}</dd>
    </div>
  );
}
