const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { shell } = require('electron');

let mainWindow;
let settingsWindow = null;
let addIconWindow = null;
let isDockExpanded = false;
let mouseCheckInterval = null;
let collapseTimeout = null;

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
  { id: 1, name: '此电脑', icon: '💻', path: 'explorer.exe', type: 'system' },
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

function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 800,
    height: 30,
    x: Math.floor((screenWidth - 800) / 2),
    y: 0,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (mouseCheckInterval) {
      clearInterval(mouseCheckInterval);
      mouseCheckInterval = null;
    }
  });

  // 窗口移动时同步子窗口位置
  mainWindow.on('move', () => {
    positionChildWindows();
  });

  // 启动鼠标位置监控
  mouseCheckInterval = setInterval(checkMousePosition, 50);
}

function positionChildWindows() {
  if (!mainWindow) return;
  const mainBounds = mainWindow.getBounds();
  const y = mainBounds.y + mainBounds.height + 5;

  if (settingsWindow) {
    const swBounds = settingsWindow.getBounds();
    const x = mainBounds.x + Math.floor((mainBounds.width - swBounds.width) / 2);
    settingsWindow.setPosition(x, y);
  }

  if (addIconWindow) {
    const awBounds = addIconWindow.getBounds();
    const x = mainBounds.x + Math.floor((mainBounds.width - awBounds.width) / 2);
    addIconWindow.setPosition(x, y);
  }
}

function expandDockWindow() {
  if (!mainWindow || isDockExpanded) return;
  clearTimeout(collapseTimeout);
  isDockExpanded = true;
  const bounds = mainWindow.getBounds();
  mainWindow.setBounds({ ...bounds, height: 120 }, true);
  if (mainWindow.webContents) {
    mainWindow.webContents.send('dock-expand');
  }
}

function collapseDockWindow() {
  if (!mainWindow || !isDockExpanded) return;
  isDockExpanded = false;
  const bounds = mainWindow.getBounds();
  mainWindow.setBounds({ ...bounds, height: 30 }, true);
  if (mainWindow.webContents) {
    mainWindow.webContents.send('dock-collapse');
  }
}

function checkMousePosition() {
  if (!mainWindow) return;
  
  // 如果有子窗口打开，保持展开状态
  if (settingsWindow || addIconWindow) {
    if (!isDockExpanded) {
      expandDockWindow();
    }
    return;
  }
  
  const cursorPoint = screen.getCursorScreenPoint();
  const windowBounds = mainWindow.getBounds();
  
  const expandThreshold = 20;
  const mouseInExpandArea = 
    cursorPoint.x >= windowBounds.x - expandThreshold &&
    cursorPoint.x <= windowBounds.x + windowBounds.width + expandThreshold &&
    cursorPoint.y >= windowBounds.y - expandThreshold &&
    cursorPoint.y <= windowBounds.y + windowBounds.height + expandThreshold;
  
  if (mouseInExpandArea) {
    expandDockWindow();
  } else if (isDockExpanded) {
    const mouseInWindow = 
      cursorPoint.x >= windowBounds.x &&
      cursorPoint.x <= windowBounds.x + windowBounds.width &&
      cursorPoint.y >= windowBounds.y &&
      cursorPoint.y <= windowBounds.y + windowBounds.height;
    
    if (!mouseInWindow) {
      clearTimeout(collapseTimeout);
      collapseTimeout = setTimeout(() => {
        collapseDockWindow();
      }, 300);
    } else {
      clearTimeout(collapseTimeout);
    }
  }
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  const mainBounds = mainWindow.getBounds();

  settingsWindow = new BrowserWindow({
    width: 340,
    height: 500,
    x: mainBounds.x + Math.floor((mainBounds.width - 340) / 2),
    y: mainBounds.y + mainBounds.height + 5,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    modal: false,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  settingsWindow.loadFile('settings.html');

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createAddIconWindow() {
  if (addIconWindow) {
    addIconWindow.focus();
    return;
  }

  const mainBounds = mainWindow.getBounds();

  addIconWindow = new BrowserWindow({
    width: 440,
    height: 600,
    x: mainBounds.x + Math.floor((mainBounds.width - 440) / 2),
    y: mainBounds.y + mainBounds.height + 5,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    modal: false,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  addIconWindow.loadFile('add-icon.html');

  addIconWindow.on('closed', () => {
    addIconWindow = null;
  });
}

function broadcastData() {
  const data = {
    settings: loadSettings(),
    icons: loadIcons()
  };

  if (mainWindow) {
    mainWindow.webContents.send('data-updated', data);
  }
  if (settingsWindow) {
    settingsWindow.webContents.send('data-updated', data);
  }
  if (addIconWindow) {
    addIconWindow.webContents.send('data-updated', data);
  }
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ==================== IPC Handlers ====================

ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (event, settings) => {
  const result = saveSettings(settings);
  broadcastData();
  return result;
});

ipcMain.handle('get-icons', () => {
  return loadIcons();
});

ipcMain.handle('save-icons', (event, icons) => {
  const result = saveIcons(icons);
  broadcastData();
  return result;
});

// 打开设置窗口
ipcMain.handle('open-settings', () => {
  createSettingsWindow();
  return true;
});

// 关闭设置窗口
ipcMain.handle('close-settings', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
  return true;
});

// 打开添加图标窗口
ipcMain.handle('open-add-icon', () => {
  createAddIconWindow();
  return true;
});

// 关闭添加图标窗口
ipcMain.handle('close-add-icon', () => {
  if (addIconWindow) {
    addIconWindow.close();
  }
  return true;
});

// 打开文件选择对话框并提取图标
ipcMain.handle('select-exe-file', async () => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  const result = await dialog.showOpenDialog(win, {
    properties: ['openFile'],
    filters: [
      { name: '应用程序', extensions: ['exe', 'lnk', 'bat', 'cmd'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    let iconDataUrl = null;
    let appName = '';

    const fileName = path.basename(filePath);
    appName = fileName.replace(/\.[^/.]+$/, '');

    try {
      const icon = await app.getFileIcon(filePath, { size: 'large' });
      if (icon && !icon.isEmpty()) {
        iconDataUrl = icon.toDataURL();
      }
    } catch (e) {
      console.error('Error extracting icon:', e);
    }

    return {
      path: filePath,
      name: appName,
      icon: iconDataUrl
    };
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

// 展开Dock窗口
ipcMain.handle('expand-dock', () => {
  expandDockWindow();
  return true;
});

// 收起Dock窗口
ipcMain.handle('collapse-dock', () => {
  collapseDockWindow();
  return true;
});

// 退出应用
ipcMain.handle('quit-app', () => {
  app.quit();
  return true;
});
