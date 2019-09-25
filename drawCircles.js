function drawCircles(dom, datum) {

// datum is 1 data point. not an array. for each group element, this function runs,
// using the 'g' (dom) and 'd' (datum)
if (datum["cellLines"] != undefined){

        var x = arc.centroid(datum)[0];
        var y = arc.centroid(datum)[1];
        var rotation = computeTextRotation(datum);
        var offset = radius * 0.1;
        if (rotation > 90) {
            offset = offset * -1
        }
        var xOffset = (offset * Math.cos(Math.PI * rotation / 180));
        var yOffset = (offset * Math.sin(Math.PI * rotation / 180));
        
        var circleX = x + xOffset;
        var circleY = y + yOffset;



    var circles = dom.selectAll(".circles")
        .data(datum["cellLines"].filter(function(d){ return d.genomicTriad == "Test"}))

        circles.exit().remove()

        circles.enter()
            .append("circle")
            .attr("class", "circle")
            .attr("r", 4)
            .attr("cx", circleX)
            .attr("cy", circleY)
            .style("fill", "red")



}


}