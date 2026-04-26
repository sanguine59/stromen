#!/bin/sh
set -e

mc alias set stromen http://minio:9000 minioadmin minioadmin

mc mb --ignore-existing stromen/raw-uploads
mc mb --ignore-existing stromen/streaming-assets

# Public read on streaming assets bucket for HLS playback files.
mc anonymous set download stromen/streaming-assets
