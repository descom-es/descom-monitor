const { app, BrowserView, BrowserWindow } = require('electron')
const fs = require('fs')

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

let steps
let defaultInterval
let index
let stepViews
let window

app.whenReady().then(() => {
  const config = JSON.parse(fs.readFileSync('config.json'))

  steps = config.steps
  defaultInterval = config.interval

  window = createWindow()
  index = 0
  stepViews = []

  for (let i = 0; i < steps.length; i++) {
    stepViews[i] = createView(window, steps[i].url)

    stepViews[i].webContents.on('dom-ready', () => {
      setTimeout(() => {
        stepViews[i].webContents.executeJavaScript(`
          $p = document.createElement('p')
          document.body.appendChild($p)
          $p.innerHTML = '${steps[i].name || 'UNKNOWN'}'
          $p.style.position = "absolute"
          $p.style.display = "block"
          $p.style.fontSize = "3em"
          $p.style.fontWeight = "bold"
          $p.style.color = "white"
          $p.style.opacity = "50%"
          $p.style.top = "20px"
          $p.style.right = "10px"
        `)
      }, 0)
    })
  }

  main()
})

async function main() {
  while (true) {
    window.setBrowserView(stepViews[index])

    resizeView(window, stepViews[index])

    await sleep(steps[index].interval || defaultInterval)

    if (index == steps.length - 1) {
      index = 0
    } else {
      index++
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
function resizeView(window, view) {
  view.setBounds({
    x: 0,
    y: 0,
    width: window.getContentBounds().width,
    height: window.getContentBounds().height,
  })
}
