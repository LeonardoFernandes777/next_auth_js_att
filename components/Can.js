import { useCan } from "../hooks/useCan";

export function Can({ children, permissions, roles }) {
  const userCanSeeComponent = useCan({ permissions, roles });

  if (!userCanSeeComponent) {
    return null;
  }
  return <>{children}</>;
}
