import React, { useState, useEffect } from 'react';

function Historial() {
  const [pedidos, setPedidos] = useState([]); 

  useEffect(() => {
    fetch('http://localhost:3000/api/pedidos')
      .then(res => res.json())
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
            <div key={p.pedido_id} className="card-historial">
              <div className="card-header">
                <h4>Orden #PED-00{p.pedido_id}</h4>
                <span>Estado: {p.estado}</span>
              </div>
              <p>Cliente: {p.cliente}</p>
              <p>Fecha: {new Date(p.fecha).toLocaleString('es-CO')}</p>
              <h4>Total Relacional: ${parseFloat(p.total).toLocaleString('es-CO')}</h4>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Historial;