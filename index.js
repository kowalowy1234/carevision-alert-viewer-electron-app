const { app, BrowserWindow, ipcMain } = require('electron');
const { networkInterfaces } = require('os');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false, // Disable for security reasons
            contextIsolation: true, // Enable context isolation
            preload: __dirname + '/preload.js', // Ensure this path points to your preload.js
        }
    });

    // Replace with your actual Angular app URL
    mainWindow.loadURL('http://172.16.61.119:4202');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
});

// IPC Handlers for 'get-ip' and 'get-mac'

// Get the local IP address
ipcMain.handle('get-ip', () => {
    const nets = networkInterfaces();
    let ip = null;

    for (const name of Object.keys(nets)) {
        if (ip !== null) break;
        for (const net of nets[name]) {
            if (!net.internal && net.mac !== '00:00:00:00:00:00' && net.family === 'IPv4' && net.address !== '127.0.0.1') {
                ip = net.address;
                break;
            }
        }
    }

    return ip || 'unknown';
});

// Get the MAC address
ipcMain.handle('get-mac', () => {
    const nets = networkInterfaces();
    let mac = null;

    for (const name of Object.keys(nets)) {
        if (mac !== null) break;
        for (const net of nets[name]) {
            if (!net.internal && net.mac !== '00:00:00:00:00:00' && net.family === 'IPv4' && net.address !== '127.0.0.1')  {
                mac = net.mac;
                break;
            }
        }
    }
    return mac || 'unknown';
});
