import React, { useState, useEffect } from 'react';

function Historial() {
  const [pedidos, setPedidos] = useState([]); 

  useEffect(() => {
    // 🔑 Rescatamos el token auténtico guardado durante el inicio de sesión
    const token = localStorage.getItem('token_autenticacion_sip');

    fetch('http://localhost:3000/api/pedidos', {
      method: 'GET',
      headers: {
        // 🔑 Inyectamos la cabecera de autenticación requerida por el backend seguro
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('No se pudo cargar el historial debido a restricciones de seguridad');
        }
        return res.json();
      })
      .then(data => setPedidos(data))
      .catch(err => console.error('Error cargando historial:', err));
  }, []);

  return (
    <div className="historial-container">
      <h2> Registro Real de Pedidos Procesados</h2>
      <div className="lista-historial">
        {pedidos.length === 0 ? (
          <p>Sin transacciones guardadas en MySQL.</p>
        ) : (
          pedidos.map(p => (
            <div key={p.pedido_id || p.id} className="card-historial">
              <div className="card-header">
                <h4>Orden #PED-00{p.pedido_id || p.id}</h4>
                <span>Estado: {p.estado}</span>
              </div>
              <p>Cliente: {p.cliente || p.usuario_id}</p>
              <p>Fecha: {new Date(p.fecha).toLocaleString('es-CO')}</p>
              <h4>Total Relacional: \${parseFloat(p.total).toLocaleString('es-CO')}</h4>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Historial;
