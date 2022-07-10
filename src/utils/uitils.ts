export const emailRegex = /^[^@]+@[^@]+.[^@]+$/;
export const strongPass =
  /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;

/**
 * Normaliza el texto, cambia los espacios por (-) ademas de eliminar
 * los signos de puntucacion.
 * @param {string} text Texto a normalizar
 * @returns String
 */
export const createSlug = (text: string) =>
  text
    ? text
        .trim()
        .toLocaleLowerCase()
        .replace(/\s/gi, '-')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    : '';
