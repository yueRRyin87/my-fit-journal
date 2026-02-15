import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dbPath = path.join(__dirname, 'data', 'db.json');

function json(res, code, data) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function readDb() { return JSON.parse(fs.readFileSync(dbPath, 'utf8')); }
function writeDb(db) { fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); }

function serveFile(req, res) {
  const reqPath = req.url === '/' ? '/index.html' : req.url;
  const safe = path.normalize(reqPath).replace(/^\.+/, '');
  const filePath = path.join(root, safe);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const ext = path.extname(filePath);
  const typeMap = { '.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.jsx':'application/javascript' };
  res.writeHead(200, { 'Content-Type': `${typeMap[ext] || 'text/plain'}; charset=utf-8` });
  res.end(fs.readFileSync(filePath));
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });

  if (req.url === '/api/prs' && req.method === 'GET') return json(res, 200, readDb().prs);
  if (req.url === '/api/reviews' && req.method === 'GET') return json(res, 200, readDb().reviews);
  if (req.url === '/api/challenge' && req.method === 'GET') return json(res, 200, readDb().challenge);
  if (req.url === '/api/health' && req.method === 'GET') return json(res, 200, { ok: true });

  if (req.url === '/api/challenge/join' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      const db = readDb();
      db.challenge.participants += 1;
      writeDb(db);
      const name = body ? JSON.parse(body).name : '访客';
      json(res, 201, { message: `${name} joined`, participants: db.challenge.participants });
    });
    return;
  }

  if (!req.url.startsWith('/api')) return serveFile(req, res);
  return json(res, 404, { error: 'not found' });
});

server.listen(4000, () => console.log('Server running: http://localhost:4000'));
