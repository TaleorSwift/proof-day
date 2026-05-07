#!/bin/bash
# Descarga el modelo qwen2.5:3b en el contenedor Ollama.
# Ejecutar después de: docker compose -f docker-compose.dev.yml up -d

echo "Esperando a que Ollama arranque..."
until curl -s http://localhost:11434/api/tags > /dev/null 2>&1; do
  sleep 2
done

echo "Descargando qwen2.5:3b (~2GB, solo la primera vez)..."
docker exec proofday-ollama ollama pull qwen2.5:3b
echo "Modelo listo. Puedes verificar con: curl http://localhost:11434/api/tags"
