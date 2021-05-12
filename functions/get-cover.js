const ffmpeg = require('fluent-ffmpeg')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'public')

function getCover (file) {
  return new Promise((resolve, reject) => {
    const source = path.join(ROOT, file) 
    const command = new ffmpeg({ source })

    command.ffprobe(function(err, metadata) {
      if (err) {
        reject(new Error(err))
      }
      
      const images = metadata.streams
        .filter(stream => stream.disposition.attached_pic)

      const imagePath = path.join(path.dirname(source), 'cover.jpg')
      
      command
        .addOptions('-map 0:' + images[0].index)
        .saveToFile(imagePath)
      
      resolve(path.relative(ROOT, imagePath))
    })
  })
}

module.exports = getCover