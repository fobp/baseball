'use client'
import { useState } from "react";

export default function useArticulos() {
  const [articulos, setArticulos] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [nuevoArticulo, setNuevoArticulo] = useState({
    titulo: "",
    descripcion: ""
  });

  const handleChange = (e) => {
    setNuevoArticulo({ ...nuevoArticulo, [e.target.name]: e.target.value });
  };

  const handleGuardar = () => {
    const fechaActual = new Date().toLocaleDateString();

    if (modoEdicion) {
      setArticulos(articulos.map((a) =>
        a.id === idEditando ? { ...nuevoArticulo, id: idEditando, fecha: fechaActual } : a
      ));
      setModoEdicion(false);
      setIdEditando(null);
    } else {
      const nuevo = {
        ...nuevoArticulo,
        id: Date.now(),
        fecha: fechaActual,
      };
      setArticulos([...articulos, nuevo]);
    }

    setNuevoArticulo({ titulo: "", descripcion: "" });
  };

  const handleEditar = (id) => {
    const articulo = articulos.find((a) => a.id === id);
    setNuevoArticulo({
      titulo: articulo.titulo,
      descripcion: articulo.descripcion,
    });
    setModoEdicion(true);
    setIdEditando(id);
  };

  const handleEliminar = (id) => {
    setArticulos(articulos.filter((a) => a.id !== id));
  };

  return {
    articulos,
    nuevoArticulo,
    modoEdicion,
    handleChange,
    handleGuardar,
    handleEditar,
    handleEliminar
  };
}
