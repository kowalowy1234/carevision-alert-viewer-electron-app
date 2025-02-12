const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    getIP: () => ipcRenderer.invoke('get-ip'),
    getMAC: () => ipcRenderer.invoke('get-mac'),
});
