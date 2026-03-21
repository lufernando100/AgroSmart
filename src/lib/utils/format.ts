// Formato de precios en COP colombiano
export function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Formato de fechas en español colombiano
export function formatFecha(date: string | Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

// Formato relativo: "hace 2 días"
export function formatRelativo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)

  if (minutos < 60) return `hace ${minutos} min`
  if (horas < 24) return `hace ${horas} hora${horas !== 1 ? 's' : ''}`
  return `hace ${dias} día${dias !== 1 ? 's' : ''}`
}

// Redondear a 1 decimal
export function formatKm(km: number): string {
  return `${km.toFixed(1)} km`
}
