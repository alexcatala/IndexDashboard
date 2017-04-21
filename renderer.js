// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipcRender = require('electron').ipcRenderer

const selectDirBtn = document.getElementById('select-file-button')

selectDirBtn.addEventListener('click', function(event) {
  ipcRender.send('open-file-dialog')
})

ipcRender.on('selected-file', function(event, path) {
  var chart = require('./myChart.js');
  chart.drawChart(path[0])
})
