import axios from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false; // essa variavel vai verificar se eu estou atualizando o token ou não
let failedRequestQueue = []; //fila das requisições que aconteceram e deram falha por conta do token expired

export function setupApiClient(ctx = undefined) {
  let cookies = parseCookies(ctx);
  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Beares ${cookies["nextauth.token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => {
      return response; // se a resposta der certo não fazer nada
    },
    (error) => {
      if (error.response.status === 401) {
        if (error.response.data?.code === "token.expired") {
          //filtrando se a resposta for do erro 401 e a msg for token.expired

          cookies = parseCookies(ctx); // atualizando os cookies para ter eles sempre atualizado
          const { "nextauth.refreshToken": refreshToken } = cookies; // buscar dentro dos cookies o refreshToken
          const originalConfig = error.config; //dentro do config tem todas as informações que preciso /para repetir uma requisição para o backend Ex: qual rota eu chamei, qual era o callback e por ai vai
          if (!isRefreshing) {
            isRefreshing = true; // quando eu receber a primeira resposta com o token invalido, eu vou atualizar o token e as outas não vao acontecer, pq ja vou ter mudado o isRefreshing para true
            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data; //pegando o novo token, refreshToken e salvando dentro dos cookies
                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 23 * 30, // 30 days
                  path: "/",
                });
                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 23 * 30, // 30 days
                    path: "/",
                  }
                );
                api.defaults.headers["Authorization"] = `Bearer ${token}`; //atualizando o token que é enviado pelo headers
                failedRequestQueue.forEach((request) =>
                  request.onSucess(token)
                ); // para cada requisição falhada, pegar o metodo onSucess e executar com o novo token
                failedRequestQueue = []; // dps limpar a lista e deixar em branco dnv
              })
              .catch((err) => {
                failedRequestQueue.forEach((request) => request.onFailure(err)); // para cada requisição falhada, pegar o metodo onFailure e executar com o err
                failedRequestQueue = []; // dps limpar a lista e deixar em branco dnv
                if (process.browser) {
                  //verifica se esta sendo executado no browser ou no servidor
                  signOut(); //se for true ele está rodando no lado do browser signOut só deve funcionar se for executado pelo browser
                }
              })
              .finally(() => {
                isRefreshing = false; // quando finalizar tudo setar a variavel isRefreshing para false dnv
              });
          }
          //criando fila de requisições
          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSucess: (token) => {
                //oq vai acontecer quando o processo tiver finalizado
                originalConfig.headers["Authorization"] = `Bearer ${token}`; // trocar pelo novo token
                resolve(api(originalConfig)); //nova requisição passando o original config como parametro
              },
              onFailure: (err) => {
                // Oq vai acontecer casa o processo de refresh tenha dado errado
                reject(err);
              },
            });
          });
        } else {
          //se o erro for 401 e a msg n for token.expired deslogar o usuario
          if (process.browser) {
            //verifica se esta sendo executado no browser ou no servidor
            signOut(); //se for true ele está rodando no lado do browser signOut só deve funcionar se for executado pelo browser
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }
      return Promise.reject(error);
    }
  );
  return api;
}
