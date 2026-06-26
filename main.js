const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { shell } = require('electron');

let mainWindow;
let isQuitting = false;

const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');
const iconsPath = path.join(userDataPath, 'icons.json');

const defaultSettings = {
  themeColor: '#ffffff',
  bgOpacity: 6,
  blurAmount: 20,
  iconSize: 48,
  position: 'top'
};

const defaultIcons = [
  { id: 1, name: '此电脑', icon: '💻', path: 'explorer.exe', type: 'app' },
  { id: 2, name: '回收站', icon: '🗑️', path: 'shell:RecycleBinFolder', type: 'system' },
  { id: 3, name: '设置', icon: '⚙️', path: 'ms-settings:', type: 'system' },
  { id: 4, name: '浏览器', icon: '🌐', path: 'https://www.google.com', type: 'url' },
  { id: 5, name: '邮件', icon: '📧', path: 'mailto:', type: 'url' }
];

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return defaultSettings;
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (e) {
    console.error('Error saving settings:', e);
    return false;
  }
}

function loadIcons() {
  try {
    if (fs.existsSync(iconsPath)) {
      return JSON.parse(fs.readFileSync(iconsPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading icons:', e);
  }
  return defaultIcons;
}

function saveIcons(icons) {
  try {
    fs.writeFileSync(iconsPath, JSON.stringify(icons, null, 2));
    return true;
  } catch (e) {
    console.error('Error saving icons:', e);
    return false;
  }
}

function createWindow() {
  const settings = loadSettings();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // 使用小窗口高度，只占用顶部一小条区域
  mainWindow = new BrowserWindow({
    width: 800,
    height: 120,
    x: Math.floor((screenWidth - 800) / 2),
    y: 0,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 设置窗口可点击穿透背景
  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.setVisibleOnAllWorkspaces(true);

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send('init-data', {
      settings: loadSettings(),
      icons: loadIcons()
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 窗口获得焦点时，允许交互
  mainWindow.on('focus', () => {
    mainWindow.setIgnoreMouseEvents(false);
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

// IPC handlers
ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (event, settings) => {
  return saveSettings(settings);
});

ipcMain.handle('get-icons', () => {
  return loadIcons();
});

ipcMain.handle('save-icons', (event, icons) => {
  return saveIcons(icons);
});

ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('show-window', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

ipcMain.handle('resize-window', (event, height) => {
  if (mainWindow) {
    const bounds = mainWindow.getBounds();
    mainWindow.setBounds({ ...bounds, height });
  }
});

// 打开文件选择对话框
ipcMain.handle('select-exe-file', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: '应用程序', extensions: ['exe', 'lnk', 'bat', 'cmd'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 启动应用/路径/URL
ipcMain.handle('launch-path', (event, iconPath) => {
  try {
    if (iconPath.startsWith('http://') || iconPath.startsWith('https://') || iconPath.startsWith('mailto:')) {
      shell.openExternal(iconPath);
    } else if (iconPath.startsWith('shell:')) {
      shell.openPath(iconPath.replace('shell:', ''));
    } else {
      shell.openPath(iconPath);
    }
    return true;
  } catch (e) {
    console.error('Error launching path:', e);
    return false;
  }
});
