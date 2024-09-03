const { app, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, "/assets/IconaSafeDoc.ico"),
  });

  mainWindow.maximize();
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "/dist/doc/browser/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (mainWindow === null) createWindow();
  });
});
