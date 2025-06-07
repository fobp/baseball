"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { ref, onValue } from "firebase/database";

export default function HistorialCambiosPage() {
  const searchParams = useSearchParams();
  const notaId = searchParams.get("notaId");
  const uid = searchParams.get("uid");
  const rol = searchParams.get("rol");
  const email = searchParams.get("email");
  const [cambios, setCambios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!notaId) return;
    setLoading(true);
    setError("");
    const historialRef = ref(db, `historialCambios/${notaId}`);
    try {
      onValue(historialRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setCambios([]);
          setLoading(false);
          return;
        }
        const arr = Object.values(data).sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
        setCambios(arr);
        setLoading(false);
      }, (err) => {
        setError("Error al leer el historial: " + err.message);
        setLoading(false);
      });
    } catch (err) {
      setError("Error inesperado: " + err.message);
      setLoading(false);
    }
  }, [notaId]);

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 4px 24px #0001", padding: 32 }}>
      <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: "#22223b", marginBottom: 24 }}>Historial de Cambios</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {loading ? (
        <p style={{ textAlign: "center" }}>Cargando historial...</p>
      ) : cambios.length === 0 && !error ? (
        <p style={{ textAlign: "center" }}>No hay cambios registrados para esta nota.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {cambios.map((cambio, idx) => (
            <li key={idx} style={{ marginBottom: 28, borderBottom: "1px solid #e5e7eb", paddingBottom: 18 }}>
              <div style={{ fontSize: 15, color: "#374151", marginBottom: 6 }}>
                <b>Fecha:</b> {new Date(cambio.fechaHora).toLocaleString()}<br />
                <b>Usuario:</b> {cambio.antes?.email || "-"}
                {cambio.editorEmail && (
                  <><br /><b>Editado por:</b> {cambio.editorEmail}</>
                )}
              </div>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <b>Antes:</b>
                  <div style={{ background: "#f3f4f6", borderRadius: 8, padding: 10, marginTop: 4 }}>
                    <div><b>Título:</b> {cambio.antes?.titulo || <i>Sin título</i>}</div>
                    <div><b>Descripción:</b> {cambio.antes?.descripcion || <i>Sin descripción</i>}</div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <b>Después:</b>
                  <div style={{ background: "#e0f2fe", borderRadius: 8, padding: 10, marginTop: 4 }}>
                    <div><b>Título:</b> {cambio.despues?.titulo || <i>Sin título</i>}</div>
                    <div><b>Descripción:</b> {cambio.despues?.descripcion || <i>Sin descripción</i>}</div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div style={{ textAlign: "center", marginTop: 24 }}>
        <a href={`/lobby?uid=${uid}&rol=${rol}&email=${email}`} style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "underline" }}>Volver al lobby</a>
      </div>
    </div>
  );
} 