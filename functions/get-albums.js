const R = require('rambda')
const path = require('path')
const fs = require('fs')

const getSongs = require('./get-songs')
const getCover = require('./get-cover')

const ROOT = path.join(__dirname, '..', 'public')

async function getAlbums () {
  const songs = await getSongs()
  const albumsO = R.groupBy(song => song.album, songs)
  const albums = []

  for (const key in albumsO) {
    if (Object.hasOwnProperty.call(albumsO, key)) {
      const albumO = albumsO[key]
      const album = {}

      if (albumO[0].genre) {
        album.genre = albumO[0].genre
      }
      album.title = albumO[0].album
      album.cover = await getCover(albumO[0].path)
      album.tracks = albumO
        .map(R.pick([ 'artist', 'track', 'path', 'title' ]))
        .map(song => {
          if(!song.title) {
            song.title = path.parse(song.path)
              .name
          }

          if (song.track) {
            const track = parseInt(song.track
              .split('/')[0], 10)
            song.track = track
          } else {
            delete song[track]
          }

          if (!song.artist) {
            delete song.artist
          }

          return song
        })
      
      album.tracks = R.sortBy(t => t.track, album.tracks)
      
      albums.push(album)
    }
  }

  return albums
}

getAlbums()
  .then(albums => {
    fs.writeFileSync(path.join(ROOT, 'albums.json'), JSON.stringify(albums))
  })