// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipcRender = require('electron').ipcRenderer

const selectDirBtn = document.getElementById('select-file-button')

selectDirBtn.addEventListener('click', function(event) {
  ipcRender.send('open-file-dialog')
})

ipcRender.on('selected-file', function(event, path) {
  drawChart(path[0])
})

function drawChart(path) {
  var fs = require('fs');
  var svg = d3.select("svg"),
    margin = {
      top: 20,
      right: 20,
      bottom: 110,
      left: 40
    },
    margin2 = {
      top: 430,
      right: 20,
      bottom: 30,
      left: 40
    },
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

  var parseDate = d3.timeParse("%Y-%m-%d");

  var x = techan.scale.financetime().range([0, width]),
    x2 = techan.scale.financetime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    y2 = d3.scaleLinear().range([height2, 0]);

  var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

  var brush = d3.brushX()
    .extent([
      [0, 0],
      [width, height2]
    ])
    .on("brush end", brushed);

  var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([
      [0, 0],
      [width, height]
    ])
    .extent([
      [0, 0],
      [width, height]
    ])
    .on("zoom", zoomed);

  var ohlc = techan.plot.ohlc()
    .xScale(x)
    .yScale(y);

  var ohlc2 = techan.plot.ohlc()
    .xScale(x2)
    .yScale(y2);
  /*  var area = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) {
            return x(d.date);
        })
        .y0(height)
        .y1(function(d) {
            return y(d.price);
        });

    var area2 = d3.area()
        .curve(d3.curveMonotoneX)
        .x(function(d) {
            return x2(d.date);
        })
        .y0(height2)
        .y1(function(d) {
            return y2(d.price);
        });
*/
  svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  fs.readFile(path, 'utf8', function(err, dataString) {
    var accessor = ohlc.accessor();
    var data = d3.csvParse(dataString);

    data = data.slice(0, data.length).map(function(d) {
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


    x.domain(data.map(accessor.d));
    y.domain(techan.scale.plot.ohlc(data, accessor).domain());

    x2.domain(x.domain());
    y2.domain(y.domain());

    focus.append("g")
      .attr("class", "ohlc");

    focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

    context.append("g")
      .attr("class", "ohlc");

    context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

    focus.select("g.ohlc").datum(data).call(ohlc);
    context.select("g.ohlc").datum(data).call(ohlc2);

    context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

    svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);
  });
  //var zoomableInit = x.zoomable().clamp(false).copy();

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    //console.log(focus.select("g.ohlc"));
    focus.select("g.ohlc").call(ohlc.refresh);
    focus.select(".axis axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
  }

  function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.select("g.ohlc").call(ohlc.refresh);
    focus.select(".axis axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  }
}
