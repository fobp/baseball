'use client';
import styles from "./lobby.module.css";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { db, auth } from "../firebase";
import { ref, push, onValue, set, get } from "firebase/database";
import { signOut } from "firebase/auth";


export default function LobbyPage() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const rol = searchParams.get("rol");
  const email = searchParams.get("email");

  const [nuevoArticulo, setNuevoArticulo] = useState({
    titulo: "",
    descripcion: ""
  });
  const [articulos, setArticulos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  
// ⬇️ AQUÍ PEGAS LO SIGUIENTE
const [menuAbierto, setMenuAbierto] = useState(null);


const toggleMenu = (id) => {
  setMenuAbierto(prev => (prev === id ? null : id));
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/"; // Redirige al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  
// ⬆️ AQUÍ TERMINA
useEffect(() => {
  const handleClickOutside = (event) => {
    // Si haces clic en algo que no es el botón ⋮ ni el menú abierto, cierra el menú
    const esBotonMenu = event.target.closest(`.${styles.menuBtn}`);
    const esMenuOpciones = event.target.closest(`.${styles.menuOpciones}`);

    if (!esBotonMenu && !esMenuOpciones) {
      setMenuAbierto(null);
    }
  };

  window.addEventListener("click", handleClickOutside);
  return () => {
    window.removeEventListener("click", handleClickOutside);
  };
}, []);
  // Cargar notas desde Firebase
  useEffect(() => {
    setLoading(true);
    const notasRef = ref(db, "notas");
    onValue(notasRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setArticulos([]);
        setLoading(false);
        return;
      }
      const arrayNotas = Object.entries(data).map(([id, nota]) => ({
        id,
        ...nota
      }));
      const filtrado = rol === "admin"
        ? arrayNotas
        : arrayNotas.filter(n => n.uid === uid);
      setArticulos(filtrado);
      setLoading(false);
    });
  }, [uid, rol]);
  

  const handleChange = (e) => {
    setNuevoArticulo({ ...nuevoArticulo, [e.target.name]: e.target.value });
    setError("");
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    const nota = articulos.find((a) => a.id === id);
    if (nota) {
      const notaActualizada = { ...nota, estado: nuevoEstado };
      const notaRef = ref(db, `notas/${id}`);
      await set(notaRef, notaActualizada);
    }
  };
  const handleGuardar = async () => {
    if (!nuevoArticulo.titulo || !nuevoArticulo.descripcion) {
      setError("Completa todos los campos antes de guardar.");
      return;
    }
    setError("");
    if (modoEdicion && idEditando) {
      const notaRef = ref(db, `notas/${idEditando}`);
      const snapshot = await get(notaRef);
      const notaAnterior = snapshot.val();
      const nuevaNota = {
        ...notaAnterior,
        ...nuevoArticulo,
      };
      await set(notaRef, nuevaNota);
      const historialRef = ref(db, `historialCambios/${idEditando}`);
      await push(historialRef, {
        antes: notaAnterior,
        despues: nuevaNota,
        fechaHora: new Date().toISOString(),
        editorUid: uid,
        editorEmail: email
      });
    } else {
      const nuevaNota = {
        ...nuevoArticulo,
        uid,
        email,
        fecha: new Date().toISOString(),
        estado: "normal"
      };
      const notasRef = ref(db, "notas");
      await push(notasRef, nuevaNota);
    }
    setNuevoArticulo({ titulo: "", descripcion: "" });
    setModoEdicion(false);
    setIdEditando(null);
  };

  const handleEditar = (id) => {
    const nota = articulos.find((a) => a.id === id);
    if (nota) {
      setNuevoArticulo({
        titulo: nota.titulo,
        descripcion: nota.descripcion
      });
      setModoEdicion(true);
      setIdEditando(id);
      setMenuAbierto(null); // 👈 CIERRA el menú al editar
    }
  };

  const handleEliminar = async (id) => {
    const notaRef = ref(db, `notas/${id}`);
    await set(notaRef, null);
    setMenuAbierto(null); // 👈 CIERRA el menú al eliminar
  };

  const handleCancelar = () => {
    setNuevoArticulo({ titulo: "", descripcion: "" });
    setModoEdicion(false);
    setIdEditando(null);
  };

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  return (
    <div className={styles.page}>
     <div className={styles.header}>
  <div className={styles.titulo}>DROPS</div>
  <div className={styles.userControls}>
    <span className={styles.email}>{email}</span>
    <button className={styles.salirBtn} onClick={handleLogout}>
      <span className={styles.iconoSalir}>🚪</span>
      Cerrar sesión
    </button>
  </div>
</div>

      <input
        className={styles.input}
        name="titulo"
        placeholder="Título"
        value={nuevoArticulo.titulo}
        onChange={handleChange}
      />
      <textarea
        className={styles.input}
        name="descripcion"
        placeholder="Descripción"
        value={nuevoArticulo.descripcion}
        onChange={handleChange}
      />
      {error && <p style={{ color: 'red', textAlign: 'center', margin: 0 }}>{error}</p>}
      <div className={styles.botonesForm}>
        <button
          className={styles.boton}
          onClick={handleGuardar}
          disabled={!nuevoArticulo.titulo || !nuevoArticulo.descripcion}
          style={{ opacity: (!nuevoArticulo.titulo || !nuevoArticulo.descripcion) ? 0.6 : 1 }}
        >
          {modoEdicion ? "Guardar cambios" : "Agregar artículo"}
        </button>
        {modoEdicion && (
          <button className={styles.botonCancelar} onClick={handleCancelar}>
            Cancelar
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <span style={{ fontSize: 22 }}>Cargando artículos...</span>
        </div>
      ) : (
        <>
          {rol === "admin" && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '24px 0 8px 0', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 600 }}>
                Estado:
                <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{ marginLeft: 8, padding: 6, borderRadius: 6 }}>
                  <option value="todos">Todos</option>
                  <option value="normal">Normal</option>
                  <option value="rojo">Quemado</option>
                  <option value="parpadeando">En proceso</option>
                  <option value="liquidado">Liquidado</option>
                </select>
              </label>
              <input
                type="text"
                placeholder="Buscar por título o descripción..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ padding: 6, borderRadius: 6, border: '1px solid #d1d5db', minWidth: 220 }}
              />
            </div>
          )}
          <ul className={styles.lista}>
            {articulos
              .filter(a => filtroEstado === "todos" || a.estado === filtroEstado)
              .filter(a =>
                a.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
                a.descripcion.toLowerCase().includes(busqueda.toLowerCase())
              )
              .map((articulo) => (
                <li key={articulo.id} className={`${styles.item} ${styles[articulo.estado] || ""}`}>
                  <strong>{articulo.titulo}</strong>
                  <p>{articulo.descripcion}</p>
                  <span className={styles.fecha}>📅 {articulo.fecha ? new Date(articulo.fecha).toLocaleString() : ""}</span>
                  {(rol === "admin" || articulo.uid === uid) && (
                    <div className={styles.menuWrapper}>
                      <button className={styles.menuBtn} onClick={() => toggleMenu(articulo.id)}>⋮</button>
                      {menuAbierto === articulo.id && (
                        <div className={styles.menuOpciones}>
                          <button onClick={() => handleEditar(articulo.id)} className={styles.menuItem}>✏️ Editar</button>
                          {rol === "admin" && (
                            <button onClick={() => handleEliminar(articulo.id)} className={styles.menuItemEliminar}>🗑️ Eliminar</button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {rol === "admin" && (
                    <div className={styles.botonesEstado}>
                      <button onClick={() => handleCambiarEstado(articulo.id, "normal")} className={`${styles.estadoBtn} ${styles.normalBtn}`}>Normal</button>
                      <button onClick={() => handleCambiarEstado(articulo.id, "rojo")} className={`${styles.estadoBtn} ${styles.rojoBtn}`}>Quemado</button>
                      <button onClick={() => handleCambiarEstado(articulo.id, "parpadeando")} className={`${styles.estadoBtn} ${styles.parpadeaBtn}`}>En proceso</button>
                      <button onClick={() => handleCambiarEstado(articulo.id, "liquidado")} className={`${styles.estadoBtn} ${styles.azulBtn}`}>Liquidado</button>
                    </div>
                  )}
                  {rol === "admin" && (
                    <button
                      className={styles.boton}
                      style={{marginTop: 8, fontSize: 12}}
                      onClick={() => window.location.href = `/admin/historial?notaId=${articulo.id}&uid=${uid}&rol=${rol}&email=${email}`}
                    >
                      Ver historial de cambios
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </>
      )}
    </div>
  );
}
