//Função em paginas que só possam ser acessadas por pessoas logadas

// não permitir que pessoas n logadas acesse tais paginas

import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import decode from "jwt-decode";
import { validadeUserPermissions } from "./ValidateUserPermissions";

export function withSSRAuth(fn, options) {
  return async (ctx) => {
    const cookies = parseCookies(ctx);
    const token = cookies["nextauth.token"];

    if (!token) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    if (options) {
      const user = decode(token);

      const { permissions, roles } = options;

      const userHasValidPermissions = validadeUserPermissions({
        user,
        permissions,
        roles,
      });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            //deve enviar o user para uma pagina que todos os user tem acesso
            // se não tiver uma pagina que todos tem acesso então enviar para
            // notFound: true
            destination: "/dashboard",
            permanent: false,
          },
        };
      }
    }

    try {
      return await fn(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        destroyCookie(ctx, "nextauth.token");
        destroyCookie(ctx, "nextauth.refreshToken");
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
}
