//Função em paginas que só possam ser acessadas por visitantes ou seja
// pessoas que n estão logadas

// não permitir que paginas seja acessada por pessoas que estão logadas exemplo a pagina de login

import { parseCookies } from "nookies";

export function withSSRGuest(fn) {
  return async (ctx) => {
    const cookies = parseCookies(ctx);
    if (cookies["nextauth.token"]) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }

    return await fn(ctx);
  };
}
