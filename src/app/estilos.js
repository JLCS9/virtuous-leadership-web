// Capa de compatibilidad — re-exporta todo desde tokens.js.
// Los archivos que importan de aquí siguen funcionando sin cambios.
// Al migrar un archivo, cambiar su import de './estilos' a './tokens'.
export {
  sombra, tarjeta, tarjetaCentrada, eyebrow, titulo, parrafo,
  heroFondo, botonPrimario, botonSobreClaro, botonContorno,
  barraFondo, fechaLarga,
} from './tokens';
