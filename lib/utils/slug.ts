/**
 * Genera un slug URL-safe a partir de un nombre.
 * Normaliza acentos, convierte a minúsculas y reemplaza caracteres no alfanuméricos por guiones.
 * Ejemplo: "Mi Comunidad!" → "mi-comunidad"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
