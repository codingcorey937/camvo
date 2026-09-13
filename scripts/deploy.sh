#!/bin/bash
set -e

echo "🚀 Starting Camvo deploy..."

# ── 1. Clone / pull ──────────────────────────────
if [ -d ~/camvo ]; then
  echo "📦 Repo exists — pulling latest..."
  cd ~/camvo && git pull
else
  echo "📦 Cloning repo..."
  git clone https://github.com/codingcorey937/camvo.git ~/camvo
  cd ~/camvo
fi

# ── 2. Check .env exists ──────────────────────────
if [ ! -f ~/camvo/packages/backend/.env ]; then
  echo "⚠️  No .env found! Create one from .env.example:"
  echo "   cp packages/backend/.env.example packages/backend/.env"
  echo "   nano packages/backend/.env"
  exit 1
fi

# ── 3. Install deps ───────────────────────────────
echo "📦 Installing dependencies..."
cd ~/camvo
npm install 2>&1 | tail -3

# ── 4. Build backend ─────────────────────────────
echo "🔨 Building backend..."
cd ~/camvo/packages/backend
npx tsc 2>&1 || echo "⚠️ tsc warnings (non-fatal)"

# ── 5. Kill old process ───────────────────────────
echo "🛑 Stopping old Camvo process..."
pkill -f "tsx src/index.ts" 2>/dev/null || true
sleep 1

# ── 6. Create systemd service ─────────────────────
echo "⚙️ Creating systemd service..."
NODE_PATH=$(which node || echo "/usr/bin/node")
PROJECT_PATH="$HOME/camvo"

sudo tee /etc/systemd/system/camvo.service > /dev/null << SERVICE
[Unit]
Description=Camvo Backend
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$USER
Group=$USER
WorkingDirectory=$PROJECT_PATH/packages/backend
ExecStart=$NODE_PATH $(npm bin -g tsx 2>/dev/null || echo "$PROJECT_PATH/node_modules/.bin/tsx") src/index.ts
EnvironmentFile=$PROJECT_PATH/packages/backend/.env
Restart=always
RestartSec=3s
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable camvo
sudo systemctl restart camvo
sleep 2

# ── 7. Verify ─────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
curl -sf http://localhost:3001/api/health && echo " 🟢 Camvo live!" || echo " 🔴 Health check failed"
echo "═══════════════════════════════════════════"