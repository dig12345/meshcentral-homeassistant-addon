// ==============================================================================
// Home Assistant Community Add-on: MeshCentral
// Checks that every module MeshCentral pins in its package.json is installed at
// the exact version it expects.
//
// MeshCentral runs the equivalent check itself on every start (InstallModules()
// in meshcentral.js) and shells out to "npm install" for anything it considers
// missing. When that install fails it calls process.exit() with status 0, which
// s6 reads as a clean exit and restarts -- an invisible crash loop. Running this
// at build time turns a broken image into a build failure, and running it at
// start lets the add-on repair or report the problem instead of flapping.
//
// Usage: node meshcentral-verify-modules.js [meshcentral-directory]
// Prints one "name@version" per missing or mismatched module and exits 1.
// Exits 0 with no output when everything is in place, 2 when the check itself
// could not run.
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const mcDir = process.argv[2] || '/usr/local/lib/node_modules/meshcentral';
const mcPackage = path.join(mcDir, 'package.json');

// Resolve exactly like meshcentral.js does, from inside the MeshCentral package.
const mcRequire = createRequire(path.join(mcDir, 'meshcentral.js'));

let dependencies;
try {
    dependencies = JSON.parse(fs.readFileSync(mcPackage, 'utf8')).dependencies || {};
} catch (ex) {
    console.error('Unable to read ' + mcPackage + ': ' + ex.message);
    process.exit(2);
}

function readVersion(packageFile, name) {
    try {
        const info = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        return (info.name === name) ? info.version : null;
    } catch (ex) { return null; }
}

function installedVersion(name) {
    // Fast path: most packages expose their own package.json.
    try { return mcRequire(name + '/package.json').version; } catch (ex) { }

    // Packages whose "exports" map hides ./package.json (otplib,
    // ua-client-hints-js) throw ERR_PACKAGE_PATH_NOT_EXPORTED above, so look for
    // the package directory directly: first the MeshCentral package's own
    // node_modules, then the global node_modules it was installed into.
    const candidates = [
        path.join(mcDir, 'node_modules', ...name.split('/'), 'package.json'),
        path.join(mcDir, '..', ...name.split('/'), 'package.json'),
    ];
    for (const candidate of candidates) {
        const version = readVersion(candidate, name);
        if (version != null) { return version; }
    }
    return null;
}

const missing = [];
for (const name of Object.keys(dependencies)) {
    const wanted = dependencies[name];
    if (installedVersion(name) !== wanted) { missing.push(name + '@' + wanted); }
}

if (missing.length > 0) { console.log(missing.join('\n')); process.exit(1); }
process.exit(0);
