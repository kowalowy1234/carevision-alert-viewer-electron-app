const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { networkInterfaces } = require('os');
const fs = require('fs');
const path = require('path');

let mainWindow;

function createWindow() {
    
    const configPath = path.join(process.cwd(), 'config.json');
    let host = "http://localhost:4202";

    if (fs.existsSync(configPath)) {
        const configData = fs.readFileSync(configPath);
        const config = JSON.parse(configData);
        host = config.host;
    }

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: __dirname + '/preload.js',
        }
    });

    console.log(`Connecting to ${host}`);

    mainWindow.loadURL(host);

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error(`Nie udało się załadować ${host}: ${errorDescription} (Kod błędu: ${errorCode})`);
    
        // Inject HTML content directly into the page
        const errorHtml = `
            <!DOCTYPE html>
            <html lang="pl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Błąd połączenia</title>
            </head>
            <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 20%;">
                <h2>Nie udało się połączyć z serwerem</h2>
                <p>Nie udało się załadować: ${host}</p>
                <p>Błąd: ${errorDescription} (Kod: ${errorCode})</p>
            </body>
            </html>
        `;
    
        mainWindow.webContents.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(errorHtml));
    });
    

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
