/**
 * Star Border — React Bits
 * https://reactbits.dev/animations/star-border
 * Source: DavidHDev/react-bits (JS + Tailwind)
 */
export default function StarBorder({
  as: Component = "button",
  className = "",
  color = "white",
  speed = "6s",
  thickness = 1,
  innerClassName = "",
  children,
  ...rest
}) {
  const { style: restStyle, ...pass } = rest;

  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-full ${className}`}
      style={{
        padding: `${thickness}px 0`,
        ...restStyle,
      }}
      {...pass}
    >
      <div
        className="absolute bottom-[-11px] right-[-250%] z-0 h-[50%] w-[300%] rounded-full opacity-70 animate-star-movement-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute left-[-250%] top-[-10px] z-0 h-[50%] w-[300%] rounded-full opacity-70 animate-star-movement-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={`relative z-[1] rounded-full border border-ink-800 bg-gradient-to-b from-ink-800 to-ink-950 px-[26px] py-[12px] text-center text-sm font-medium text-cream-50 ${innerClassName}`}
      >
        {children}
      </div>
    </Component>
  );
}
