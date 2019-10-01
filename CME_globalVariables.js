var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.linear()
    .range([0, radius * 1.25]);

var partition = d3.layout.partition()
    .value(function (d) {
        return d.size;
        var size = d.size
    });

var arc = d3.svg.arc()
    .startAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
    })
    .endAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
    })
    .innerRadius(function (d) {
        //        return Math.max(0, y(d.y));
        if (d.depth == 0) {
            return Math.max(0, y(d.y));
        } else if (d.depth == 1) {
            return Math.max(0, y(d.y));
        } else if (d.depth == 2) {
            return Math.max(0, y(d.y));
        } else if (d.depth == 3) {
            return Math.max(0, y(d.y) * .8);
        }
    })
    .outerRadius(function (d) {
        if (d.depth == 0) {
            return Math.max(0, y(d.y + d.dy));
        } else if (d.depth == 1) {
            return Math.max(0, y(d.y + d.dy));
        } else if (d.depth == 2) {
            return Math.max(0, y(d.y + d.dy) * .8);
        } else if (d.depth == 3) {
            return Math.max(0, y(d.y + d.dy) * .7);
        }
    });

// Interpolate the scales!
function arcTween(d) {
    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(y.domain(), [d.y, 1]),
        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius * 1.25]);
    return function (d, i) {
        return i ?
            function (t) {
                return arc(d);
            } :
            function (t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
                return arc(d);
            };
    };
}

function mouseover(d) {
    console.log("mouseover d", d)
}

function TempDrawFilter(input) {
    //    console.log("input", input.name)
    return input.name
}

function identifyDepth(input) {
    console.log("isDepth", input.depth)
    return input.depth
}

function drawNewPlot(sunburst_filter) {
    return sunburst_filter
    //    console.log("data", sunburst_filter)
}

function computeTextRotation(d) {
    var ang = (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
    return (ang > 90) ? 180 + ang : ang;
}



//     DETERMINE OPACITY SETTINGS FOR SUBTYPES
//    json.children.forEach(function (d) {
//        d.opacity = 1;
//        var child = d.children;
//        var subSize = [];
//        child.forEach(function (e) {
//            var sourceSize = d3.sum(e.children, function (f) {
//                return f.size
//            })
//            subSize.push(sourceSize)
//        })
//        var extent = d3.extent(subSize, function (f) {
//            return f
//        })
//        var opacityScale = d3.scale.pow().exponent(.25).range([1, .5]).domain(extent)
//        child.forEach(function (e) {
//            var opacity;
//            var sourceSize = d3.sum(e.children, function (f) {
//                return f.size
//            })
//            if (extent[0] != extent[1]) {
//                opacity = opacityScale(sourceSize)
//            } else {
//                opacity = 1
//            }
//            e.opacity = opacity;
//        })
//    })

//    .data(function(d){
//            return d["info"].filter(function(d){ return d.genomicTriad == "Test" })
//        })
