const { app, BrowserView, BrowserWindow } = require('electron')
const fs = require('fs')

const createWindow = () => {
  const win = new BrowserWindow({ width: 800, height: 600 })
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

app.whenReady().then(() => {
  const config = JSON.parse(fs.readFileSync('config.json'))

  const url = config.urls
  const interval = config.interval

  const window = createWindow()
  let index = 0
  let urlView = []

  for (let i = 0; i < url.length; i++) {
    urlView[i] = createView(window, url[i])
  }

  window.setBrowserView(urlView[0])
  index++

  setInterval(() => {
    window.setBrowserView(urlView[index])
    urlView[index].setBounds({
      x: 0,
      y: 0,
      width: window.getContentBounds().width,
      height: window.getContentBounds().height,
    })

    if (index == url.length - 1) {
      index = 0
    } else {
      index++
    }
  }, interval)
})
