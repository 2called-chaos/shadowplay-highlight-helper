const ShhView = require("../view")

module.exports = class ShhAlertFolderUsage extends ShhView {
  init() {}

  render() {
    this.dom.append($(`
      Important, please read

      This application <strong>will move your recordings</strong> to subdirectories on a per-video basis!
      It is highly recommended to set a custom, dedicated directory for your recordings within ShadowPlay/Geforce Experience
      since the default directory (your Windows videos folder) is potentially being filled with other, unrelated files.

      Note that this application <strong>will not</strong> move files on it's own, only if you proceed to edit, title or transcode a recording.
      Nothing will happen to your other files in the video folder but the application expects a <game>/*.mkv structure and will attempt
      to index and watch the whole directory. There is no way to distinguish a ShadowPlay folder from any other folder.

      You <em>can</em> use this application for other video files that do not originate from ShadowPlay but be aware
      that not all codex are supported especially in the editing view (cutting/transcoding happens with ffmpeg which can process almost every video)
      and indexing only looks for videos with an .mkv file extension.
    `))
  }
}
