const highlightjs = require('highlight.js')
const marked = require('marked')
const remote = require('remote')
const Menu = remote.require('menu')
const MenuItem = remote.require('menu-item')
const ipc = require('ipc')
const conf = remote.getGlobal('conf')
const currentWindow = remote.getCurrentWindow()

marked.setOptions({
  highlight: function (code, lang) {
    return highlightjs.highlightAuto(code, [ lang ]).value
  }
})

ipc.on('md', function (raw) {
  const md = marked(raw)
  const base = document.querySelector('base')
  const body = document.querySelector('.markdown-body')
  base.setAttribute('href', remote.getGlobal('baseUrl'))
  body.innerHTML = md
})

window.addEventListener('keydown', function (ev) {
  var esc = ev.keyCode === 27
  var w = ev.keyCode === 87
  var ctrlW = ev.ctrlKey && w
  var cmdW = ev.metaKey && w

  if (esc || ctrlW || cmdW) currentWindow.close()
})

var zoom = require('./zoom')(conf.zoom)

// menu
var vmdSubmenu = [
  { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: function () { remote.require('app').quit() } }
]

if (process.platform === 'darwin') {
  vmdSubmenu = [
    { label: 'About vmd', selector: 'orderFrontStandardAboutPanel:' },
    { type: 'separator' }
  ].concat(vmdSubmenu)
}

var template = [
  {
    label: 'vmd',
    submenu: vmdSubmenu
  },
  {
    label: 'File',
    submenu: [
      { label: 'Print', accelerator: 'CmdOrCtrl+P', click: function () { window.print() } }
    ]
  },
  {
    label: 'Edit',
    submenu: [
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', click: function () { document.execCommand('copy') } },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', click: function () { document.execCommand('selectAll') } }
    ]
  },
  {
    label: 'View',
    submenu: [
      { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', click: function () { zoom.zoomIn() } },
      { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', click: function () { zoom.zoomOut() } },
      { label: 'Reset Zoom', accelerator: 'CmdOrCtrl+0', click: function () { zoom.reset() } }
    ]
  }
]

// Context menus
// Doc: https://github.com/atom/electron/blob/master/docs/api/menu.md
const menu = new Menu()

menu.append(new MenuItem({
  label: 'Copy',
  role: 'copy'
}))

menu.append(new MenuItem({
  label: 'Select All',
  role: 'selectall'
}))

// Separator
menu.append(new MenuItem({
  type: 'separator'
}))

menu.append(new MenuItem({
  label: 'Reload',
  click: function() {
    currentWindow.reload()
  }
}))

menu.append(new MenuItem({
  type: 'separator'
}))

var rightClickPosition = null
menu.append(new MenuItem({
  label: 'Inspect Element',
  click: function() {
    currentWindow.inspectElement(rightClickPosition.x, rightClickPosition.y);
  }
}))


window.addEventListener('contextmenu', function(e) {
  e.preventDefault()
  rightClickPosition = {
    x: e.x,
    y: e.y
  }
  menu.popup(currentWindow)
}, false)


Menu.setApplicationMenu(Menu.buildFromTemplate(template))
