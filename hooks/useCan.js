import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { validadeUserPermissions } from "../utils/ValidateUserPermissions";

export function useCan({ permissions, roles }) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    // Se o user não tiver autenticado ja pode retornar falso direto
    return false;
  }

  const userHasValidPermissions = validadeUserPermissions({
    user,
    permissions,
    roles,
  });

  return userHasValidPermissions; // se ele passou de todas essas condições que pode acabar retornando false então ai sim ele tem permissão
}
