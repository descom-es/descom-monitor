const { app, BrowserView, BrowserWindow } = require('electron')
const fs = require('fs')

// const http = require('http')

// const hostname = 'localhost'
// const port = 8080

// const server = http.createServer((req, res) => {
//   res.statusCode = 200
//   res.setHeader('Content-Type', 'text/html')
//   res.end(fs.readFileSync('./admin.html'))
// })

// server.listen(port, hostname, () => {
//   console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`)
// })

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
          $name = document.createElement('div')
          document.body.appendChild($name)
          $name.innerHTML = '${steps[i].name || 'UNKNOWN'}'

          $name.style.position = "absolute"
          $name.style.display = "block"
          $name.style.top = "0"
          $name.style.left = "0"
          $name.style.zIndex = "9999"

          $name.style.fontSize = "45px"
          $name.style.fontWeight = "bold"
          $name.style.fontFamily = "sans-serif"
          $name.style.color = "white"
          $name.style.backgroundColor = "#444444"
          $name.style.padding = "10px 150px 10px 50px"
          $name.style.margin = "0"

          $critical = document.createElement("div")
          document.body.appendChild($critical)
          $critical.innerHTML = "ALERTA"
          $critical.style.color = "red"
          $critical.style.position = "absolute"
          $critical.style.fontSize = "20vw"
          $critical.style.opacity = "35%"
          $critical.style.zIndex = "9999"
          $critical.style.top = "50px"
          $critical.style.left = "50%"
          $critical.style.transform = "translateX(-50%)"
          $critical.style.visibility = "hidden"
        `)
      }, 0)
    })
  }

  main()
})

async function main() {
  while (true) {
    reloadGraphs(stepViews[index])
    window.setBrowserView(stepViews[index])

    resizeView(window, stepViews[index])

    let checkInterval = null
    if (steps[index].checkCritical) {
      checkInterval = setInterval(() => {
        checkCritical(stepViews[index])
      }, 3000)
    }

    await sleep(steps[index].interval || defaultInterval)

    if (steps[index].checkCritical) {
      clearInterval(checkInterval)
    }

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
function checkCritical(view) {
  view.webContents.executeJavaScript(`
    $deploy = document.getElementsByClassName('cwdb-single-value-number-value')[0]
    $online = document.getElementsByClassName('cwdb-single-value-number-value')[1]

    if ($deploy.innerHTML == '0' || $online.innerHTML == '0') {
      $name.style.color = "red"
      $critical.style.color = "red"
      $critical.style.visibility = "visible"
    } else if ($deploy.innerHTML !== $online.innerHTML) {
      $name.style.color = "orange"
      $critical.style.color = "orange"
      $critical.style.visibility = "visible"
    } else {
      $name.style.color = "white"
      $critical.style.visibility = "hidden"
    }
  `)
}
function reloadGraphs(view) {
  view.webContents.executeJavaScript(
    `document.querySelector(".awsui-button.awsui-button-no-text.awsui-button-variant-normal.awsui-hover-child-icons").click()`
  )
}
