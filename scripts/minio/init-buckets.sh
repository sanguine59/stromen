#!/bin/sh
set -e

mc alias set stromen http://minio:9000 minioadmin minioadmin

mc mb --ignore-existing stromen/raw-uploads
mc mb --ignore-existing stromen/streaming-assets

# Public read on streaming assets bucket for HLS playback files.
mc anonymous set download stromen/streaming-assets

# CORS so the browser can fetch the HLS manifest + segments directly from MinIO.
cat > /tmp/cors.json <<'JSON'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3005", "*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Range"],
      "MaxAgeSeconds": 3000
    }
  ]
}
JSON
mc cors set stromen/streaming-assets /tmp/cors.json || echo "mc cors set unsupported on this mc version; skipping"
