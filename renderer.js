// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipcRender = require('electron').ipcRenderer

const selectFileChartBtn = document.getElementById('select-file-button')
const selectDataBtn = document.getElementById('load-data-button')

selectFileChartBtn.addEventListener('click', function(event) {
  ipcRender.send('open-file-dialog')
})

selectDataBtn.addEventListener('click', function(event) {
  ipcRender.send('load-data-button')
})

ipcRender.on('selected-chart-file', function(event, path) {
  var chart = require('./myChart.js');
  chart.drawChart(path[0])
})

ipcRender.on('selected-data-file', function(event, path) {
  var newData = require('./myChart.js');
  newData.appendData(path[0])
})
