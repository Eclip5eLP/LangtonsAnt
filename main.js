const { app, BrowserWindow } = require("electron");

//Electron App

let win;

function createWindow() {
	win = new BrowserWindow({
		width: 1200,
		height: 900,
		webPreferences: {
			nodeIntegration: true,
			nodeIntegrationInWorker: true
		}
	});

	win.loadFile("index.html");

	//win.webContents.openDevTools();

	win.on("closed", () => {
		win = null;
	});
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (win === null) createWindow();
});