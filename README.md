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
  - If left empty and no config exists yet, a default config is generated with:
    - HTTPS on port `44433`
    - Redirect on port `44431`
    - MPS on port `44432`
    - Relay on port `453`
    - Agent on port `1234`
  - The script automatically ensures a valid `domains` section exists (adds default if missing)

You can paste a full `config.json` from MeshCentral (for example a customized `sample-config-advanced.json`) into this field to control every aspect of the server.

### Ports

Container ports exposed by the add-on (mapped to same external ports):

- `44433/tcp` – MeshCentral HTTPS web UI and API (default: `44433`)
- `44431/tcp` – MeshCentral redirect port (default: `44431`)
- `44432/tcp` – MeshCentral MPS (Intel AMT) port (default: `44432`)

You can change the external port mappings in the add-on configuration if needed. Access MeshCentral via `https://your-ha-ip:44433` or through your reverse proxy.

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

