import m from './m'

window.addEventListener('load', async function onLoad () {
  const albums = await getAlbums()
  const controllers = {
    playPause: document.body,
    shuffle: document.querySelector('.shuffle'),
    next: document.querySelector('.next')
  }

  const actions = {
    playPause,
    updateView,
    shuffle
  }

  window.player = new MusicPlayer(albums, controllers, actions)
})

function playPause () {
  const action = document.querySelector('header span.toggle')
  if (action) {
    if (action.innerText === '▶️') {
      action.innerText = '⏸'
    } else {
      action.innerText = '▶️'
    }
  }
}

function shuffle () {
  const action = document.querySelector('header span.shuffle')
  if (action) {
    if (action.innerText === '🔀') {
      action.innerText = '🔁'
    } else {
      action.innerText = '🔀'
    }
  }
}

async function getAlbums () {
  const response = await fetch('albums.json')
  const albums = response.json()

  return albums
}

class MusicPlayer {
  constructor(albums, controllers, actions) {
    this.albums = albums
    this.audios = []
    this.albumN = 2
    this.trackN = 0
    this.shuffle = false
    this.actions = actions

    this.loadTrack()

    const onPlay = () => {
      this.toggle()
    }

    const onShuffle = (event) => {
      event.stopPropagation()
      this.toggleShuffle()
      this.actions.shuffle()
    }

    const onNext = (event) => {
      event.stopPropagation()
      this.next()
    }

    controllers.playPause.addEventListener('click', onPlay)
    controllers.playPause.addEventListener('touch', onPlay)

    controllers.playPause.addEventListener('keydown', function onKeyPress (event) {
      if (event.code === 'Space') {
        onPlay()
      } else if (event.code === 'ArrowRight') {
        // right arrow key
        onNext(event)
      } else if (event.code === 'KeyS') {
        // s key
        onShuffle(event)
      }
    })

    controllers.shuffle.addEventListener('click', onShuffle)
    controllers.shuffle.addEventListener('touch', onShuffle)

    controllers.next.addEventListener('click', onNext)
    controllers.next.addEventListener('touch', onNext)
  }

  toggle () {
    if (this.on) {
      this.pause()
    } else {
      this.play()
    }

    this.on = !this.on
  }

  toggleShuffle () {
    if (this.shuffle) {
      // turn off shuffle

      if (this.tempShuffle) {
        this.albumN = this.tempShuffle.albumN
        this.trackN = this.tempShuffle.trackN

        delete this.tempShuffle
      }
    } else {
      // turn off shuffle

      const { albumN, trackN } = this
      this.tempShuffle = { albumN, trackN }
    }

    this.shuffle = !this.shuffle
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
    if (this.shuffle) {
      this.randomTrack()

      return
    }

    const album = this.albums[this.albumN]
    const numTracks = album.tracks.length
    
    if (this.trackN === numTracks - 1) {
      this.trackN = 0
      this.nextAlbum()
    } else {
      this.trackN += 1
    }

  }

  randomTrack () {
    const numAlbums = this.albums.length
    
    this.albumN = getRandomInt(0, numAlbums - 1)
    
    const album = this.albums[this.albumN]
    const numTracks = album.tracks.length

    this.trackN = getRandomInt(0, numTracks - 1)
  }

  nextAlbum () {
    let numAlbums = this.albums.length
    if (this.albumN === numAlbums - 1) {
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

    const pause = () => {
      that.actions.playPause()
      that.actions.updateView()
    }

    const play = () => {
      that.actions.playPause()
      that.actions.updateView(that.album, that.track)
    }

    if (start) {
      audio.addEventListener('ended', function end () {
        audio.removeEventListener('ended', end)
        audio.removeEventListener('pause', pause)
        audio.removeEventListener('play', play)

        delete that.audio
        that.actions.updateView()
        that.play()
      })

      audio.addEventListener('pause', pause)
      audio.addEventListener('play', play)
    }
  }

  next () {
    if (this.audio) {
      this.audio.pause()
      this.audio.currenTime = 0
      const event = new Event('ended')
      this.audio.dispatchEvent(event)
    }
  }

  pause () {
    if (this.audio) {
      this.audio.pause()
    }
    this.actions.updateView()
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
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