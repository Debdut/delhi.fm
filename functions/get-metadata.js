const ffmpeg = require('fluent-ffmpeg')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'public')

function getMetadata (file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path.join(ROOT, file), function(err, metadata) {
      if (err) {
        reject(new Error(err))
      }
      resolve(metadata)
    })
  })
}


module.exports = getMetadata