const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800, // Dimensioni iniziali della finestra
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, "/assets/IconaSafeDoc.ico"),
    show: false, // Nascondi la finestra finché non è pronta
  });

  // Carica l'app Angular
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "/dist/doc/browser/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  // Mostra la finestra solo quando è pronta
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  // Gestisci l'evento di chiusura
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.disableHardwareAcceleration();

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
