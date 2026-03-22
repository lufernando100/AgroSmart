// Tipos generados manualmente — reemplazar con: supabase gen types typescript
// cuando el proyecto esté conectado a Supabase

export type SectorTipo = 'cafe' | 'ganaderia' | 'cacao' | 'otro'
export type UsuarioRol = 'caficultor' | 'almacen' | 'admin' | 'cooperativa'
export type PedidoEstado = 'pendiente' | 'confirmado' | 'rechazado' | 'entregado' | 'cancelado'
export type PrecioOrigen = 'manual' | 'foto_whatsapp' | 'integracion_api' | 'referencia_sipsa'
export type GastoCategoria = 'fertilizante' | 'agroquimico' | 'herramienta' | 'mano_de_obra' | 'transporte' | 'semilla' | 'otro'
export type CultivoEtapa = 'almacigo' | 'levante' | 'produccion' | 'zoca'
export type LoteEstado = 'recien_sembrado' | 'en_produccion' | 'para_renovar' | 'renovado'
export type AlertaTipo = 'clima' | 'plaga' | 'precio' | 'fertilizacion' | 'cosecha' | 'general'
export type ConversacionCanal = 'whatsapp' | 'pwa'

export interface Usuario {
  id: string
  telefono: string
  nombre: string
  cedula?: string
  cedula_cafetera?: string
  rol: UsuarioRol
  sector: SectorTipo
  avatar_url?: string
  activo: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Finca {
  id: string
  usuario_id: string
  nombre: string
  vereda?: string
  municipio: string
  departamento: string
  altitud_msnm?: number
  ubicacion?: unknown // PostGIS GEOGRAPHY
  area_total_ha?: number
  created_at: string
  updated_at: string
}

export interface Lote {
  id: string
  finca_id: string
  nombre: string
  variedad?: string
  edad_anios?: number
  densidad_plantas_ha?: number
  porcentaje_sombrio?: number
  area_ha?: number
  estado: LoteEstado
  poligono?: unknown // PostGIS GEOGRAPHY
  etapa: CultivoEtapa
  ultima_floracion?: string
  fecha_estimada_cosecha?: string
  fecha_fertilizacion?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  nombre: string
  sector: SectorTipo
  icono?: string
  orden: number
  activo: boolean
}

export interface Almacen {
  id: string
  usuario_id?: string
  nombre: string
  nit?: string
  telefono_whatsapp?: string
  email?: string
  municipio: string
  departamento: string
  direccion?: string
  ubicacion?: unknown // PostGIS GEOGRAPHY
  horario?: string
  acepta_pedidos_digitales: boolean
  comision_porcentaje: number
  activo: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Producto {
  id: string
  categoria_id?: string
  nombre: string
  nombre_corto?: string
  marca?: string
  presentacion?: string
  unidad_medida: string
  peso_kg?: number
  composicion?: Record<string, number>
  descripcion?: string
  imagen_url?: string
  sector: SectorTipo
  activo: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export interface Precio {
  id: string
  producto_id: string
  almacen_id: string
  precio_unitario: number
  precio_por_kg_nutriente?: number
  disponible: boolean
  stock_cantidad?: number
  origen: PrecioOrigen
  vigente_hasta?: string
  actualizado_at: string
  created_at: string
}

export interface Pedido {
  id: string
  numero: string
  caficultor_id: string
  almacen_id: string
  estado: PedidoEstado
  canal: ConversacionCanal
  subtotal: number
  comision: number
  total: number
  precio_confirmado_almacen?: number
  notas?: string
  notas_almacen?: string
  confirmado_at?: string
  entregado_at?: string
  created_at: string
  updated_at: string
}

export interface PedidoItem {
  id: string
  pedido_id: string
  producto_id: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  created_at: string
}

export interface AnalisisSuelo {
  id: string
  lote_id?: string
  finca_id: string
  usuario_id: string
  laboratorio?: string
  fecha_analisis?: string
  fecha_registro: string
  imagen_url?: string
  canal?: ConversacionCanal
  ph?: number
  materia_organica?: number
  nitrogeno?: number
  fosforo?: number
  potasio?: number
  calcio?: number
  magnesio?: number
  aluminio?: number
  sodio?: number
  azufre?: number
  hierro?: number
  cobre?: number
  manganeso?: number
  zinc?: number
  boro?: number
  cice?: number
  conductividad_electrica?: number
  interpretacion?: Record<string, string>
  recomendacion?: Record<string, unknown>
  recomendacion_texto?: string
  created_at: string
}

export interface Gasto {
  id: string
  usuario_id: string
  finca_id?: string
  lote_id?: string
  pedido_id?: string
  categoria: GastoCategoria
  descripcion?: string
  monto: number
  fecha: string
  proveedor?: string
  factura_imagen_url?: string
  factura_datos?: Record<string, unknown>
  origen: string
  created_at: string
}

export interface Floracion {
  id: string
  lote_id: string
  usuario_id: string
  fecha_floracion: string
  intensidad?: 'alta' | 'media' | 'baja'
  imagen_url?: string
  fecha_estimada_cosecha?: string
  fecha_fertilizacion?: string
  periodo_critico_broca_inicio?: string
  notas?: string
  created_at: string
}
