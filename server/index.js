const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const dbPath = path.join(__dirname, 'cryptos.json');

let cryptos = [];

function fetchCryptos() {
  return new Promise((resolve, reject) => {
    https
      .get('https://api.coingecko.com/api/v3/coins/list', (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

async function loadCryptos() {
  try {
    const fetched = await fetchCryptos();
    let stored = [];
    if (fs.existsSync(dbPath)) {
      try {
        stored = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      } catch (err) {
        stored = [];
      }
    }
    const existingIds = new Set(stored.map((c) => c.id));
    const additions = fetched.filter((c) => !existingIds.has(c.id));
    if (additions.length > 0) {
      stored = stored.concat(additions);
      fs.writeFileSync(dbPath, JSON.stringify(stored, null, 2));
    }
    cryptos = stored;
    console.log(`Loaded ${cryptos.length} cryptos`);
  } catch (err) {
    console.error('Failed to load cryptos', err);
  }
}

function serveStatic(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json'
    }[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let filePath = path.join(publicDir, req.url);
  if (req.url === '/' || req.url === '') {
    filePath = path.join(publicDir, 'index.html');
  }
  serveStatic(filePath, res);
});

const PORT = process.env.PORT || 3000;

loadCryptos().finally(() => {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
