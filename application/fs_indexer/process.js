const fs = require("fs")
const path = require("path")
const getFolderSize = require("get-folder-size")
const GameDirectory = require("./game_directory")

class FsIndexer {
  constructor() {
    this.matrix = {}
  }

  send(...args) {
    process.send(JSON.stringify(args))
  }

  listen() {
    process.on("message", msg => {
      try {
        let args = false
        try {
          args = JSON.parse(msg)
        } catch (err) {
          console.error(`JSON parse error (58) -- ${err}`)
          process.exit(58)
        }
        if (args) {
          const cmd = args.shift()
          this.handleCommand(cmd, args)
        }
      } catch (err) {
        const errmsg = `Message handle error (9) -- ${err}`
        process.exit(9)
      }
    })
    this.send("process:ready")
  }

  handleCommand(cmd, args) {
    switch (cmd) {
      case "process:exit":
        process.exit(0)
        break
      case "glist:sync":
        this.indexGame(args[0])
        break
      case "glist:game:calculateSize":
        this.calculateSize(...args)
        break
      default:
        this.send("process:error", `unknown command ${cmd}`)
    }
  }

  formatBytes(fileSizeInBytes) {
    if(fileSizeInBytes === 0) return ("0 Bytes")
    let i = -1
    const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB']
    do {
      fileSizeInBytes = fileSizeInBytes / 1024
      i++;
    } while (fileSizeInBytes > 1024)

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i]
  }

  async calculateSize(dir, name) {
    getFolderSize(path.join(dir, name), (err, size) => {
      if (err) { throw err; }
      const result = { bytes: size, readable: this.formatBytes(size) }
      this.send("glist:game:size", Object.assign({}, { dir, name }, result))
    })
  }

  async indexGame(dir) {
    if(!fs.lstatSync(dir).isDirectory()) throw "not a directory"

    fs.readdir(dir, (e, files) => {
      const gd = this.matrix[dir] || new GameDirectory(this, dir)
      this.matrix[dir] = gd.update(files, true)
    })
  }
}

const fsi = new FsIndexer
fsi.listen()
