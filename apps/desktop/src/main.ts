// Electron main process. Loads a local placeholder page for now.
// TODO: once packages/core has a working conversion pipeline, wire this up to
// run conversions locally instead of loading a remote page, so the desktop
// app works offline, see docs/USAGE.md section 3.

import { app, BrowserWindow } from "electron";
import { join } from "node:path";

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1000,
    height: 700,
    title: "UniSwitch",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.loadFile(join(__dirname, "../../web/src/public/index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
