ARG BUILD_FROM=ghcr.io/hassio-addons/base:19.0.0
# hadolint ignore=DL3006
FROM ${BUILD_FROM}

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Environment configuration
ENV \
    S6_KILL_GRACETIME=30000 \
    S6_SERVICES_GRACETIME=30000

# Setup base
ARG MESHCENTRAL_VERSION="1.2.2"
# Node major version is fixed by the pinned base image's Alpine release (3.22 -> Node 22.x).
# Patch versions are intentionally not pinned: Alpine only keeps the latest build in its
# repos, so exact pins break the build on every upstream refresh.
# hadolint ignore=DL3003,SC2046,DL3018
RUN \
    apk add --no-cache \
        nodejs \
        npm \
    \
    && npm install -g meshcentral@${MESHCENTRAL_VERSION} \
    \
    && rm -f -r \
        /root/.cache \
        /root/.config \
        /root/.npmrc \
        /root/.node-gyp \
        /root/.npm \
        /tmp/.[!.]* \
        /tmp/* \
        /usr/lib/node_modules \
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
