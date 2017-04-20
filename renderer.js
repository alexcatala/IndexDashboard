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
    var yInit, yPercentInit, zoomableInit;

    var margin = {
            top: 20,
            right: 50,
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

    var zoom = d3.zoom()
        .on("zoom", zoomed);

    var zoomableInit;
    var ohlc = techan.plot.ohlc()
        .xScale(x)
        .yScale(y);

    var xAxis = d3.axisBottom(x);
    //var xTopAxis = d3.axisTop(x);
    var yAxis = d3.axisLeft(y);
    //var yRightAxis = d3.axisRight(y);

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

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var coordsText = svg.append('text')
        .style("text-anchor", "end")
        .attr("class", "coords")
        .attr("x", width - 5)
        .attr("y", 15);

    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", y(1))
        .attr("width", width)
        .attr("height", y(0) - y(1));

    svg.append("g")
        .attr("class", "ohlc")
        .attr("clip-path", "url(#clip)");

    svg.append("rect")
        .attr("class", "pane")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

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

        svg.select("g.ohlc").datum(data);
        //console.log(svg.select("g.ohlc").datum());

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            //.attr("transform", "translate(" + width + ",0)")
            .call(yAxis);

        /*svg.append('g')
            .attr("class", "crosshair")
            .datum({
                x: x.domain()[80],
                y: 67.5
            })
            .call(crosshair)
            .each(function(d) {
                move(d);
            }); // Display the current data
*/

// Stash for zooming
        zoomableInit = x.zoomable().domain([0, data.length]).copy(); // Zoom in a little to hide indicator preroll
        yInit = y.copy();
        draw();

        // Associate the zoom with the scale after a domain has been applied
        // Stash initial settings to store as baseline for zooming
        //zoomableInit = x.zoomable().clamp(false).copy();
    });

    function zoomed() {
        var rescaledY = d3.event.transform.rescaleY(y);
        yAxis.scale(rescaledY);
        ohlc.yScale(rescaledY);

        // Emulates D3 behaviour, required for financetime due to secondary zoomable scale
        x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());

        draw();
/*
        x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
        y.domain(d3.event.transform.rescaleY(yInit).domain());

        draw(); */
    }

    function draw() {
        svg.select("g.ohlc").call(ohlc);
        // using refresh method is more efficient as it does not perform any data joins
        // Use this if underlying data is not changing
        //svg.select("g.ohlc").call(ohlc.refresh);
        svg.select("g.x.axis").call(xAxis);
        svg.select("g.y.axis").call(yAxis);
    }
}
