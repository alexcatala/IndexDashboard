var margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 50
  },
  margin2 = {
    top: 420,
    right: 20,
    bottom: 20,
    left: 50
  },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom,
  height2 = 500 - margin2.top - margin2.bottom;

var parseDate = d3.timeParse("%Y-%m-%d");

var x = techan.scale.financetime()
  .range([0, width]);

var x2 = techan.scale.financetime()
  .range([0, width]);

var y = d3.scaleLinear()
  .range([height, 0]);

var y2 = d3.scaleLinear()
  .range([height2, 0]);

  var closeInd = techan.plot.close()
    .xScale(x)
    .yScale(y);

exports.drawChart = function drawChart(path) {
  var fs = require('fs');

  var brush = d3.brushX()
    .extent([
      [0, 0],
      [width, height2]
    ])
    .on("end", brushed);

  var ohlc = techan.plot.ohlc()
    .xScale(x)
    .yScale(y);

  var ohlc2 = techan.plot.ohlc()
    .xScale(x2)
    .yScale(y2);

  var xAxis = d3.axisBottom(x);

  var xAxis2 = d3.axisBottom(x2);

  var yAxis = d3.axisLeft(y);

  var yAxis2 = d3.axisLeft(y2)
    .ticks(0);

  var ohlcAnnotation = techan.plot.axisannotation()
    .axis(yAxis)
    .orient('left')
    .format(d3.format(',.2f'));

  var timeAnnotation = techan.plot.axisannotation()
    .axis(xAxis)
    .orient('bottom')
    .format(d3.timeFormat('%Y-%m-%d'))
    .width(65)
    .translate([0, height]);

  var crosshair = techan.plot.crosshair()
    .xScale(x)
    .yScale(y)
    .xAnnotation(timeAnnotation)
    .yAnnotation(ohlcAnnotation);

  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  focus.append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", 0)
    .attr("y", y(1))
    .attr("width", width)
    .attr("height", y(0) - y(1));

  focus.append("g")
    .attr("class", "ohlc")
    .attr("clip-path", "url(#clip)");

  focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

  focus.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Price ($)");

  focus.append('g')
    .attr("class", "crosshair")
    .call(crosshair);

  var context = svg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  context.append("g")
    .attr("class", "ohlc");


  context.append("g")
    .attr("class", "pane");

  context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height2 + ")");

  context.append("g")
    .attr("class", "y axis")
    .call(yAxis2);

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
    x2.domain(x.domain());
    y.domain(techan.scale.plot.ohlc(data, accessor).domain());
    y2.domain(y.domain());
    focus.select("g.ohlc").datum(data);
    context.select("g.ohlc").datum(data).call(ohlc2);
    context.select("g.x.axis").call(xAxis2);

    // Associate the brush with the scale and render the brush only AFTER a domain has been applied
    context.select("g.pane").call(brush).selectAll("rect").attr("height", height2);

    x.zoomable().domain(x2.zoomable().domain());
    draw();

    //console.log("Render time: " + (Date.now()-timestart));
  });

  function brushed() {
    var zoomable = x.zoomable(),
      zoomable2 = x2.zoomable();

    zoomable.domain(zoomable2.domain());
    if (d3.event.selection !== null) zoomable.domain(d3.event.selection.map(zoomable.invert));
    draw();
  }

  function draw() {
    var ohlcSelection = focus.select("g.ohlc"),
      data = ohlcSelection.datum();
    y.domain(techan.scale.plot.ohlc(data.slice.apply(data, x.zoomable().domain()), ohlc.accessor()).domain());
    ohlcSelection.call(ohlc);
    focus.select("g.close").call(closeInd);
    // using refresh method is more efficient as it does not perform any data joins
    // Use this if underlying data is not changing
    //        svg.select("g.candlestick").call(candlestick.refresh);
    focus.select("g.x.axis").call(xAxis);
    focus.select("g.y.axis").call(yAxis);
  }

}

exports.appendData = function drawData(path) {
  var fs = require('fs');

  var focus = d3.select("g.focus")

  fs.readFile(path, 'utf8', function(err, dataString) {
    var accessor = closeInd.accessor();
    var data = d3.csvParse(dataString);
    data = data.slice(0, data.length).map(function(d) {
      return {
        date: parseDate(d.Date),
        close: +d.Close,
      };
    }).sort(function(a, b) {
      return d3.ascending(accessor.d(a), accessor.d(b));
    });
    focus.append("g")
      .attr("class", "close");


    focus.selectAll("g.close").datum(data).call(closeInd);
  });

}
