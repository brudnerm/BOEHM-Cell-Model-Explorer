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
        if (d.depth == 0) { return Math.max(0, y(d.y)); } 
        else if (d.depth == 1) { return Math.max(0, y(d.y)); } 
        else if (d.depth == 2) { return Math.max(0, y(d.y)); } 
        else if (d.depth == 3) { return Math.max(0, y(d.y) * .8); } })
    .outerRadius(function (d) {
        if (d.depth == 0) { return Math.max(0, y(d.y + d.dy)); } 
        else if (d.depth == 1) { return Math.max(0, y(d.y + d.dy)); } 
        else if (d.depth == 2) { return Math.max(0, y(d.y + d.dy) * .8); } else if (d.depth == 3) { return Math.max(0, y(d.y + d.dy) * .7); } })
    .cornerRadius(4)
    
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


function identifyDepth(input) {
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

var setLocationCenter = "translate(0, 45)"

function setLocation (d, offsetValue) {
    var rotation = computeTextRotation(d);
            var x = arc.centroid(d)[0];
            var y = arc.centroid(d)[1];
            var offset = radius / offsetValue;
            if (rotation > 90) { offset = offset * -1 }
            var xOffset = x + (offset * Math.cos(Math.PI * rotation / 180));
            var yOffset = y + (offset * Math.sin(Math.PI * rotation / 180));
            return "translate(" + xOffset + "," + yOffset + ")rotate(" + rotation + ")";
}

function namePlusTextNumber (input) {
    if (input.value == 1) { return input.value + " " + input.name + " cell model" }
    else { return input.value + " " + input.name + " cell models"}
}

function namePlusParaNumber (input) {
    var truncate;
    if (input.name.length > 13) {truncate = "..."}
    else {var truncate = ""}
    if (input.depth != 1) {
        if (computeTextRotation(input) > 90) { return "(" + input.value + ") " + input.name.substring(0,13) + truncate; } 
        else { return input.name.substring(0,13) + truncate + " (" + input.value + ")"; } }
    else {
        if (computeTextRotation(input) > 90) { return "(" + input.value + ") " + input.name; } 
        else { return input.name + " (" + input.value + ")"; } }
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
