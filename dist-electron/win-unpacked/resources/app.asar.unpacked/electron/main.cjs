const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const http = require('http');
const net = require('net');
const child_process = require('child_process');
const fs = require('fs');

let mainWindow = null;
let serverProcess = null;
let activePort = 3000;
let isQuitting = false;

// Safe production logger
function log(stage, message) {
  const timestamp = new Date().toISOString();
  console.log(`[ALCO-ELECTRON ${timestamp}] [${stage}] ${message}`);
}

function errorLog(stage, message, err) {
  const timestamp = new Date().toISOString();
  console.error(`[ALCO-ELECTRON-ERROR ${timestamp}] [${stage}] ${message}`, err ? err.stack || err : '');
}

// 1. Single Instance Lock
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  log('STARTUP', 'Another instance of ALCO Content Engine is already running. Exiting duplicate instance.');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// 2. Find Available Local Port
function findAvailablePort(startingPort = 3000) {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Try next port or random port (0)
        const fallbackSrv = net.createServer();
        fallbackSrv.unref();
        fallbackSrv.listen(0, '127.0.0.1', () => {
          const port = fallbackSrv.address().port;
          fallbackSrv.close(() => resolve(port));
        });
        fallbackSrv.on('error', reject);
      } else {
        reject(err);
      }
    });

    srv.listen(startingPort, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

// 3. Resolve Production App Root Directory
function resolveAppDirectory() {
  if (!app.isPackaged) {
    return path.resolve(__dirname, '..');
  }

  const appPath = app.getAppPath();
  const unpackedAsarPath = appPath.replace(/app\.asar$/, 'app.asar.unpacked');

  // Check if .next exists in app.asar.unpacked
  if (fs.existsSync(path.join(unpackedAsarPath, '.next'))) {
    return unpackedAsarPath;
  }

  // Check if .next exists in app.asar / appPath
  if (fs.existsSync(path.join(appPath, '.next'))) {
    return appPath;
  }

  // Check in resources path
  const resourcesPath = process.resourcesPath || '';
  if (fs.existsSync(path.join(resourcesPath, 'app.asar.unpacked', '.next'))) {
    return path.join(resourcesPath, 'app.asar.unpacked');
  }

  if (fs.existsSync(path.join(resourcesPath, 'app', '.next'))) {
    return path.join(resourcesPath, 'app');
  }

  return appPath;
}

// 4. Health Check
function checkServerHealth(port, host = '127.0.0.1', timeoutMs = 1500) {
  return new Promise((resolve) => {
    const req = http.get(
      `http://${host}:${port}/api/health`,
      { timeout: timeoutMs },
      (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve(true);
        } else {
          // Fallback to checking root if /api/health returned non-200
          resolve(res.statusCode === 200 || res.statusCode === 304);
        }
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.on('error', () => {
      resolve(false);
    });
  });
}

async function waitForServerReady(port, maxAttempts = 40, intervalMs = 250) {
  log('HEALTH_CHECK', `Waiting for server on port ${port} to be healthy (max ${maxAttempts} attempts)...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (isQuitting) return false;

    const isHealthy = await checkServerHealth(port);
    if (isHealthy) {
      log('HEALTH_CHECK', `Server health check passed on attempt ${attempt} (${attempt * intervalMs}ms elapsed).`);
      return true;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return false;
}

// 5. Start Production Server (Child Process)
async function startProductionServer(port, appDir) {
  return new Promise((resolve, reject) => {
    log('SERVER_SPAWN', `Spawning production server on 127.0.0.1:${port} from ${appDir}`);

    const serverScript = path.join(__dirname, 'server.cjs');

    // In packaged app, process.execPath is the electron binary. We set ELECTRON_RUN_AS_NODE=1 to run server.cjs
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(port),
      HOSTNAME: '127.0.0.1',
      ELECTRON_RUN_AS_NODE: '1',
      APP_DIR: appDir,
    };

    try {
      const child = child_process.spawn(
        process.execPath,
        [serverScript, `--port=${port}`, `--dir=${appDir}`],
        {
          env,
          cwd: appDir,
          stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
          windowsHide: true,
        }
      );

      serverProcess = child;

      child.stdout.on('data', (data) => {
        const text = data.toString().trim();
        if (text) {
          console.log(`[ALCO-SERVER] ${text}`);
        }
      });

      child.stderr.on('data', (data) => {
        const text = data.toString().trim();
        if (text) {
          console.error(`[ALCO-SERVER-ERR] ${text}`);
        }
      });

      child.on('error', (err) => {
        errorLog('SERVER_PROCESS', 'Child process spawn error', err);
        reject(err);
      });

      child.on('exit', (code, signal) => {
        log('SERVER_PROCESS', `Server process exited with code=${code}, signal=${signal}`);
        serverProcess = null;
      });

      child.on('message', (msg) => {
        if (msg && msg.type === 'ready') {
          log('SERVER_IPC', `Received ready message from server on port ${msg.port}`);
          resolve(child);
        } else if (msg && msg.type === 'error') {
          reject(new Error(msg.error || 'Server reported startup error'));
        }
      });

      // Also resolve immediately after spawning and rely on HTTP health check
      setTimeout(() => {
        resolve(child);
      }, 500);
    } catch (err) {
      errorLog('SERVER_SPAWN', 'Failed to start server process', err);
      reject(err);
    }
  });
}

// 6. Graceful Server Shutdown
async function stopProductionServer() {
  if (serverProcess && !serverProcess.killed) {
    log('SHUTDOWN', `Stopping production server child process (PID: ${serverProcess.pid})...`);
    try {
      serverProcess.kill('SIGTERM');

      // Force kill if not exited after 2 seconds
      const killTimeout = setTimeout(() => {
        if (serverProcess && !serverProcess.killed) {
          log('SHUTDOWN', 'Force killing server process (SIGKILL)...');
          serverProcess.kill('SIGKILL');
        }
      }, 2000);

      if (typeof killTimeout.unref === 'function') {
        killTimeout.unref();
      }
    } catch (err) {
      errorLog('SHUTDOWN', 'Error during server process termination', err);
    }
    serverProcess = null;
  }
}

// 7. Create Browser Window
function createMainWindow(url) {
  log('WINDOW', `Creating main window with target URL: ${url}`);

  const iconPath = path.join(__dirname, '../assets/icon.png');

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'ALCO Content Engine',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false, // Show when ready to prevent white flash
    backgroundColor: '#09090b',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  mainWindow.loadURL(url).catch((err) => {
    errorLog('WINDOW', `Failed to load URL: ${url}`, err);
    dialog.showErrorBox(
      'Gagal Membuka Aplikasi',
      `Tidak dapat memuat antarmuka ALCO Content Engine pada ${url}.\n\nPesan Kesalahan:\n${err.message || err}`
    );
  });

  mainWindow.once('ready-to-show', () => {
    log('WINDOW', 'Main window ready to show.');
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    log('NAV', `External link navigation requested: ${targetUrl}`);
    shell.openExternal(targetUrl);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    log('WINDOW', 'Main window closed.');
    mainWindow = null;
  });
}

// 8. Application Lifecycle Initialization
async function initializeApp() {
  log('INIT', 'Initializing ALCO Content Engine Desktop Runtime');
  log('ENV', `Electron: ${process.versions.electron}, Node: ${process.versions.node}, Platform: ${process.platform}, Arch: ${process.arch}`);
  log('ENV', `Executable: ${process.execPath}`);
  log('ENV', `App Path: ${app.getAppPath()}`);
  log('ENV', `Resources Path: ${process.resourcesPath || 'N/A'}`);
  log('ENV', `isPackaged: ${app.isPackaged}`);

  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

  if (isDev) {
    // In dev mode, check if dev server is running on port 3000
    log('DEV_MODE', 'Running in development mode. Checking for live dev server on port 3000...');
    const devServerLive = await checkServerHealth(3000);
    if (devServerLive) {
      activePort = 3000;
      createMainWindow(`http://127.0.0.1:${activePort}`);
      return;
    }
  }

  // Production or Standalone Mode: Start internal Next.js server
  try {
    const selectedPort = await findAvailablePort(3000);
    activePort = selectedPort;
    log('PORT', `Selected local port for Next.js server: ${activePort}`);

    const appDir = resolveAppDirectory();
    log('PATH', `Resolved production application directory: ${appDir}`);

    await startProductionServer(activePort, appDir);

    const isHealthy = await waitForServerReady(activePort, 45, 300);
    if (!isHealthy) {
      throw new Error(`Server health check timed out after 45 attempts on http://127.0.0.1:${activePort}`);
    }

    createMainWindow(`http://127.0.0.1:${activePort}`);
  } catch (err) {
    errorLog('FATAL', 'Critical failure during server startup or health check', err);
    dialog.showErrorBox(
      'ALCO Content Engine - Server Error',
      `Gagal menyalakan server aplikasi internal.\n\nDetail:\n${err.message || String(err)}\n\nPastikan build aplikasi lengkap dan tidak ada firewall yang memblokir loopback connection (127.0.0.1).`
    );
    app.quit();
  }
}

app.whenReady().then(() => {
  initializeApp();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow(`http://127.0.0.1:${activePort}`);
    }
  });
});

// 9. Graceful Exit Handlers
app.on('before-quit', async (event) => {
  if (!isQuitting) {
    isQuitting = true;
    log('SHUTDOWN', 'Application before-quit event received.');
    await stopProductionServer();
  }
});

app.on('window-all-closed', async () => {
  log('SHUTDOWN', 'All windows closed.');
  if (process.platform !== 'darwin') {
    isQuitting = true;
    await stopProductionServer();
    app.quit();
  }
});

app.on('will-quit', async () => {
  log('SHUTDOWN', 'Application will-quit event.');
  await stopProductionServer();
});
