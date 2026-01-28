#!/usr/bin/env bash
set -euo pipefail

# Simple release helper for the MeshCentral Home Assistant add-on.
# - If a version argument is given: use that (e.g. ./release.sh 0.2.0)
# - If no argument is given: auto-bump the PATCH (lowest) number of the
#   current semantic version in meshcentral/config.yaml.
#   If the current version is not a semantic version (e.g. "dev"),
#   it starts at 0.1.0.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${REPO_ROOT}/meshcentral/config.yaml"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "ERROR: ${CONFIG_FILE} not found. Run this script from the repo root." >&2
  exit 1
fi

CURRENT_VERSION="$(grep -E '^version:' "${CONFIG_FILE}" | awk '{print $2}')"

NEW_VERSION="${1:-}"

if [[ -z "${NEW_VERSION}" ]]; then
  # Auto-bump patch if CURRENT_VERSION is semantic (x.y.z), else start at 0.1.0
  if [[ "${CURRENT_VERSION}" =~ ^([0-9]+)\.([0-9]+)\.([0-9]+)$ ]]; then
    MAJOR="${BASH_REMATCH[1]}"
    MINOR="${BASH_REMATCH[2]}"
    PATCH="${BASH_REMATCH[3]}"
    PATCH=$((PATCH + 1))
    NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
    echo "Auto-bumping version: ${CURRENT_VERSION} -> ${NEW_VERSION}"
  else
    NEW_VERSION="0.1.0"
    echo "Current version '${CURRENT_VERSION}' is not semantic, starting at ${NEW_VERSION}"
  fi
else
  echo "Setting version explicitly to: ${NEW_VERSION}"
fi

# Update version in config.yaml
sed -i "s/^version:.*/version: ${NEW_VERSION}/" "${CONFIG_FILE}"

echo "Updated version line in ${CONFIG_FILE}:"
grep -E '^version:' "${CONFIG_FILE}"

# Commit and tag
git -C "${REPO_ROOT}" add "${CONFIG_FILE}" \
  "${REPO_ROOT}/meshcentral/rootfs/etc/s6-overlay/s6-rc.d/meshcentral/run"
git -C "${REPO_ROOT}" commit -m "Release MeshCentral add-on ${NEW_VERSION}"
git -C "${REPO_ROOT}" tag "v${NEW_VERSION}"

echo "Pushing commit and tags..."
git -C "${REPO_ROOT}" push
git -C "${REPO_ROOT}" push --tags

echo "Release ${NEW_VERSION} complete. Check Home Assistant for the add-on update."

