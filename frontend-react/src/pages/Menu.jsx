import React, { useState, useEffect } from 'react';
import './Menu.css';

// Imagen de respaldo por si un producto no trae 'imagen' desde la API
const IMAGEN_POR_DEFECTO =
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400';

function Menu({ usuario }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error('Error cargando productos:', err));
  }, []);

  const agregarAlCarrito = (prod) => {
    const existe = carrito.find(item => item.id === prod.id);
    if (existe) {
      setCarrito(carrito.map(item => item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCarrito([...carrito, { ...prod, cantidad: 1 }]);
    }
  };

  const modificarCantidad = (id, delta) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        const nuevaCant = item.cantidad + delta;
        return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  const enviarPedido = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: usuario.id,
          total: total,
          items: carrito.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio
          }))
        })
      });

      if (response.ok) {
        setMensajeExito('¡Pedido registrado con éxito en MySQL!');
        setCarrito([]);
        setTimeout(() => setMensajeExito(''), 4000);
      }
    } catch (err) {
      console.error('Error enviando pedido:', err);
    }
  };

  return (
    <div className="menu-container">
      <div className="productos-seccion">
        <h2>🍔 Nuestro Menú</h2>
        <div className="grid-productos">
          {productos.map(prod => (
            <div key={prod.id} className="card-producto">
              <img
                src={prod.imagen || IMAGEN_POR_DEFECTO}
                alt={prod.nombre}
                loading="lazy"
                className="card-imagen"
                onError={(e) => { e.target.src = IMAGEN_POR_DEFECTO; }}
              />
              <div className="card-producto-info">
                <h4>{prod.nombre}</h4>
                <p>{prod.descripcion}</p>
                <div className="precio">${parseFloat(prod.precio).toLocaleString('es-CO')}</div>
                <button onClick={() => agregarAlCarrito(prod)} className="btn-agregar">Añadir al Carrito</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="carrito-seccion">
        <h3>🛒 Tu Comanda Actual</h3>
        {mensajeExito && <div className="exito-box">{mensajeExito}</div>}
        {carrito.length === 0 ? (
          <p className="carrito-vacio">No hay ítems agregados.</p>
        ) : (
          <div>
            {carrito.map(item => (
              <div key={item.id} className="item-carrito">
                <img
                  src={item.imagen || IMAGEN_POR_DEFECTO}
                  alt={item.nombre}
                  className="item-carrito-img"
                  onError={(e) => { e.target.src = IMAGEN_POR_DEFECTO; }}
                />
                <div className="item-carrito-info">
                  <span className="item-nombre">{item.nombre}</span>
                  <span className="item-subtotal">${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
                </div>
                <div className="item-controles">
                  <button onClick={() => modificarCantidad(item.id, -1)} className="btn-cantidad">-</button>
                  <span className="cantidad-num">{item.cantidad}</span>
                  <button onClick={() => modificarCantidad(item.id, 1)} className="btn-cantidad">+</button>
                </div>
              </div>
            ))}
            <h4 className="total-pagar">Total a Pagar: ${total.toLocaleString('es-CO')}</h4>
            <button onClick={enviarPedido} className="btn-confirmar">Enviar Orden Directa a BD</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;
