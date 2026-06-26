const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getIcons: () => ipcRenderer.invoke('get-icons'),
  saveIcons: (icons) => ipcRenderer.invoke('save-icons', icons),
  hideWindow: () => ipcRenderer.send('hide-window'),
  showWindow: () => ipcRenderer.send('show-window'),
  resizeWindow: (height) => ipcRenderer.send('resize-window', height),
  selectExeFile: () => ipcRenderer.invoke('select-exe-file'),
  launchPath: (path) => ipcRenderer.invoke('launch-path', path),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  onInitData: (callback) => ipcRenderer.on('init-data', (event, data) => callback(data))
});
