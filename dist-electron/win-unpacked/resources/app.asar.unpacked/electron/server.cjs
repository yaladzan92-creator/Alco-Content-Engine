const http = require('http');
const path = require('path');
const fs = require('fs');

function log(msg) {
  const timestamp = new Date().toISOString();
  console.log(`[ALCO-SERVER ${timestamp}] ${msg}`);
}

function errorLog(msg, err) {
  const timestamp = new Date().toISOString();
  console.error(`[ALCO-SERVER-ERROR ${timestamp}] ${msg}`, err ? err.stack || err : '');
}

let activeHttpServer = null;
let activeNextApp = null;

async function startServer(options = {}) {
  const port = options.port || 3000;
  const host = options.host || '127.0.0.1';
  const appDir = options.appDir || path.resolve(__dirname, '..');

  log(`Initializing Next.js production server from directory: ${appDir} on ${host}:${port}`);

  process.env.NODE_ENV = 'production';
  process.env.PORT = String(port);
  process.env.HOSTNAME = host;

  // Validate .next directory
  const dotNextDir = path.join(appDir, '.next');
  if (!fs.existsSync(dotNextDir)) {
    const errorMsg = `Production build directory (.next) not found at: ${dotNextDir}. Ensure Next.js build has completed.`;
    errorLog(errorMsg);
    throw new Error(errorMsg);
  }

  log(`Loading Next.js engine from ${appDir}...`);
  const next = require('next');
  const app = next({
    dev: false,
    dir: appDir,
    hostname: host,
    port: port,
  });

  activeNextApp = app;
  const handle = app.getRequestHandler();

  log('Preparing Next.js app routes and assets...');
  await app.prepare();
  log('Next.js preparation complete.');

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  activeHttpServer = server;

  return new Promise((resolve, reject) => {
    server.on('error', (err) => {
      errorLog(`Server socket error on port ${port}:`, err);
      reject(err);
    });

    server.listen(port, host, () => {
      log(`ALCO Content Engine production server listening on http://${host}:${port}`);
      resolve({ server, port, host });
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (activeHttpServer) {
      log('Stopping active HTTP server...');
      activeHttpServer.close((err) => {
        if (err) {
          errorLog('Error while closing HTTP server:', err);
        } else {
          log('HTTP server closed successfully.');
        }
        activeHttpServer = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Clean shutdown listeners when executed as standalone or child process
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    log(`Received shutdown signal: ${signal}`);
    try {
      await stopServer();
    } catch (err) {
      errorLog('Error during graceful shutdown:', err);
    }
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('disconnect', () => shutdown('IPC_DISCONNECT'));
}

if (require.main === module) {
  setupGracefulShutdown();

  const args = process.argv.slice(2);
  const portArg = args.find((a) => a.startsWith('--port='));
  const dirArg = args.find((a) => a.startsWith('--dir='));

  const port = portArg
    ? parseInt(portArg.split('=')[1], 10)
    : parseInt(process.env.PORT || '3000', 10);
  const appDir = dirArg
    ? dirArg.split('=')[1]
    : (process.env.APP_DIR || path.resolve(__dirname, '..'));

  startServer({ port, appDir })
    .then(({ port, host }) => {
      log(`Production server ready on http://${host}:${port}`);
      if (process.send) {
        process.send({ type: 'ready', port, host });
      }
    })
    .catch((err) => {
      errorLog('Fatal error during production server start:', err);
      if (process.send) {
        process.send({ type: 'error', error: err.message || String(err) });
      }
      process.exit(1);
    });
}

module.exports = {
  startServer,
  stopServer,
};
