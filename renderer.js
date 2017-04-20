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
    var margin = {
            top: 10,
            right: 10,
            bottom: 100,
            left: 40
        },
        margin2 = {
            top: 430,
            right: 10,
            bottom: 20,
            left: 40
        },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        height2 = 500 - margin2.top - margin2.bottom;

    var color = d3.scale.category10();

    var parseDate = d3.time.format("%Y%m").parse;

    var x = d3.time.scale().range([0, width]),
        x2 = d3.time.scale().range([0, width]),
        y = d3.scale.linear().range([height, 0]),
        y2 = d3.scale.linear().range([height2, 0]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom"),
        xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
        yAxis = d3.svg.axis().scale(y).orient("left");

    var brush = d3.svg.brush()
        .x(x2)
        .on("brush", brush);

    var xAxis = d3.axisBottom(x);
    //var xTopAxis = d3.axisTop(x);
    var yAxis = d3.axisLeft(y);
    //var yRightAxis = d3.axisRight(y);

    var line2 = d3.svg.line()
        .defined(function(d) {
            return !isNaN(d.temperature);
        })
        .interpolate("cubic")
        .x(function(d) {
            return x2(d.date);
        })
        .y(function(d) {
            return y2(d.temperature);
        });

    var timeAnnotation = techan.plot.axisannotation()
        .axis(xAxis)
        .orient('bottom')
        .format(d3.timeFormat('%Y-%m-%d'))
        .width(65)
        .translate([0, height]);

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
        .attr("class", "pane")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);

        var sources = color.domain().map(function(name) {
            return {
                name: name,
                values: data.map(function(d) {
                    return {
                        date: d.date,
                        temperature: +d[name]
                    };
                })
            };
        });

        x.domain(d3.extent(data, function(d) {
            return d.date;
        }));
        y.domain([d3.min(sources, function(c) {
                return d3.min(c.values, function(v) {
                    return v.temperature;
                });
            }),
            d3.max(sources, function(c) {
                return d3.max(c.values, function(v) {
                    return v.temperature;
                });
            })
        ]);
        x2.domain(x.domain());
        y2.domain(y.domain());

        svg.select("g.ohlc").datum(data);
        //console.log(svg.select("g.ohlc").datum());

        var focuslines = focuslineGroups.append("path")
            .attr("class", "line")
            .attr("d", function(d) {
                return line(d.values);
            })
            .style("stroke", function(d) {
                return color(d.name);
            })
            .attr("clip-path", "url(#clip)");

        focus.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        /*svg.append('g')
            .attr("class", "crosshair")
            .datum({
                x: x.domain()[80],
                y: 67.5
            })
            .style("stroke", function(d) {
                return color(d.name);
            })
            .attr("clip-path", "url(#clip)");

        context.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", height2 + 7);

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
