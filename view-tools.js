module.exports = {
  resizeView(window, view) {
    view.setBounds({
      x: 0,
      y: 0,
      width: window.getContentBounds().width,
      height: window.getContentBounds().height,
    })
  },
  checkCritical(view) {
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
  },
  reloadGraphs(view) {
    view.webContents.executeJavaScript(
      `document.querySelector(".awsui-button.awsui-button-no-text.awsui-button-variant-normal.awsui-hover-child-icons").click()`
    )
  },
  drawTitle(view, title) {
    view.webContents.executeJavaScript(`
    $name = document.createElement('div')
    document.body.appendChild($name)
    $name.innerHTML = '${title || 'UNKNOWN'}'

    $name.style.position = "absolute"
    $name.style.display = "block"
    $name.style.top = "0"
    $name.style.left = "0"
    $name.style.zIndex = "9999"

    $name.style.fontSize = "35px"
    $name.style.fontWeight = "bold"
    $name.style.fontFamily = "sans-serif"
    $name.style.color = "white"
    $name.style.backgroundColor = "#16191F"
    $name.style.padding = "8px 150px 8px 50px"
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
  },
}
