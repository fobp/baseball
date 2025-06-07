'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "./firebase"; 
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [datos, setDatos] = useState({ correo: "", contraseña: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const { correo, contraseña } = datos;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, correo, contraseña);
      const user = userCredential.user;
      const uid = user.uid;

      // Obtener el rol desde Realtime Database
      const rolRef = ref(db, `usuarios/${uid}`);
      console.log("UID autenticado:", uid);

const snapshot = await get(rolRef);
console.log("Snapshot raw:", snapshot);
console.log("Snapshot.val():", snapshot.val());

      if (snapshot.exists()) {
        const { rol } = snapshot.val();

        // Redirigir con UID y rol en query string
        router.push(`/lobby?uid=${uid}&rol=${rol}&email=${correo}`);
      } else {
        setError("Tu cuenta no tiene rol asignado.");
      }
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <p className={styles.titulo}>Iniciar Sesión</p>

      <input
        className={styles.input}
        type="email"
        placeholder="Correo"
        name="correo"
        value={datos.correo}
        onChange={handleChange}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Contraseña"
        name="contraseña"
        value={datos.contraseña}
        onChange={handleChange}
      />
      <button className={styles.boton} onClick={handleLogin}>Ingresar</button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
