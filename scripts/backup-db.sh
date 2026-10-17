#!/usr/bin/env bash
set -euo pipefail
# ============================================================================
# TOPUPKU - POSTGRESQL AUTOMATED BACKUP SCRIPT
# Usage: bash scripts/backup-db.sh
# ============================================================================

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

OUT_FILE="${BACKUP_DIR}/topupku_pg_backup_${TIMESTAMP}.sql.gz"
echo "🗄️ Membackup database PostgreSQL ke ${OUT_FILE}..."
pg_dump "${DATABASE_URL}" | gzip > "${OUT_FILE}"
echo "✅ Backup database selesai: ${OUT_FILE}"
