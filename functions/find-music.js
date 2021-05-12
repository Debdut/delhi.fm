const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'public', 'music')

function findMusic (parentDir = ROOT) {
  return findMusicH(parentDir)
    .map(file => path.relative(path.dirname(parentDir), file))
}

module.exports = findMusic

function findMusicH (parentDir) {
  const contents = getVisibleFiles(parentDir)
  const contentPaths = contents
    .map((file) => getFilePath(parentDir, file))
  
  const dirs = contentPaths
    .filter(isDir)
  let files = contentPaths
    .filter(isFile)
    .filter(isMusic)

  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i]
    const filesInDir = findMusicH(dir)
    
    files = files.concat(filesInDir)
  }

  return files
}

function isDir (file) {
  if (file) {
    if (fs.existsSync(file)) {
      if (fs.lstatSync(file).isDirectory()) {
        return true
      }
    }
  }
}

function isFile (file) {
  return !isDir(file)
}

function isVisible (fileName) {
  return fileName.charAt(0) !== '.'
}

function getFilePath (parentDir, fileName) {
  return path.join(parentDir, fileName)
}

function getFileName (file) {
  return path.parse(file)
    .name
}

function getVisibleFiles (parentDir) {
  return fs.readdirSync(parentDir)
    .filter(isVisible)
}

function getExtension (file) {
  return path.extname(file)
    .substring(1)
}

const MUSIC_EXTENSIONS = [ 'mp3', 'mpeg' , 'opus', 'ogg', 'oga', 'wav', 'aac', 'caf', 'm4a', 'mp4', 'weba', 'webm', 'dolby', 'flac' ]

function isMusic (fileName) {
  const extension = getExtension(fileName)
  
  return MUSIC_EXTENSIONS.indexOf(extension) > -1
}
