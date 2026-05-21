/**
 * Generates API client and contracts for a given type and mode.
 *
 * Usage: node scripts/generate-api.js <type> <mode>
 *
 * @param {string} type - 'api'
 * @param {string} mode - 'client' or 'contracts'
 */
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// Unhandled rejection guard
process.on('unhandledRejection', (err) => {
    console.error(`Unhandled rejection: ${err?.message ?? err}`);
    process.exit(1);
});

// Constants
const VALID_TYPES = ['api'];
const VALID_MODES = ['client', 'contracts'];

const DEFAULT_URLS = {
    api: 'https://raw.githubusercontent.com/pagopa/arpu-be/refs/heads/develop/openapi/generated.openapi.json',
};

const ENV_VARS = {
    api: 'OPENAPI_URL',
};

const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 500;

// Argument parsing & validation
const args = process.argv.slice(2);
const type = args[0];
const mode = args[1];

if (
    !type ||
    !mode ||
    !VALID_TYPES.includes(type) ||
    !VALID_MODES.includes(mode)
) {
    console.error(
        [
            'Usage: node scripts/generate-api.js <type> <mode>',
            '',
            '  type: api',
            '  mode: client | contracts',
        ].join('\n'),
    );
    process.exit(1);
}

const key = `${type}-${mode}`;

// Resolve source URL
const envVar = ENV_VARS[type];
let url = process.env[envVar];

if (!url || url === 'undefined') {
    url = DEFAULT_URLS[type];
}

// Fetch with retry
const fetchWithRetry = async (targetUrl, retries = RETRY_ATTEMPTS) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(targetUrl);
            if (response.ok) return response;

            if (attempt === retries) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (err) {
            if (attempt === retries) throw err;
        }

        const delay = Math.pow(2, attempt) * RETRY_BASE_DELAY_MS;
        console.warn(`Attempt ${attempt}/${retries} failed, retrying in ${delay}ms…`);
        await new Promise((r) => setTimeout(r, delay));
    }
};

// Remove nullable: true from spec
const removeNullableTrue = (obj) => {
    let count = 0;

    const walk = (node) => {
        if (Array.isArray(node)) {
            node.forEach(walk);
        } else if (typeof node === 'object' && node !== null) {
            for (const k in node) {
                if (k === 'nullable' && node[k] === true) {
                    delete node[k];
                    count++;
                } else {
                    walk(node[k]);
                }
            }
        }
    };

    walk(obj);
    return count;
};

// Fetch, clean, and persist spec
const fetchAndClean = async (sourceUrl) => {
    console.log(`[${key}] Fetching spec from ${sourceUrl}`);

    let rawData;
    if (sourceUrl.startsWith('http')) {
        const response = await fetchWithRetry(sourceUrl);
        rawData = await response.text();
    } else {
        rawData = fs.readFileSync(sourceUrl, 'utf-8');
    }

    const jsonData = JSON.parse(rawData);
    const removedCount = removeNullableTrue(jsonData);

    console.log(`[${key}] Cleaned spec: removed ${removedCount} "nullable: true" field${removedCount !== 1 ? 's' : ''}`);

    const outDir = './generated';
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const tempFilePath = path.join(outDir, `${type}-openapi.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(jsonData, null, 2));

    return tempFilePath;
};

// Commands map
const buildCommands = (filePath) => ({
    'api-client': [
        'swagger-typescript-api',
        '-p', filePath,
        '-o', './generated',
        '-n', 'apiClient',
        '--axios',
    ],
    'api-contracts': [
        'swagger-typescript-api',
        '--modular',
        '--no-client',
        '-p', filePath,
        '-o', './generated',
    ],
});

// Main
const main = async () => {
    const localFilePath = await fetchAndClean(url);
    const cmdArgs = buildCommands(localFilePath)[key];

    if (!cmdArgs) {
        console.error(`Unknown command key: ${key}`);
        process.exit(1);
    }

    console.log(`[${key}] Generating ${mode} from ${localFilePath}…`);

    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const result = spawnSync(npxCmd, cmdArgs, { stdio: 'inherit' });

    if (result.status !== 0) {
        console.error(`[${key}] Generation failed with exit code ${result.status}`);
        process.exit(result.status || 1);
    }

    console.log(`[${key}] Done`);
};

main().catch((err) => {
    console.error(`[${key}] Generation failed: ${err?.message ?? err}`);
    process.exit(1);
});