const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const backendRoot = path.resolve(__dirname, '../..');

// Windows FileZilla/zip often skips hidden `.env`. This project also keeps a visible `env` file.
const candidates = [
  path.join(backendRoot, '.env'),
  path.join(backendRoot, 'env'),
  path.join(backendRoot, '.env.production'),
];

const envPath = candidates.find((file) => fs.existsSync(file)) || null;

if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

if (!process.env.HOST) {
  process.env.HOST = '0.0.0.0';
}

if (!process.env.PORT) {
  process.env.PORT = '5000';
}

module.exports = {
  envPath,
  backendRoot,
  envFileName: envPath ? path.basename(envPath) : null,
};
