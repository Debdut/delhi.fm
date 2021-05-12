const R = require('rambda')

const findMusic = require('./find-music')
const getMetadata = require('./get-metadata')

async function getSongs () {
  const files = findMusic()
  let songs = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const song = await getSong(file)
    
    song.path = file
    songs.push(song)
  }

  return songs
}

module.exports = getSongs

async function getSong (path) {
  const metadata = await getMetadata(path)

  return R.pick([ 'track', 'album', 'album_artist', 'genre', 'artist', 'title' ], metadata.format.tags)
}