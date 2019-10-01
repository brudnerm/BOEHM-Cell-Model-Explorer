
var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.linear()
    .range([0, radius]);

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
        return Math.max(0, y(d.y));
    })
    .outerRadius(function (d) {
        return Math.max(0, y(d.y + d.dy));
    });

function draw(json) {

    //     DETERMINE OPACITY SETTINGS FOR SUBTYPES
    json.children.forEach(function (d) {
        d.opacity = 1;
        var child = d.children;
        var subSize = [];
        child.forEach(function (e) {
            var sourceSize = d3.sum(e.children, function (f) {
                return f.size
            })
            subSize.push(sourceSize)
        })
        var extent = d3.extent(subSize, function (f) {
            return f
        })
        var opacityScale = d3.scale.pow().exponent(.25).range([1, .5]).domain(extent)
        child.forEach(function (e) {
            var opacity;
            var sourceSize = d3.sum(e.children, function (f) {
                return f.size
            })
            if (extent[0] != extent[1]) {
                opacity = opacityScale(sourceSize)
            } else {
                opacity = 1
            }
            e.opacity = opacity;
        })
    })

    vis.append("svg:circle")
        .attr("r", radius)
        .style("opacity", 0);

    var g = vis.selectAll("g")
        .data(partition.nodes(json))
        .enter().append("g");

    var path = g.append("path")
        .attr("d", arc)
        .style("fill", function (d) {
            if (d.depth == 1) {
                return colors[d.name];
            } else if (d.depth == 2) {
                return colors[(d.parent).name]
            } else if (d.depth == 3) {
                if (d.name == "CCLF") {
                    return "orange"
                } else {
                    return "black"
                }
            } else if (d.depth == 0) {
                return "white"
            }
        })
        .style("opacity", function (d) {

            if (d.depth == 0) {
                return 0
            } else if (d.depth == 1) {
                return 0
            } else if (d.depth == 2) {
//                return d.opacity
                return 1
            } else if (d.depth == 3) {
                if (d.name == "CCLF") {
                    return 0.5
                } else {
                    return 0
                }
            }
        })
        .style("stroke", "white")
        //        .style("stroke-width", ".5")
        .style("stroke-width", function (d) {
            if (d.depth == 3) {
                return 0.5
            } else {
                return 0.5
            }
        })
        .on("click", click);

    // http://bl.ocks.org/kaz-a/5c26993b5ee7096c8613e0a77bdd972b
    var text = g.append("text")
        .attr("class", "labels-lg")
        .attr("transform", function (d) {
            var rotation = computeTextRotation(d);
            var x = arc.centroid(d)[0];
            var y = arc.centroid(d)[1];
            var offset = radius / 10;
            if (rotation > 90) {
                offset = offset * -1
            }
            var xOffset = (offset * Math.cos(Math.PI * rotation / 180));
            var yOffset = (offset * Math.sin(Math.PI * rotation / 180));
            return "translate(" + (x + xOffset) + "," + (y + yOffset) + ")rotate(" + rotation + ")";
        })
        .attr("text-anchor", function (d) {
            if (computeTextRotation(d) > 90) {
                return "start"
            } else {
                return "end"
            }
        })
        .attr("dx", "0") // margin
        .attr("dy", ".35em") // vertical-align
        .text(function (d) {
            if (d.depth == 1 && d.dx > 0.005) {
                return d.name + " (" + d.value + ")";
            }
        })
        .style("fill", function (d) {
            if (d.depth == 1) {
                return colors[d.name]
            }
        })
    
    

    function computeTextRotation(d) {
        var ang = (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
        return (ang > 90) ? 180 + ang : ang;
    }

    function click(d) {
        console.log(d);
        var isRoot = drawNewPlot(TempDrawFilter(d));
        var isDepth = drawNewPlot(identifyDepth(d));
        text.transition().attr("opacity", 0);
        path.transition()
            .duration(750)
            .attrTween("d", arcTween(d))
            .style("opacity", function (e) {
                if (isDepth == 0) {
                    if (e.depth == 0) {
                        return 0
                    } else if (e.depth == 1) {
                        return 0
                    } else if (e.depth == 2) {
                        return e.opacity
                    } else if (e.depth == 3) {
                        if (e.name == "CCLF") {
                            return 0.6
                        } else {
                            return 0
                        }
                    }
                } else if (isDepth == 1) {
                    if (e.depth == 1) {
                        return .25
                    } else if (e.depth == 2) {
                        return e.opacity
                    } else if (e.depth == 3) {
                        if (e.name == "CCLF") {
                            return 0.7
                        } else {
                            return 0
                        }
                    }
                } else if (isDepth == 2) {
                    if (e.depth == 1) {
                        return 0
                    } else if (e.depth == 2) {
                        return 0.25
                    } else if (e.depth == 3) {
                        if (e.name == "CCLF") {
                            return 0.8
                        } else {
                            return 0.25
                        }
                    }
                } else if (isDepth == 3) {
                    if (e.depth == 1) {
                        return 0
                    } else if (e.depth == 2) {
                        return 0.25
                    } else if (e.depth == 3) {
                        if (e.name == "CCLF") {
                            return 0.8
                        } else {
                            return 0.25
                        }
                    }
                }
            })
            .each("end", function (e, i) {
                // check if the animated element's data e lies within the visible angle span given in d
                if (e.x >= d.x && e.x < (d.x + d.dx)) {
                    // get a selection of the associated text element
                    var arcText = d3.select(this.parentNode).select("text");
                    // fade in the text element and recalculate positions
                    arcText.transition().duration(750)
                        .attr("opacity", 1)
                        .attr("transform", function (f) {
                            var rotation = computeTextRotation(f);
                            var x = arc.centroid(f)[0];
                            var y = arc.centroid(f)[1];
                            var offset = radius / 10;
                            if (f.depth == 2) {
                                offset = radius / 7.5
                            }
                            if (rotation > 90) {
                                offset = offset * -1
                            }
                            var xOffset = (offset * Math.cos(Math.PI * rotation / 180));
                            var yOffset = (offset * Math.sin(Math.PI * rotation / 180));
                            if (isDepth == 0) {
                                if (f.depth == 1) {
                                    return "translate(" + (x + xOffset) + "," + (y + yOffset) + ")rotate(" + rotation + ")"
                                }
                            } else if (isDepth == 1) {
                                if (f.depth == 1) {
                                    return "translate(0, 45)"
                                } else if (f.depth > 1) {
                                    return "translate(" + (x + xOffset) + "," + (y + yOffset) + ")rotate(" + rotation + ")"
                                }
                            } else if (isDepth == 2) {
                                if (f.depth < 3) {
                                    return "translate(0, 45)"
                                } else if (f.depth == 3) {
                                    return "translate(" + (x + xOffset) + "," + (y + yOffset) + ")rotate(" + rotation + ")"
                                }
                            }
                        })
                        .attr("text-anchor", function (f) {
                            if (isDepth == 0) {
                                if (computeTextRotation(f) > 90) {
                                    return "start"
                                } else {
                                    return "end"
                                }
                            } else if (isDepth == 1) {
                                if (f.depth > 1) {
                                    if (computeTextRotation(f) > 90) {
                                        return "start"
                                    } else {
                                        return "end"
                                    }
                                } else if (f.depth == 1) {
                                    return "middle"
                                }
                            } else if (isDepth == 2) {
                                if (f.depth == 2) {
                                    return "middle"
                                } else if (f.depth == 3) {
                                    if (computeTextRotation(f) > 90) {
                                        return "start"
                                    } else {
                                        return "end"
                                    }
                                }
                            } else if (isDepth == 3) {
                                return "middle"
                            }
                        })
                        .text(function (f) {
                            if (isDepth == 0) {
                                if (f.depth == 1 && f.dx > 0.005) {
                                    return f.name + " (" + f.value + ")";
                                }
                            } else if (isDepth == 1) {
                                if (f.depth < 3) {
                                    return f.name + " (" + f.value + ")";
                                } else if (f.depth == 3 && f.name == "CCLF") {
                                    return f.name + " (" + f.value + ")";
                                }
                            } else if (isDepth == 2) {
                                if (f.depth > 1) {
                                    if (f.depth == 2) {
                                        if (f.value == 1) {
                                            return f.name + " (" + f.value + " Cellular Model)"
                                        } else {
                                            return f.name + " (" + f.value + " Cellular Models)"
                                        }
                                    }
                                }
                                if (f.depth == 3) {
                                    return f.name + " (" + f.value + ")"
                                }
                            } else if (isDepth == 3) {
                                if (f.depth == 3) {
                                    if (f.name == "CCLF") {
                                        if (f.value == 1) {
                                            return f.name + " has generated " + f.value + " cellular model"
                                        } else {
                                            return f.name + " has generated " + f.value + " cellular models"
                                        }
                                    } else {
                                        if (f.value == 1) {
                                            return f.name + " has " + f.value + " cellular model"
                                        } else {
                                            return f.name + " has " + f.value + " cellular models"
                                        }

                                    }

                                }
                            }
                        })
                        .style("fill", function (d) {
                            if (d.depth == 1) {
                                return colors[(d.children ? d : d.parent).name]
                            } else if (isDepth > 1 && d.depth == 2) {
                                return colors[(d.parent).name]
                            }
                        })
                        .attr("class", function (f) {
                            if (isRoot == "root") {
                                return "labels-lg"
                                if (f.depth == 1) {
                                    return "labels-lg"
                                }
                            } else if (isDepth == 1) {
                                if (f.depth == 1) {
                                    return "labels-extralg"
                                } else if (f.depth == 2) {
                                    return "labels-subtype"
                                } else if (f.depth == 3) {
                                    return "labels-source"
                                }
                            } else if (isDepth == 2) {
                                if (f.depth == 2) {
                                    return "labels-extralg"
                                } else {
                                    return "labels-source"
                                }
                            } else if (isDepth == 3) {
                                return "labels-extralg"
                            }
                        })
                }
            });
    }

    // Interpolate the scales!
    function arcTween(d) {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
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
};

function mouseover(d) {
    //    console.log(d)
}

function TempDrawFilter(input) {
    //    console.log("input", input.name)
    return input.name
}

function identifyDepth(input) {
    console.log("depth", input.depth)
    return input.depth
}

function drawNewPlot(sunburst_filter) {
    return sunburst_filter
    //    console.log("data", sunburst_filter)
}
