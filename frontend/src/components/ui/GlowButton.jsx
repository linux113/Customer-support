import { motion } from "framer-motion";

/**
 * Contained glow CTA — Motionsites-style.
 * Aura sits outside the pill; the button itself never drifts off-canvas.
 */
export default function GlowButton({
  children,
  className = "",
  type = "button",
  disabled = false,
  onClick,
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.03, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`glow-btn relative isolate inline-flex items-center justify-center overflow-visible rounded-full px-7 py-3.5 text-sm font-semibold text-ink-950 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span className="glow-btn-aura" aria-hidden />
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <span className="glow-btn-ring" />
      </span>
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
