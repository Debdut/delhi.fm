import m from './m'

window.addEventListener('load', async function onLoad () {
  const albums = await getAlbums()
  const controller = document.body

  const player = new SequencePlayer(albums, controller, onToggle, onAlbumChange)
})

function onToggle () {
  const action = document.querySelector('header span.action')
  if (action) {
    if (action.innerText === '▶️') {
      action.innerText = '⏸'
    } else {
      action.innerText = '▶️'
    }
  }
}

async function getAlbums () {
  const response = await fetch('albums.json')
  const albums = response.json()

  return albums
}

class SequencePlayer {
  constructor(albums, controller, onToggle, onAlbumChange) {
    this.albums = albums
    this.audios = []
    this.albumN = 2
    this.trackN = 0
    this.onToggle = onToggle
    this.onAlbumChange = onAlbumChange

    this.loadTrack()
    this.onAlbumChange(this.album)

    const that = this

    controller.addEventListener('click', function onClick () {
      that.toggle()
    })

    controller.addEventListener('keypress', function onKeyPress (event) {
      if (event.code === 'Space') {
        that.toggle()
      }
    })

    controller.addEventListener('touch', function onTouch () {
      that.toggle()
    })
  }

  toggle () {
    if (this.on) {
      this.pause()
    } else {
      this.play()
    }
    this.onToggle()
    this.on = !this.on
  }

  loadTrack (albumN, trackN) {
    if (albumN) {
      this.albumN = albumN
    }
    if (trackN) {
      this.trackN = trackN
    }

    const audioPath = this.album.tracks[this.trackN].path
    const audio = new Audio(audioPath)

    this.audios.push(audio)
  }

  unloadTrack () {
    return this.audios.shift()
  }

  nextTrack () {
    let numTracks = this.album.tracks.length
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
      this.onAlbumChange(this.album)
    }
  }

  get album () {
    return this.albums[this.albumN]
  }

  play () {
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
    if (this.audio) {
      this.audio.pause()
    }
  }
}

function onAlbumChange (album) {
  const view = PlayerView(album)
  document.body.appendChild(view)
}

function PlayerView (album) {
  const view = m('div', { className: 'player-view' }, [
    m('img', { src: album.cover }),
    m('h2', album.title)
  ])

  return view
}