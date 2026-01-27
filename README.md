## MeshCentral Home Assistant Add-on

This is a Home Assistant add-on that runs a standalone MeshCentral server inside the Supervisor.

MeshCentral is a web-based remote monitoring and management solution that provides remote desktop, terminal, file access, Intel AMT support, and more.

### Features

- MeshCentral web UI served from the add-on
- Optional MPS, relay, and agent ports enabled by default
- Ingress support (open MeshCentral inside the Home Assistant UI)
- Data persisted in `/data/meshcentral` inside the add-on container
- Full MeshCentral `config.json` exposed as an add-on option

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
  - If set, this string is written directly to:
    - `/data/meshcentral/meshcentral-data/config.json`
  - If left empty and no config exists yet, a default config is generated enabling:
    - Web UI on port `80`
    - MPS on `44330`
    - Relay on `453`
    - Agent on `1234`

You can paste a full `config.json` from MeshCentral (for example a customized `sample-config-advanced.json`) into this field to control every aspect of the server.

### Ports

Container ports exposed by the add-on:

- `80/tcp` – MeshCentral HTTP web UI and API
- `44330/tcp` – MeshCentral MPS (Intel AMT) port
- `453/tcp` – MeshCentral relay port
- `1234/tcp` – MeshCentral agent port

In `config.yaml`:

- `80/tcp` defaults to host port **`8877`**.
- `44330/tcp`, `453/tcp`, `1234/tcp` are set to `null` so you can pick host ports in the add-on UI.

You typically:

- Use **ingress** to access MeshCentral from the Home Assistant sidebar.
- Use **host ports** (e.g. `8877`, plus others you choose) for access from outside Home Assistant, such as through an external HAProxy or reverse proxy.

### Data persistence

All MeshCentral data is stored under:

- `/data/meshcentral/meshcentral-data`
- `/data/meshcentral/meshcentral-files`

These paths are on the Supervisor data volume, so your configuration and state survive add-on upgrades and container restarts.

