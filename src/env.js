// Configuración de ambiente cargada ANTES de los módulos de la app.
// En desarrollo (BrowserSync) queda vacío y default_dao.js usa sus valores
// por defecto actuales (sin cambio de comportamiento).
// En el contenedor Docker, este archivo se sobrescribe en el arranque
// (ver docker/docker-entrypoint.d/40-env-config.sh) con los valores reales
// del backend para ese despliegue.
window.APP_CONFIG = window.APP_CONFIG || {};
