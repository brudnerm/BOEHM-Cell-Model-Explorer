
var screenHeight = window.innerHeight;
var screenWidth = window.innerWidth;


if (screenWidth >= 1024){

} else if (screenWidth <= 1024 && screenWidth > 768){

} else if (screenWidth <=768 && screenWidth >500){

} else if (screenWidth <=500){

}

var dispatch = d3.dispatch('changedata');


var margin = {t:5, l:150, b:5, r:50},
    width = d3.select("#plot").node().clientWidth - margin.l - margin.r,
    height = d3.select("#plot").node().clientHeight - margin.t - margin.b;


var plot_ = d3.select("#plot")    
    .append("svg")
    .attr("width", width + margin.l + margin.r)
    .attr("height", height + margin.t + margin.b)
    .append("g")
    .attr("transform", "translate(" + margin.l + "," + margin.t + ")");    


var plot2_ = d3.select("#plot2")    
    .append("svg")
    .attr("width", width + margin.l + margin.r)
    .attr("height", height + margin.t + margin.b)
    .append("g")
    .attr("transform", "translate(" + margin.l + "," + margin.t + ")");    

