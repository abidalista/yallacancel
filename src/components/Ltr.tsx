import { ReactNode } from "react";

interface LtrProps {
  children: ReactNode;
  className?: string;
}

/** Keeps numbers + English units in correct order inside RTL Arabic layouts. */
export default function Ltr({ children, className = "" }: LtrProps) {
  return (
    <span dir="ltr" className={`ltr-always ${className}`.trim()}>
      {children}
    </span>
  );
}
