import { motion } from "framer-motion";

export default function MotionButton({
  as = "button",
  className = "",
  children,
  ...props
}) {
  const Comp = motion[as] || motion.button;
  return (
    <Comp
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      className={className}
      {...props}
    >
      {children}
    </Comp>
  );
}
