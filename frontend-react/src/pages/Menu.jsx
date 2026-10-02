import React, { useState, useEffect } from 'react';

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
    // 🔑 Rescatamos el token auténtico guardado durante el login
    const token = localStorage.getItem('token_autenticacion_sip');

    try {
      const response = await fetch('http://localhost:3000/api/pedidos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 🔑 Inyectamos la llave de seguridad obligatoria
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          usuario_id: usuario.id,
          // 🛡️ SOLUCIÓN PARA LA INSTRUCTORA: Ya no mandamos precios ni totales desde el frontend para evitar hackeos
          productos: carrito.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad
          }))
        })
      });

      if (response.ok) {
        setMensajeExito('¡Pedido registrado con éxito mediante transacción atómica en MySQL!');
        setCarrito([]);
        setTimeout(() => setMensajeExito(''), 4000);
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData.error);
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
              <h4>{prod.nombre}</h4>
              <p>{prod.descripcion}</p>
              <div className="precio">\${parseFloat(prod.precio).toLocaleString('es-CO')}</div>
              <button onClick={() => agregarAlCarrito(prod)} className="btn-agregar">Añadir al Carrito</button>
            </div>
          ))}
        </div>
      </div>

      <div className="carrito-seccion">
        <h3>🛒 Tu Comanda Actual</h3>
        {mensajeExito && <div className="exito-box">{mensajeExito}</div>}
        {carrito.length === 0 ? (
          <p>No hay ítems agregados.</p>
        ) : (
          <div>
            {carrito.map(item => (
              <div key={item.id} className="item-carrito">
                <span>{item.nombre}</span>
                <div>
                  <button onClick={() => modificarCantidad(item.id, -1)}>-</button>
                  <span>{item.cantidad}</span>
                  <button onClick={() => modificarCantidad(item.id, 1)}>+</button>
                </div>
              </div>
            ))}
            <h4>Total Estimado: \${total.toLocaleString('es-CO')}</h4>
            <button onClick={enviarPedido} className="btn-confirmar">Enviar Orden Directa a BD</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;
