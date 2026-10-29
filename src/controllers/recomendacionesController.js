// SIP-Suggest: motor de sugerencias por reglas de asociación (núcleo de Apriori, pares 1→1)
// IMPORTANTE: ajusta esta línea para que importe el pool igual que lo hace productosController.js
const pool = require('../config/db');

const MIN_PARES = 2;        // mínimo de pedidos donde aparece el par (soporte mínimo)
const MIN_CONFIANZA = 0.2;  // confianza mínima de la regla A -> B
const MAX_CARRITO = 20;     // máximo de productos distintos aceptados en la petición
const TOP_N = 2;            // cantidad de sugerencias a devolver

const redondear = (n, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

/**
 * Lógica pura del modelo (sin base de datos, fácil de probar).
 * @param {Set<string>[]} pedidos  cada pedido es un conjunto de nombres de producto
 * @param {string[]} carrito       nombres de los productos del carrito actual
 * @returns {{tipo:string, reglas:Array}}
 */
function calcularRecomendaciones(pedidos, carrito, topN = TOP_N) {
  const N = pedidos.length;
  const enCarrito = new Set(carrito);
  const conteoItem = new Map(); // nombre -> nº de pedidos que lo contienen
  const conteoPar = new Map();  // "A|B" -> nº de pedidos con A (carrito) y B (candidato)

  for (const pedido of pedidos) {
    for (const item of pedido) conteoItem.set(item, (conteoItem.get(item) || 0) + 1);
    for (const a of carrito) {
      if (!pedido.has(a)) continue;
      for (const b of pedido) {
        if (enCarrito.has(b)) continue;
        const k = `${a}|${b}`;
        conteoPar.set(k, (conteoPar.get(k) || 0) + 1);
      }
    }
  }

  // Para cada candidato B, nos quedamos con la mejor regla A -> B
  const mejor = new Map();
  for (const [k, pares] of conteoPar) {
    const [a, b] = k.split('|');
    const confianza = pares / conteoItem.get(a);
    const lift = confianza / (conteoItem.get(b) / N);
    if (pares < MIN_PARES || confianza < MIN_CONFIANZA || lift <= 1) continue;
    const previa = mejor.get(b);
    if (!previa || confianza > previa.confianza || (confianza === previa.confianza && lift > previa.lift)) {
      mejor.set(b, { nombre: b, basadoEn: a, confianza, lift, soporte: pares / N });
    }
  }

  const reglas = [...mejor.values()]
    .sort((x, y) => y.confianza - x.confianza || y.lift - x.lift)
    .slice(0, topN);

  if (reglas.length > 0) return { tipo: 'asociacion', reglas };

  // Arranque en frío: sin reglas útiles -> más vendidos que no estén en el carrito
  const masVendidos = [...conteoItem.entries()]
    .filter(([nombre]) => !enCarrito.has(nombre))
    .sort((x, y) => y[1] - x[1])
    .slice(0, topN)
    .map(([nombre, c]) => ({ nombre, basadoEn: null, confianza: null, lift: null, soporte: c / N }));
  return { tipo: 'respaldo_mas_vendidos', reglas: masVendidos };
}

const error400 = (res, error) => res.status(400).json({ success: false, error });

exports.calcularRecomendaciones = calcularRecomendaciones;

exports.recomendar = async (req, res, next) => {
  try {
    const { usuario_id, productos } = req.body || {};

    // ---- Validación de datos de entrada ----
    if (!Number.isInteger(usuario_id) || usuario_id <= 0) {
      return error400(res, 'usuario_id debe ser un número entero positivo');
    }
    if (!Array.isArray(productos) || productos.length === 0) {
      return error400(res, 'productos debe ser un arreglo con al menos un ID');
    }
    if (!productos.every((id) => Number.isInteger(id) && id > 0)) {
      return error400(res, 'Todos los IDs de productos deben ser enteros positivos');
    }
    const ids = [...new Set(productos)];
    if (ids.length > MAX_CARRITO) {
      return error400(res, `El carrito no puede superar ${MAX_CARRITO} productos distintos`);
    }

    const [usuario] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [usuario_id]);
    if (usuario.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    const [catalogo] = await pool.query(
      'SELECT id, nombre, descripcion, precio, categoria, stock FROM productos ORDER BY id'
    );
    const porId = new Map(catalogo.map((p) => [p.id, p]));
    const inexistentes = ids.filter((id) => !porId.has(id));
    if (inexistentes.length > 0) {
      return res.status(404).json({ success: false, error: `Productos inexistentes: ${inexistentes.join(', ')}` });
    }

    // El catálogo tiene nombres repetidos con distinto ID: se trabaja por NOMBRE
    const carrito = [...new Set(ids.map((id) => porId.get(id).nombre))];
    const representante = new Map(); // nombre -> primer producto con stock disponible
    for (const p of catalogo) {
      if (p.stock > 0 && !representante.has(p.nombre)) representante.set(p.nombre, p);
    }

    // Histórico global y anónimo de pedidos (no se perfila al usuario)
    const [filas] = await pool.query(
      'SELECT dp.pedido_id, p.nombre FROM detalles_pedidos dp JOIN productos p ON p.id = dp.producto_id'
    );
    const mapaPedidos = new Map();
    for (const f of filas) {
      if (!mapaPedidos.has(f.pedido_id)) mapaPedidos.set(f.pedido_id, new Set());
      mapaPedidos.get(f.pedido_id).add(f.nombre);
    }
    const pedidos = [...mapaPedidos.values()];

    const { tipo, reglas } = calcularRecomendaciones(pedidos, carrito, TOP_N * 3);

    const recomendaciones = reglas
      .filter((r) => representante.has(r.nombre))
      .slice(0, TOP_N)
      .map((r) => {
        const p = representante.get(r.nombre);
        return {
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          categoria: p.categoria,
          confianza: r.confianza === null ? null : redondear(r.confianza),
          lift: r.lift === null ? null : redondear(r.lift),
          soporte: redondear(r.soporte),
          motivo: r.basadoEn
            ? `Quienes pidieron ${r.basadoEn} también añadieron este producto`
            : 'Uno de los productos más vendidos'
        };
      });

    res.json({
      success: true,
      tipo,
      total_pedidos_analizados: pedidos.length,
      carrito: ids.map((id) => ({ id, nombre: porId.get(id).nombre })),
      recomendaciones
    });
  } catch (err) {
    next(err);
  }
};
