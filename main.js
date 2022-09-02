const { app, BrowserView, BrowserWindow } = require('electron')
const fs = require('fs')

const ViewTools = require('./view-tools')

const http = require('http')
const server = http
  .createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.write('Descom Monitor Websocket')
    res.end()
  })
  .listen(8080)
const { Server } = require('socket.io')
const io = new Server(server)

io.on('connection', (socket) => {
  console.log('User Connected')

  socket.on('carousel_pause', () => {
    pause()
  })
  socket.on('carousel_resume', () => {
    resume()
  })
  socket.on('carousel_show', (data) => {
    show(data)
  })

  socket.on('disconnect', () => {
    console.log('User Disconnected')
  })
})

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#121212',
  })
  return win
}
const createView = (window, url) => {
  const view = new BrowserView()

  window.addBrowserView(view)

  view.setBounds({
    x: 0,
    y: 0,
    width: window.getContentBounds().width,
    height: window.getContentBounds().height,
  })
  view.setAutoResize({
    width: true,
    height: true,
    horizontal: true,
    vertical: true,
  })
  view.webContents.loadURL(url)

  return view
}

let defaultInterval
let index
let window

let timeout
let checkInterval = null
let slides = []
let currentSlide

app.whenReady().then(() => {
  setup()
  next(slides[0])

  // setTimeout(() => {
  //   pause()
  // }, 7000)
  // setTimeout(() => {
  //   resume()
  // }, 18000)
  // setTimeout(() => {
  //   show({
  //     name: 'PRUEBAAAAAA',
  //     interval: 5000,
  //     checkCritical: false,
  //     url: 'https://tortitas.eu',
  //   })
  // }, 28000)
})

function setup() {
  const config = JSON.parse(fs.readFileSync('config.json'))

  const steps = config.steps
  defaultInterval = config.interval

  window = createWindow()
  index = 0

  steps.map((step, index) => {
    const slide = (slides[index] = {
      index: index,
      config: step,
      view: createView(window, step.url),
    })

    slide.view.webContents.on('dom-ready', () => {
      setTimeout(() => {
        ViewTools.drawTitle(slide.view, slide.config.name)
      }, 0)
    })
  })
}

// TODO: CAROUSEL
function next(slide) {
  message('Carousel change', 'white')

  currentSlide = slide

  ViewTools.reloadGraphs(slide.view)
  window.setBrowserView(slide.view)
  ViewTools.resizeView(window, slide.view)

  if (slide.config.checkCritical) {
    checkInterval = setInterval(() => {
      ViewTools.checkCritical(slide.view)
    }, 3000)
  }

  timeout = setTimeout(() => {
    if (index == slides.length - 1) {
      index = 0
    } else {
      index++
    }

    next(slides[index])
    if (checkInterval) clearInterval(checkInterval)
  }, slide.config.interval || defaultInterval)
}

function pause() {
  message('Carousel pause', 'yellow')

  if (checkInterval) clearInterval(checkInterval)
  clearTimeout(timeout)
}

function resume() {
  message('Carousel resume', 'green')

  next(currentSlide)
}

function add(config) {
  slides.push(createSlide(config))
}

function show(config) {
  message('Carousel show', 'yellow')

  pause()

  const slide = createSlide(config)

  window.setBrowserView(slide.view)
  ViewTools.reloadGraphs(slide.view)
  ViewTools.resizeView(window, slide.view)
}

function createSlide(config) {
  return {
    index: slides.length,
    config: config,
    view: createView(window, config.url),
  }
}

// TODO: TOOLS
function message(msg, color = 'red') {
  colors = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  }

  console.log(colors['red'], '')
  console.log(colors[color], msg)
  console.log(colors['red'], '')
}
