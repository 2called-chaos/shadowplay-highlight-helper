const fs = require("fs")
const path = require("path")

module.exports = class GameDirectory {
  constructor(indexer, dir, files) {
    this.indexer = indexer
    this.dir = dir
    this.index = {}
    this.junk = [
      "Thumbs.db",
      ".DS_Store",
    ]
    if(files) this.update(files)
  }

  cb(key, payload = {}) {
    this.indexer.send(`glist:${key}`, Object.assign({}, { dir: this.dir }, payload))
  }

  update(files, indexAll = true) {
    if(this.files) this.cb("clearAll")
    this.files = files
    this.games = files.filter(f => {
      const isdir = fs.lstatSync(path.join(this.dir, f)).isDirectory()
      if(isdir) this.cb("game:new", { name: f })
      return isdir
    })
    if(indexAll) this.indexAll()
    return this
  }

  async indexAll() {
    const promises = []
    this.games.forEach(name => {
      promises.push(this.indexGame(name))
    })
    await Promise.all(promises)
    this.cb("sync:complete")
    return this
  }

  async indexGame(name) {
    const store = {
      name: name,
      managed: [],
      unmanaged: [],
      screenshots: [],
      unknown: []
    }

    const files = fs.readdirSync(path.join(this.dir, name))
    files.forEach(f => {
      const fp = path.join(this.dir, name, f)
      const fstat = fs.lstatSync(fp)
      if(fstat.isDirectory()) {
        if(fs.existsSync(path.join(fp, ".shh-meta"))) {
          store.managed.push(fp)
        } else {
          store.unknown.push(fp)
        }
      } else {
        const ext = path.extname(f)
        if(this.junk.indexOf(f) > -1) {
          // ignore common junk files
        } else if(ext.toLowerCase() == ".png") {
          store.screenshots.push(fp)
        } else if(ext.toLowerCase() == ".mp4") {
          store.unmanaged.push(fp)
        } else {
          store.unknown.push(fp)
        }
      }
    })

    this.index[name] = store
    this.cb("game:update", this.index[name])
    return this.index[name]
  }
}
