#!/bin/sh
set -e

# Asegurar existencia de carpetas de almacenamiento y permisos para usuario 'node'
mkdir -p /app/backend/uploads/banners /app/backend/data /app/backend/logs /home/node/.config
chown -R node:node /app/backend/uploads /app/backend/data /app/backend/logs /home/node
chmod -R 775 /app/backend/uploads /app/backend/data /app/backend/logs

# Ejecutar proceso Node.js como usuario no-root 'node'
exec gosu node "$@"
