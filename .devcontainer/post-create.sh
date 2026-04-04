#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="/workspaces/${1}"
CLAUDE_DIR="${WORKSPACE}/.claude"

# --- System dependencies for pycairo, Pillow, lxml, etc. ---
sudo apt-get update -qq
sudo apt-get install -y -qq \
  libcairo2-dev \
  pkg-config \
  libfreetype6-dev \
  libjpeg-dev \
  libpng-dev \
  libxml2-dev \
  libxslt1-dev \
  > /dev/null

# --- Python virtual environment and project deps ---
cd "$WORKSPACE"
python -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q

# --- Claude Code permissions ---
sudo chown -R vscode:vscode /home/vscode/.claude "$CLAUDE_DIR"

if [ ! -f "$CLAUDE_DIR/settings.local.json" ]; then
  cat > "$CLAUDE_DIR/settings.local.json" << 'EOF'
{
  "permissions": {
    "allow": [
      "Bash(*)",
      "Edit(*)",
      "Glob(*)",
      "Grep(*)",
      "Read(*)",
      "WebFetch(*)",
      "WebSearch(*)",
      "Write(*)",
      "mcp__playwright__*",
      "mcp__tmux__*"
    ],
    "deny": []
  }
}
EOF
fi
