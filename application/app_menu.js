const {app, Menu} = require("electron")

module.exports = class ShhAppMenu {
  constructor(shh) {
    this.shh = shh
  }

  update(isMac = false, isDev = false) {
    const menu = Menu.buildFromTemplate(this.getTemplate(isMac, isDev))
    Menu.setApplicationMenu(menu)
    return this
  }

  getTemplate(isMac = false, isDev = false) {
    return [
      // { role: "appMenu" },
      ...(isMac ? [{
        label: this.shh.name,
        submenu: [
          { role: "about" },
          { type: "separator" },
          {
            label: "Preferences...",
            accelerator: "CommandOrControl+,",
            click: () => { this.shh.mainWindow.trigger("toggleSettings", [true]) }
          },
          { type: "separator" },
          { role: "services" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideothers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" }
        ]
      }] : []),
      // { role: "fileMenu" },
      {
        label: "File",
        submenu: [
          isMac ? { role: "close" } : { role: "quit" }
        ]
      },
      // { role: "editMenu" },
      {
        label: "Edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          ...(isMac ? [
            { role: "pasteAndMatchStyle" },
            { role: "delete" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [
                { role: "startspeaking" },
                { role: "stopspeaking" }
              ]
            }
          ] : [
            { role: "delete" },
            { type: "separator" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Preferences...",
              accelerator: "CommandOrControl+,",
              click: () => { this.shh.mainWindow.trigger("toggleSettings", [true]) }
            },
          ])
        ]
      },
      // { role: "viewMenu" },
      {
        label: "View",
        submenu: [
          { role: "resetzoom" },
          { role: "zoomin" },
          { role: "zoomout" },
          { type: "separator" },
            {
              label: "Reset main window",
              click: () => {
                this.shh.mainWindow.window.setBounds(this.shh.mainWindow.defaultBounds)
                this.shh.mainWindow.window.center()
              }
            },
          { role: "togglefullscreen" }
        ]
      },
      // { role: "windowMenu" },
      {
        label: "Window",
        submenu: [
          { role: "minimize" },
          { role: "zoom" },
          ...(isMac ? [
            { type: "separator" },
            { role: "front" },
            { type: "separator" },
            { role: "window" }
          ] : [
            { role: "close" }
          ])
        ]
      },
      // { role: "developer" },
      ...(isDev ? [{
        label: "Developer",
        submenu: [
          { role: "toggledevtools" },
          {
            label: "Inspect element...",
            accelerator: "CommandOrControl+Shift+C",
            click: () => {
              if (this.shh.mainWindow.window.webContents.isDevToolsOpened()) {
                this.shh.mainWindow.window.devToolsWebContents.executeJavaScript("DevToolsAPI.enterInspectElementMode()")
              } else {
                this.shh.mainWindow.window.webContents.once("devtools-opened", () => {
                   this.shh.mainWindow.window.devToolsWebContents.executeJavaScript("DevToolsAPI.enterInspectElementMode()")
                })
                this.shh.mainWindow.window.webContents.openDevTools()
              }
            }
          },
          { type: "separator" },
          { role: "reload" },
          { role: "forcereload" },
          {
            label: "Restart application",
            accelerator: "CommandOrControl+Alt+R",
            click: () => {
              app.relaunch()
              app.exit(0)
            }
          },
          {
            label: "Reset config (restarts)",
            click: () => { this.shh.settings.purge(true) }
          },
          {
            label: "Start REPL",
            accelerator: "CommandOrControl+Alt+P",
            click: () => { this.shh.dev.repl() }
          }
        ]
      }] : []),
      // { role: "help" },
      {
        role: "help",
        submenu: [
          {
            label: "GitHub project",
            role: "about",
            click: async () => {
              const { shell } = require("electron")
              await shell.openExternal("https://github.com/2called-chaos/shadowplay-highlight-helper")
            }
          },
          {
            label: "Online Documentation",
            role: "help",
            accelerator: "CommandOrControl+?",
            click: async () => {
              const { shell } = require("electron")
              await shell.openExternal("https://github.com/2called-chaos/shadowplay-highlight-helper/wiki")
            }
          }
        ]
      }
    ]
  }
}
