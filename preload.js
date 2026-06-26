const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  getIcons: () => ipcRenderer.invoke('get-icons'),
  saveIcons: (icons) => ipcRenderer.invoke('save-icons', icons),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  closeSettings: () => ipcRenderer.invoke('close-settings'),
  openAddIcon: () => ipcRenderer.invoke('open-add-icon'),
  closeAddIcon: () => ipcRenderer.invoke('close-add-icon'),
  selectExeFile: () => ipcRenderer.invoke('select-exe-file'),
  launchPath: (path) => ipcRenderer.invoke('launch-path', path),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  onDataUpdated: (callback) => ipcRenderer.on('data-updated', (event, data) => callback(data)),
  onInitData: (callback) => ipcRenderer.on('init-data', (event, data) => callback(data))
});
