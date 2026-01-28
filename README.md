## MeshCentral Home Assistant Add-on

This is a Home Assistant add-on that runs a standalone MeshCentral server inside the Supervisor.

MeshCentral is a web-based remote monitoring and management solution that provides remote desktop, terminal, file access, Intel AMT support, and more.

### Features

- MeshCentral web UI served from the add-on
- MPS, redirect, and relay ports enabled by default
- Data persisted in `/share/meshcentral` (accessible from Home Assistant host)
- Full MeshCentral `config.json` exposed as an add-on option
- **Automatic updates**: GitHub Actions workflow checks for new MeshCentral versions daily and creates new releases automatically

### Installation

1. Push this `meshcentral` folder to its own Git repository.
2. In Home Assistant, go to **Settings → Add-ons → Add-on Store → ⋮ → Repositories**.
3. Add your Git repository URL as a **custom repository**.
4. Find **MeshCentral** in the add-on list and install it.

### Configuration

In the add-on options you have:

- **Log level**: Controls add-on log verbosity.
- **MeshCentral configuration (JSON)** (`meshcentral_config`):
  - Optional.
  - If set, this JSON string is validated and written to:
    - `/share/meshcentral/meshcentral-data/config.json`
  - If left empty and no config exists yet, a default config is generated with MeshCentral's standard ports:
    - HTTPS on port `443`
    - HTTP redirect on port `80`
    - MPS on port `44330`
    - Relay on port `453`
    - Agent on port `1234`
  - The script automatically ensures a valid `domains` section exists (adds default if missing)

You can paste a full `config.json` from MeshCentral (for example a customized `sample-config-advanced.json`) into this field to control every aspect of the server.

### Ports

The add-on uses MeshCentral's default ports internally:

- `443/tcp` – MeshCentral HTTPS web UI and API
- `80/tcp` – MeshCentral HTTP redirect port
- `44330/tcp` – MeshCentral MPS (Intel AMT) port
- `453/tcp` – MeshCentral relay port
- `1234/tcp` – MeshCentral agent port

**By default, these ports are not exposed externally** (set to `null` in the addon configuration). You can enable and map them to custom host ports in the add-on's **Network** configuration if you need external access. For most deployments, you'll access MeshCentral through a reverse proxy (like HAProxy) rather than exposing ports directly.

### Data persistence

All MeshCentral data is stored under:

- `/share/meshcentral/meshcentral-data` – Configuration and database
- `/share/meshcentral/meshcentral-files` – User-uploaded files
- `/share/meshcentral/meshcentral-backups` – Backup files

These paths are mapped to the Home Assistant host's share directory (typically `/mnt/data/supervisor/share/meshcentral`), so your configuration and state survive add-on upgrades and container restarts. You can access these files via SSH, Samba, or WinSCP.

### Automatic Updates

This repository includes a GitHub Actions workflow (`.github/workflows/auto-update.yml`) that:

- Runs daily at 2 AM UTC (configurable in the workflow file)
- Checks npm for the latest MeshCentral version
- Compares it to the version in the Dockerfile
- If a new version is available:
  - Updates the Dockerfile with the new version
  - Bumps the addon version (patch increment)
  - Commits and pushes the changes
  - Creates a new Git tag
  - Home Assistant will detect the new addon version and show an update notification

You can also manually trigger the workflow from the **Actions** tab in GitHub.

**Note**: The workflow requires write permissions. Make sure your repository has Actions enabled and the `GITHUB_TOKEN` has write access (this is usually automatic for public repos).

