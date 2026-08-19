export default function LiveBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#09090b]" />
      <div className="hx-wash" />
      <div className="hx-grid" />
      <div className="absolute inset-0 grain opacity-[0.08] mix-blend-soft-light" />
    </div>
  );
}
