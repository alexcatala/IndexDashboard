// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipcRender = require('electron').ipcRenderer

const selectDirBtn = document.getElementById('select-file-button')

selectDirBtn.addEventListener('click', function (event) {
   ipcRender.send('open-file-dialog')
})

 ipcRender.on('selected-file', function (event, path) {
   drawChart(path[0])
})

function drawChart(path) {
  console.log(path);
  var fs = require('fs');

  var margin = {
          top: 20,
          right: 20,
          bottom: 30,
          left: 50
      },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  //var parseDate = d3.timeParse("%d-%m-%y");
  var parseDate = d3.timeParse("%Y-%m-%d");

  var x = techan.scale.financetime()
      .range([0, width]);

  var y = d3.scaleLinear()
      .range([height, 0]);

  var ohlc = techan.plot.ohlc()
      .xScale(x)
      .yScale(y);

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisLeft(y);

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  fs.readFile(path, 'utf8', function(err, dataString) {
      var accessor = ohlc.accessor();
      var data = d3.csvParse(dataString);
      data = data.slice(0, 200).map(function(d) {
          return {
              date: parseDate(d.Date),
              open: +d.Open,
              high: +d.High,
              low: +d.Low,
              close: +d.Close,
              volume: +d.Volume
          };
      }).sort(function(a, b) {
          return d3.ascending(accessor.d(a), accessor.d(b));
      });

      //console.log(data);

      x.domain(data.map(accessor.d));
      y.domain(techan.scale.plot.ohlc(data, accessor).domain());

      svg.append("g")
          .attr("class", "ohlc");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")");

      svg.append("g")
          .attr("class", "y axis")
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Price ($)");

      // Data to display initially
      draw(data.slice(0, data.length - 20));
      // Only want this button to be active if the data has loaded
      d3.select("button").on("click", function() {
          draw(data);
      }).style("display", "inline");
  });

  function draw(data) {
      x.domain(data.map(ohlc.accessor().d));
      y.domain(techan.scale.plot.ohlc(data, ohlc.accessor()).domain());

      svg.selectAll("g.ohlc").datum(data).call(ohlc);
      svg.selectAll("g.x.axis").call(xAxis);
      svg.selectAll("g.y.axis").call(yAxis);
  }
}
