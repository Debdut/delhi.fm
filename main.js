window.addEventListener('load', async function onLoad () {
  const albums = await getAlbums()
  const controller = document.body

  const player = new SequencePlayer(albums, controller)
})

async function getAlbums () {
  const response = await fetch('albums.json')
  const albums = response.json()

  return albums
}

class SequencePlayer {
  constructor(albums, controller) {
    this.albums = albums
    this.audios = []
    this.albumN = 2
    this.trackN = 0

    this.loadTrack()

    const that = this

    controller.addEventListener('click', function onClick () {
      that.toggle()
    })

    controller.addEventListener('keypress', function onKeyPress (event) {
      if (event.code === 'Space') {
        that.toggle()
      }
    })
  }

  toggle () {
    if (this.on) {
      this.pause()
    } else {
      this.play()
    }
    this.on = !this.on
  }

  loadTrack (albumN, trackN) {
    if (albumN) {
      this.albumN = albumN
    }
    if (trackN) {
      this.trackN = trackN
    }

    const audioPath = this.albums[this.albumN].tracks[this.trackN].path
    const audio = new Audio(audioPath)

    this.audios.push(audio)
  }

  unloadTrack () {
    return this.audios.shift()
  }

  nextTrack () {
    let numTracks = this.albums[this.albumN].tracks.length
    if (this.trackN === numTracks - 1) {
      this.trackN = 0
      this.nextAlbum()
    } else {
      this.trackN += 1
    }
  }

  nextAlbum () {
    let numAlbums = this.albums.length
    if (this.albumN === numAlbums) {
      this.albumN = 0
    } else {
      this.albumN += 1
    }
  }

  play () {
    console.log('play')
    if (!this.audio) {
      this.audio = this.unloadTrack()
      this.nextTrack()
      this.loadTrack()
    }

    const that = this
    const audio = this.audio

    audio.play()
    audio.addEventListener('ended', function end () {
      audio.removeEventListener('ended', end)
      delete that.audio
      that.play()
    })
  }

  pause () {
    console.log('pause')
    if (this.audio) {
      this.audio.pause()
    }
  }
}