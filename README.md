## MeshCentral Home Assistant Add-on

A Home Assistant add-on that runs a standalone MeshCentral server inside the Supervisor.

MeshCentral is a web-based remote monitoring and management solution that provides remote desktop, terminal, file access, Intel AMT support, and more.

### Features

- MeshCentral web UI served from the add-on
- MPS, redirect, and relay ports enabled by default
- Data persisted and accessible from Home Assistant host
- Full MeshCentral `config.json` configuration support
- Automatic updates when new MeshCentral versions are released

### Installation

1. In Home Assistant, go to **Settings → Add-ons → Add-on Store → ⋮ → Repositories**.
2. Add this repository URL as a **custom repository**:
   ```
   https://github.com/dig12345/meshcentral-homeassistant-addon
   ```
3. Find **MeshCentral** in the add-on list and click **Install**.
4. Start the add-on and configure it as needed.

### Configuration

#### Basic Configuration

The add-on includes two configuration options:

- **Log level**: Controls add-on log verbosity (trace, debug, info, notice, warning, error, fatal).
- **MeshCentral configuration (JSON)**: Optional advanced configuration.

#### Default Configuration

If you don't provide a custom configuration, the add-on uses MeshCentral's standard ports:

- HTTPS on port `443`
- HTTP redirect on port `80`
- MPS on port `44330`
- Relay on port `453`
- Agent on port `1234`

#### Advanced Configuration

You can provide a complete MeshCentral `config.json` in the **MeshCentral configuration (JSON)** field to customize:

- Port numbers
- SSL/TLS certificates
- Domain settings
- User account policies
- And all other MeshCentral settings

The add-on will validate your JSON and ensure required sections (like `domains`) are present. If you're migrating from an existing MeshCentral installation, you can paste your entire `config.json` here.

**Note**: Once you've configured MeshCentral, your settings are preserved. The add-on will not overwrite your existing configuration on updates.

### Ports

The add-on exposes MeshCentral's standard ports by default:

- `443/tcp` → `443` – MeshCentral HTTPS web UI and API
- `80/tcp` → `80` – MeshCentral HTTP redirect port
- `44330/tcp` → `44330` – MeshCentral MPS (Intel AMT) port
- `453/tcp` → `453` – MeshCentral relay port
- `1234/tcp` → `1234` – MeshCentral agent port

You can change the external port mappings in the add-on's **Network** configuration tab if you need to use different ports or avoid conflicts with other services.

### Accessing MeshCentral

After starting the add-on, access MeshCentral by:

1. Opening your browser to `https://your-home-assistant-ip:443`
2. Or through your reverse proxy if configured
3. Create your first administrator account when prompted

### Data Storage

All MeshCentral data is stored persistently and survives add-on updates and container restarts:

- **Configuration and database**: `/share/meshcentral/meshcentral-data`
- **User-uploaded files**: `/share/meshcentral/meshcentral-files`
- **Backup files**: `/share/meshcentral/meshcentral-backups`

These files are stored on your Home Assistant host and can be accessed via:
- SSH
- Samba (if enabled)
- WinSCP or other SFTP clients
- The typical path on the host is: `/mnt/data/supervisor/share/meshcentral`

### Backups

Your MeshCentral data is stored in the Home Assistant share directory, which is typically included in Home Assistant backups. You can also use MeshCentral's built-in backup/restore functionality from the web UI.

### Updates

The add-on automatically receives updates when new MeshCentral versions are released. You'll see update notifications in Home Assistant when a new version is available.

### Support

For issues, feature requests, or questions:
- Check the [MeshCentral documentation](https://meshcentral.com/info/docs/)
- Review the add-on logs in Home Assistant
- Open an issue on the [GitHub repository](https://github.com/dig12345/meshcentral-homeassistant-addon)

### License

This add-on is provided as-is. MeshCentral is licensed under its own terms.
