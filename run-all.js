import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\Admin\\AppData\\Local';
const mongodPath = path.join(localAppData, 'Programs', 'mongodb', 'bin', 'mongod.exe');
const mongoDataDir = path.join(localAppData, 'mongodb-data');

console.log('\x1b[36m%s\x1b[0m', '================================================');
console.log('\x1b[36m%s\x1b[0m', '   Campus Lost & Found - Starting Stack...     ');
console.log('\x1b[36m%s\x1b[0m', '================================================\n');

const children = [];

function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function startService(name, color, cmd, args, cwd) {
  const child = spawn(cmd, args, {
    cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  const prefix = `${color}[${name}]\x1b[0m `;

  child.stdout.on('data', (data) => {
    const lines = data.toString().trimEnd().split('\n');
    for (const line of lines) {
      if (line.trim()) console.log(`${prefix}${line}`);
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trimEnd().split('\n');
    for (const line of lines) {
      if (line.trim()) console.error(`${prefix}${line}`);
    }
  });

  child.on('exit', (code, signal) => {
    console.log(`${prefix}Process exited (code ${code ?? signal})`);
  });

  children.push(child);
  return child;
}

async function main() {
  // 1. Check & start MongoDB
  const mongoRunning = await checkPort(27017);
  if (mongoRunning) {
    console.log('\x1b[32m[MongoDB]\x1b[0m Already running on 127.0.0.1:27017');
  } else {
    console.log('\x1b[32m[MongoDB]\x1b[0m Starting local MongoDB server...');
    startService(
      'MongoDB',
      '\x1b[32m',
      mongodPath,
      ['--dbpath', `"${mongoDataDir}"`, '--port', '27017', '--bind_ip', '127.0.0.1'],
      __dirname
    );
    // Wait 2 seconds for MongoDB to initialize
    await new Promise((r) => setTimeout(r, 2000));
  }

  // 2. Start Backend API
  console.log('\x1b[34m[Backend]\x1b[0m Starting Express API on http://localhost:5000 ...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  startService(
    'Backend',
    '\x1b[34m',
    npmCmd,
    ['run', 'dev'],
    path.join(__dirname, 'backend')
  );

  // 3. Start Frontend UI
  console.log('\x1b[35m[Frontend]\x1b[0m Starting Vite dev server on http://localhost:5173 ...');
  startService(
    'Frontend',
    '\x1b[35m',
    npmCmd,
    ['run', 'dev', '--', '--host', '0.0.0.0', '--port', '5173'],
    __dirname
  );

  console.log('\n\x1b[32m✔ All services initialized!\x1b[0m');
  console.log('➜ Frontend: \x1b[4mhttp://localhost:5173\x1b[0m');
  console.log('➜ Backend:  \x1b[4mhttp://localhost:5000\x1b[0m');
  console.log('➜ Database: \x1b[4mmongodb://localhost:27017/campus-lost-found\x1b[0m');
  console.log('Press \x1b[1mCtrl+C\x1b[0m to stop all services at once.\n');
}

function cleanup() {
  console.log('\n\x1b[33mShutting down all services...\x1b[0m');
  for (const child of children) {
    try {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill', ['/pid', String(child.pid), '/f', '/t']);
      } else {
        child.kill('SIGINT');
      }
    } catch (_) {}
  }
  setTimeout(() => process.exit(0), 500);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

main().catch((err) => {
  console.error('Failed to start all services:', err);
  cleanup();
});
