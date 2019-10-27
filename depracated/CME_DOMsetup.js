// https://codepen.io/brisor/pen/Gznyr
//zoomable
// https://observablehq.com/@d3/zoomable-sunburst
// https://codepen.io/thecraftycoderpdx/pen/rJYNRv

var screenHeight = window.innerHeight;
var screenWidth = window.innerWidth;

if (screenWidth >= 1024) {

} else if (screenWidth <= 1024 && screenWidth > 768) {

} else if (screenWidth <= 768 && screenWidth > 500) {

} else if (screenWidth <= 500) {

}

var TempFilterInput;

var margin = {
        t: 0,
        l: 0,
        b: 0,
        r: 0
    },
    width = d3.select("#plot").node().clientWidth - margin.l - margin.r,
    height = d3.select("#plot").node().clientHeight - margin.t - margin.b;

var vis = d3.select("#plot")
    .append("svg")
    .attr("width", width + margin.l + margin.r)
    .attr("height", height + margin.t + margin.b)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var radius = Math.min(width, height) / 2;
// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;
