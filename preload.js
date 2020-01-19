// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type])
  }
  const { ipcRenderer } = require("electron");
  window.appsettings = require("electron-settings");
  window.appinvoke = ipcRenderer.send;
  window.$ = window.jquery = require("jquery");
  window.popper = require("popper.js");
  window.bootstrap = require("bootstrap");

  appinvoke("app-invoke", { log: '"Hello"' });
})
