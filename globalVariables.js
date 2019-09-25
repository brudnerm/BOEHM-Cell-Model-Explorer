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