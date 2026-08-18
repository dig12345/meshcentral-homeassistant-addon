// ==============================================================================
// Home Assistant Community Add-on: MeshCentral
// Checks that every module MeshCentral pins in its package.json is installed at
// the exact version it expects, and reports when MeshCentral's own check
// disagrees with what is actually on disk.
//
// MeshCentral re-runs the equivalent check on every start (InstallModules() in
// meshcentral.js) and shells out to "npm install" for anything it considers
// missing. That install is run from the directory above node_modules, so it is
// only safe when that directory is a real npm project that lists meshcentral as
// a dependency -- otherwise npm prunes MeshCentral itself as extraneous, out
// from under the running process.
//
// Usage: node meshcentral-verify-modules.js [meshcentral-directory]
//   exit 0  everything installed, MeshCentral will not reinstall anything
//   exit 1  modules genuinely missing; one "name@version" per line on stdout
//   exit 2  the check could not run (message on stderr)
//   exit 3  everything is installed, but MeshCentral's own check disagrees and
//           will reinstall; stdout explains what its check saw
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const mcDir = process.argv[2] || '/opt/meshcentral/node_modules/meshcentral';
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

// What is actually on disk, by any means.
function installedVersion(name) {
    try { return mcRequire(name + '/package.json').version; } catch (ex) { }

    // Packages whose "exports" map hides ./package.json (otplib,
    // ua-client-hints-js) throw above, so look for the package directory
    // directly: the MeshCentral package's own node_modules first, then the
    // node_modules it was installed into.
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

// MeshCentral's own check, verbatim from InstallModules(), instrumented so a
// disagreement with the disk can be reported instead of guessed at.
function meshcentralCheck(name, version) {
    const trace = [];
    try {
        let versionMatch = false;
        let modulePath = null;
        try {
            versionMatch = (mcRequire(name + '/package.json').version == version);
            trace.push('require() returned version ' + mcRequire(name + '/package.json').version);
        } catch (ex) {
            trace.push('require() threw ' + ex.code + ': ' + String(ex).replace(/\s+/g, ' '));
            if (ex.code == 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
                modulePath = String(ex).split(' ').at(-1);
                trace.push('path taken from message: ' + modulePath);
            } else { throw new Error(); }
        }
        if ((versionMatch == false) && (modulePath != null)) {
            const found = JSON.parse(fs.readFileSync(modulePath, 'utf8')).version;
            trace.push('that file reports version ' + found);
            if (found != version) { throw new Error(); }
        } else if (versionMatch == false) { throw new Error(); }
        return { ok: true, trace: trace };
    } catch (ex) {
        if (ex.message) { trace.push('failed: ' + ex.message); }
        return { ok: false, trace: trace };
    }
}

const missing = [];
const disagreements = [];
for (const name of Object.keys(dependencies)) {
    const wanted = dependencies[name];
    const onDisk = installedVersion(name);
    if (onDisk !== wanted) { missing.push(name + '@' + wanted); continue; }

    const check = meshcentralCheck(name, wanted);
    if (!check.ok) {
        disagreements.push(name + '@' + wanted + ' is installed (' + onDisk + ') but MeshCentral will reinstall it: ' + check.trace.join(' | '));
    }
}

if (missing.length > 0) { console.log(missing.join('\n')); process.exit(1); }
if (disagreements.length > 0) { console.log(disagreements.join('\n')); process.exit(3); }
process.exit(0);
