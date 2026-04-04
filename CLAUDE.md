# CLAUDE.md

- **MANDATORY — Keep CLAUDE.md up to date**: After every change that adds policy decisions or non-discoverable context, update this file. Do not duplicate information that can be gathered from the codebase on the fly (project structure, tech stack, API endpoints, config, etc.).

## Development environment

- **Devcontainer**: fully configured in `.devcontainer/` — Python 3.12, Node.js LTS, system C libs, and VS Code extensions are installed automatically on container creation.
- **Python venv**: activate with `source .venv/bin/activate`. Dependencies are in `requirements.txt`.
- **Generate cards**: `source .venv/bin/activate && python generate_cards.py --input ./card-db`
- **Generate print sheets**: `source .venv/bin/activate && python collect_and_print.py` (see `print.sh` for examples)
