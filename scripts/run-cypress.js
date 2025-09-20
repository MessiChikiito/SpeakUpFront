// Programmatic Cypress runner to avoid ts-node config parsing issues
/* eslint-disable @typescript-eslint/no-var-requires */
const cypress = require('cypress');

// Ensure ts-node doesn't try to compile JS config files
process.env.TS_NODE_SKIP_PROJECT = 'true';
process.env.TS_NODE_TRANSPILE_ONLY = 'true';
process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  moduleResolution: 'nodenext',
  allowJs: false,
});

const mode = process.argv[2] || 'run'; // 'run' or 'open'

const common = {
  config: {
    baseUrl: 'http://localhost:5000',
    video: false,
  },
};

async function main() {
  try {
    if (mode === 'open') {
      await cypress.open(common);
    } else {
      await cypress.run({ ...common, spec: 'cypress/e2e/**/*.cy.*' });
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
