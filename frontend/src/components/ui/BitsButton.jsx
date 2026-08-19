import Magnet from "../reactbits/Magnet.jsx";
import StarBorder from "../reactbits/StarBorder.jsx";

/**
 * Primary CTA: React Bits Magnet + Star Border.
 * https://reactbits.dev/animations/magnet
 * https://reactbits.dev/animations/star-border
 */
export default function BitsButton({
  as = "button",
  children,
  color = "#c9a44a",
  className = "",
  innerClassName = "",
  magnet = true,
  ...props
}) {
  const button = (
    <StarBorder
      as={as}
      color={color}
      speed="5s"
      thickness={2}
      className={className}
      innerClassName={innerClassName}
      {...props}
    >
      {children}
    </StarBorder>
  );

  if (!magnet) return button;

  return (
    <Magnet padding={48} magnetStrength={3.2} wrapperClassName="inline-block">
      {button}
    </Magnet>
  );
}
