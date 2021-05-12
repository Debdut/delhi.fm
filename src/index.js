import m from './m'

window.addEventListener('load', async function onLoad () {
  const albums = await getAlbums()
  const controller = document.body

  window.player = new SequencePlayer(albums, controller, onToggle, updateView)
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
  constructor(albums, controller, onToggle, updateView) {
    this.albums = albums
    this.audios = []
    this.albumN = 2
    this.trackN = 0
    this.onToggle = onToggle
    this.updateView = updateView

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

    const album = this.albums[this.albumN]
    const track = album.tracks[this.trackN]
    const audioPath = track.path
    const audio = new Audio(audioPath)

    this.audios.push(audio)
  }

  unloadTrack () {
    return this.audios.shift()
  }

  nextTrack () {
    const album = this.albums[this.albumN]
    const numTracks = album.tracks.length
    if (this.trackN === numTracks - 1) {
      this.trackN = 0
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
    let start = false
    if (!this.audio) {
      this.audio = this.unloadTrack()
      this.album = this.albums[this.albumN]
      this.track = this.album.tracks[this.trackN]
      start = true
      
      this.nextTrack()
      this.loadTrack()
    }
    
    const that = this
    const audio = this.audio
    
    audio.play()

    if (start) {
      audio.addEventListener('ended', function end () {
        audio.removeEventListener('ended', end)
        delete that.audio
        that.updateView()
        that.play()
      })
    }

    this.updateView(this.album, this.track)
  }

  pause () {
    if (this.audio) {
      this.audio.pause()
    }
    this.updateView()
  }
}

let view
function updateView (album, track) {
  if (document.body.offsetWidth < 900) {
    return
  }

  if (!album && !track) {
    if (view && view.parentNode) {
      view.parentNode.removeChild(view)
    }
    return
  }

  view = PlayerView(album, track)
  document.body.appendChild(view)

  setTimeout(function () {
    const back = document.querySelector('.player-view .back')
    if (back) {
      back.classList.add('active')
    }    
  }, 200) 
  
}

function PlayerView (album, track) {
  const view = m('div', { className: 'player-view' }, [
    m('div', { className: 'front' }, [
      m('img', { src: album.cover }),
      m('h2', album.title),
      m('h3', track.title)
    ]),
    m('div', { className: 'back' }, [
      m('img', { src: album.cover }),
    ])
  ])

  return view
}