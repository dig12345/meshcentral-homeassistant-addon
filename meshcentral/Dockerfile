ARG BUILD_FROM=ghcr.io/hassio-addons/base:19.0.0
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Environment configuration
ENV \
    S6_KILL_GRACETIME=30000 \
    S6_SERVICES_GRACETIME=30000

# The module verifier is needed during the build below as well as at runtime, so
# it is copied ahead of the full root filesystem.
COPY rootfs/usr/local/bin/meshcentral-verify-modules.js /usr/local/bin/meshcentral-verify-modules.js

# Setup base
ARG MESHCENTRAL_VERSION="1.2.5"
# Node major version is fixed by the pinned base image's Alpine release (3.22 -> Node 22.x).
# Patch versions are intentionally not pinned: Alpine only keeps the latest build in its
# repos, so exact pins break the build on every upstream refresh.
#
# MeshCentral is installed as a dependency of a real npm project rather than
# with "npm install -g". It re-checks its pinned module list on every start and
# runs "npm install" from the directory above its own node_modules for anything
# it thinks is missing. With a global install that directory (/usr/local/lib) is
# not an npm project, so npm treats MeshCentral itself as extraneous and deletes
# it mid-run -- the server then dies on "Cannot find module './exeHandler.js'".
# Inside a project that lists meshcentral as a dependency, the same install is
# harmless and does what MeshCentral intended.
#
# The pinned dependencies are then installed explicitly and verified, so nothing
# has to be fetched at start. The verifier exits 3 when everything is present but
# MeshCentral's own check would still reinstall it; that is reported rather than
# failing the build, since it is no longer fatal.
#
# NOTE: /usr/lib/node_modules is deliberately NOT deleted here -- that is where
# the Alpine npm package itself lives (/usr/bin/npm symlinks into it). Deleting
# it leaves MeshCentral unable to install any module it wants at runtime, and it
# exits with status 0 when that fails, which s6 turns into a silent restart loop.
# hadolint ignore=DL3003,SC2046,DL3018
RUN \
    apk add --no-cache \
        nodejs \
        npm \
    \
    && mkdir -p /opt/meshcentral \
    && cd /opt/meshcentral \
    && printf '%s' '{"name":"meshcentral-addon","version":"1.0.0","private":true,"dependencies":{}}' > package.json \
    && npm install --no-audit --no-fund --save-exact meshcentral@${MESHCENTRAL_VERSION} \
    \
    && npm install --no-audit --no-fund --omit=optional --save-exact \
        $(node -e 'const d=require("/opt/meshcentral/node_modules/meshcentral/package.json").dependencies||{};console.log(Object.keys(d).map(function(k){return k+"@"+d[k];}).join(" "));') \
    && { node /usr/local/bin/meshcentral-verify-modules.js || [ "$?" -eq 3 ]; } \
    \
    && rm -f -r \
        /root/.cache \
        /root/.config \
        /root/.npmrc \
        /root/.node-gyp \
        /root/.npm \
        /tmp/.[!.]* \
        /tmp/* \
        /usr/local/share/.cache

# Copy root filesystem
COPY rootfs /

# Health check - check HTTPS port (443) or HTTP redirect (80)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl --fail --max-time 5 http://127.0.0.1:80/ || exit 1

# Build arguments
ARG BUILD_ARCH
ARG BUILD_DATE
ARG BUILD_DESCRIPTION
ARG BUILD_NAME
ARG BUILD_REF
ARG BUILD_REPOSITORY
ARG BUILD_VERSION

# Labels
LABEL \
    io.hass.name="${BUILD_NAME}" \
    io.hass.description="${BUILD_DESCRIPTION}" \
    io.hass.arch="${BUILD_ARCH}" \
    io.hass.type="addon" \
    io.hass.version=${BUILD_VERSION} \
    maintainer="Home Assistant Community" \
    org.opencontainers.image.title="${BUILD_NAME}" \
    org.opencontainers.image.description="${BUILD_DESCRIPTION}" \
    org.opencontainers.image.vendor="Home Assistant Community Add-ons" \
    org.opencontainers.image.authors="Home Assistant Community" \
    org.opencontainers.image.licenses="Apache-2.0" \
    org.opencontainers.image.url="https://addons.community" \
    org.opencontainers.image.source="https://github.com/${BUILD_REPOSITORY}" \
    org.opencontainers.image.documentation="https://github.com/${BUILD_REPOSITORY}/blob/main/README.md" \
    org.opencontainers.image.created=${BUILD_DATE} \
    org.opencontainers.image.revision=${BUILD_REF} \
    org.opencontainers.image.version=${BUILD_VERSION}
