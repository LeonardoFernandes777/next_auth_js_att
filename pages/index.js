import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import styles from "../styles/Home.module.css";
import { parseCookies } from "nookies";
import { withSSRGuest } from "../utils/withSSRGuest";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event) {
    event.preventDefault();
    const data = {
      email,
      password,
    };
    await signIn(data);
  }
  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Entrar</button>
    </form>
  );
}

export const getServerSideProps = withSSRGuest(async (ctx) => {
  //verificar se o cookie ja existe na parte do serverside de existir ja redirecionar para a rota /dashboard
  return { props: {} };
});
