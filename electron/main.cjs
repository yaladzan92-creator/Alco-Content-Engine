const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

let mainWindow = null;
let cachedDeviceId = null;

/**
 * Reads Windows MachineGuid from registry.
 * This is the primary hardware identity for ALCO devices on Windows.
 */
function getWindowsMachineGuid() {
  if (process.platform === 'win32') {
    try {
      const stdout = execSync(
        'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid',
        { encoding: 'utf8', timeout: 5000, stdio: ['ignore', 'pipe', 'ignore'] }
      );
      const match = stdout.match(/MachineGuid\s+REG_\w+\s+([a-zA-Z0-9{}-]+)/i);
      if (match && match[1]) {
        return match[1].replace(/[{}]/g, '').trim().toLowerCase();
      }
    } catch (err) {
      console.warn('[ALCO Device] Could not query Windows MachineGuid:', err.message);
    }
  }
  return null;
}

/**
 * Generates the standardized ALCO Device ID (ALCO-DEV-XXXX-XXXX-XXXX)
 * bound permanently to the Windows MachineGuid.
 */
function getAlcoProductionDeviceId() {
  if (cachedDeviceId) return cachedDeviceId;

  const machineGuid = getWindowsMachineGuid();
  let hardwareSeed = '';

  if (machineGuid) {
    // Primary Production hardware source: Windows MachineGuid
    hardwareSeed = `alco:contentengine:device::win::${machineGuid}`;
  } else {
    // Fallback for development/testing on non-Windows platforms (macOS/Linux)
    const os = require('os');
    const hostname = os.hostname() || 'localhost';
    const homedir = os.homedir() || '';
    hardwareSeed = `alco:contentengine:device::${process.platform}::${process.arch}::${hostname}::${homedir}`;
  }

  const hash = crypto.createHash('sha256').update(hardwareSeed).digest('hex');
  const rawHex = hash.slice(0, 12).toUpperCase().padEnd(12, '0');
  const part1 = rawHex.slice(0, 4);
  const part2 = rawHex.slice(4, 8);
  const part3 = rawHex.slice(8, 12);

  cachedDeviceId = `ALCO-DEV-${part1}-${part2}-${part3}`;
  return cachedDeviceId;
}

// Register IPC handler for renderer asking for Device ID
ipcMain.handle('alco:get-device-id', async () => {
  return getAlcoProductionDeviceId();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: 'ALCO Content Engine',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const isDev = !app.isPackaged;
  const startUrl = isDev
    ? 'http://127.0.0.1:3000'
    : 'http://localhost:3000';

  mainWindow.loadURL(startUrl).catch((err) => {
    console.error('Failed to load window:', err);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
