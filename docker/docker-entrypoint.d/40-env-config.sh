#!/bin/sh
# Genera env.js en el arranque del contenedor a partir de variables de
# entorno, para que el frontend sepa a qué backend apuntar sin rebuild.
# Si no se defin en las variables, usa los mismos valores que estaban
# hardcodeados antes en default_dao.js (mismo comportamiento por defecto).
set -e

BACKEND_HOST="${BACKEND_HOST:-host.docker.internal}"
BACKEND_PORT="${BACKEND_PORT:-9080}"
BACKEND_PATH="${BACKEND_PATH:-IngresoUniversitarioTPI135-1.0-SNAPSHOT/resources/v1/}"

cat > /usr/share/nginx/html/env.js <<EOF
window.APP_CONFIG = {
    BACKEND_HOST: "${BACKEND_HOST}",
    BACKEND_PORT: "${BACKEND_PORT}",
    BACKEND_PATH: "${BACKEND_PATH}"
};
EOF
