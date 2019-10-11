function draw(json) {

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
                if (d.info.subSource == "CCLF") {
                    //                if (d.info.tumorType == "Metastasis") {
                    return "orange"
                } else {
                    return "gray"
                }
            } else if (d.depth == 0) {
                return "white"
            }
        })

        .style("opacity", function (d) {

            if (d.depth == 0) {
                return 0
            } else if (d.depth == 1) {
                return 0.07
            } else if (d.depth == 2) {
                //                return d.opacity
                return 1
            } else if (d.depth == 3) {
                if (d.info.subSource == "CCLF") {
                    //                if (d.info.tumorType == "Metastasis") {
                    return 0.8
                } else {
                    return 0
                }
            }
        })
        .style("stroke", function (d) {
            if (d.depth < 3) {
                return "white"
            } else if (d.depth == 3) {
                if (d.info.subSource == "CCLF") {
                    //                if (d.info.tumorType == "Metastasis") {
                    return "orange"
                } else {
                    return "white"
                }
            }
        })
        .style("stroke-width", ".5")
        .on("click", click);

    // http://bl.ocks.org/kaz-a/5c26993b5ee7096c8613e0a77bdd972b
    var text = g.append("text")
        .attr("class", "labels-lg")
        .attr("transform", function (d) {
            var rotation = computeTextRotation(d);
            var x = arc.centroid(d)[0];
            var y = arc.centroid(d)[1];
            var offset = radius / 7;
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
            if (d.depth == 1 && d.dx > 0.01) {
                if (computeTextRotation(d) > 90) {
                    return "(" + d.value + ") " + d.name;
                } else {
                    return d.name + " (" + d.value + ")";
                }
            }
        })
        .style("fill", function (d) {
            if (d.depth == 1) {
                return colors[d.name]
            }
        })
        .on("click", click);

    var circleG = g.append("circle")
        .attr("r", 5)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("transform", function (d) {
            var rotation = computeTextRotation(d);
            var x = arc.centroid(d)[0];
            var y = arc.centroid(d)[1];
            var offset = radius / 11;
            if (rotation > 90) {
                offset = offset * -1
            }
            var xOffset = (offset * Math.cos(Math.PI * rotation / 180));
            var yOffset = (offset * Math.sin(Math.PI * rotation / 180));
            return "translate(" + (x + xOffset) + "," + (y + yOffset) + ")rotate(" + rotation + ")";
        })
        .style("fill", "None")
        .style("stroke-width", 1)
        .style("stroke", function (d) {
            if (d.depth == 3) {
                var model = d
                if (model.info.genomicTriad == "Test") {
                    return "Red"
                } else {
                    return "None"
                }
            } else {
                return "None"
            }
        })

    function click(d) {

        console.log("clicked", d)

        var isRoot = TempDrawFilter(d);
        var isDepth = identifyDepth(d);
        text.transition().attr("opacity", 0);
        circleG.transition().attr("opacity", 0);

        path.transition()
            .duration(750)
            .attrTween("d", arcTween(d))
            .style("opacity", function (e) {
                if (isDepth == 0) {
                    if (e.depth == 0) {
                        return 0
                    } else if (e.depth == 1) {
                        return 0.07
                    } else if (e.depth == 2) {
                        return 1
                    } else if (e.depth == 3) {
                        if (e.info.subSource == "CCLF") {
                            return .8
                        } else {
                            return 0
                        }
                    }
                } else if (isDepth == 1) {
                    if (e.depth == 1) {
                        return .5
                    } else if (e.depth == 2) {
                        return 1
                    } else if (e.depth == 3) {
                        if (e.info.subSource == "CCLF") {
                            return .8
                        } else {
                            return .25
                        }
                    }
                } else if (isDepth == 2) {
                    if (e.depth == 1) {
                        return 0
                    } else if (e.depth == 2) {
                        return 0.5
                    } else if (e.depth == 3) {
                        if (e.info.subSource == "CCLF") {
                            return .8
                        } else {
                            return 0.25
                        }
                    }
                } else if (isDepth == 3) {
                    if (e.depth == 1) {
                        return 0
                    } else if (e.depth == 2) {
                        return 0.5
                    } else if (e.depth == 3) {
                        if (e.info.subSource == "CCLF") {
                            return .8
                        } else {
                            return 0.25
                        }
                    }
                }
            })
            .each("end", function (e, i) {

                // check if the animated element's data e lies within the visible angle span given in d
                if (e.x >= d.x && e.x < (d.x + d.dx)) {

                    var arcCircle = d3.select(this.parentNode).select("circle");
                    arcCircle.transition().duration(750)
                        .attr("opacity", 1)
                        .attr("transform", function (d) {
                            var rotation = computeTextRotation(d);
                            var x = arc.centroid(d)[0];
                            var y = arc.centroid(d)[1];
                            
                            if (isDepth == 0) { var offset = radius / 11 } 
                            else if (isDepth == 1) { var offset = radius / 8 } 
                            else if (isDepth == 2) { var offset = radius / 4.75 } 
                            else if (isDepth == 3) { var offset = radius / 1 }
                        
                            if (rotation > 90) {
                                offset = offset * -1
                            }
                            var xOffset = (offset * Math.cos(Math.PI * rotation / 180));
                            var yOffset = (offset * Math.sin(Math.PI * rotation / 180));
                            return "translate(" + (x + xOffset) + "," + (y + yOffset) + ")rotate(" + rotation + ")";
                        })

                    // get a selection of the associated text element
                    var arcText = d3.select(this.parentNode).select("text");
                    // fade in the text element and recalculate positions
                    arcText.transition().duration(750)
                        .attr("opacity", 1)
                        .attr("transform", function (f) {
                            var rotation = computeTextRotation(f);
                            // console.log(arc.centroid, f)
                            var x = arc.centroid(f)[0];
                            var y = arc.centroid(f)[1];
                            var offset = radius / 7;
                            if (f.depth == 2) {
                                offset = radius / 11
                            } else if (f.depth == 3) {
                                offset = radius / 12
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
                            } else if (isDepth == 3) {
                                return "translate(0, 45)"
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
                                if (f.depth == 1 && f.dx > 0.01) {
                                    if (computeTextRotation(f) > 90) {
                                        return "(" + f.value + ") " + f.name;
                                    } else {
                                        return f.name + " (" + f.value + ")";
                                    }
                                }
                            } else if (isDepth == 1) {
                                if (f.depth == 1) {
                                    return f.value + " " + f.name + " " + " cell models"
                                } else if (f.depth == 2) {
                                    if (computeTextRotation(f) > 90) {
                                        return "(" + f.value + ") " + f.name;
                                    } else {
                                        return f.name + " (" + f.value + ")";
                                    }
                                } else if (f.depth == 3) {
                                    if (computeTextRotation(f) > 90) {
                                        return "(" + f.value + ") " + f.name;
                                    } else {
                                        return f.name + " (" + f.value + ")";
                                    }
                                }
                            } else if (isDepth == 2) {
                                if (f.depth > 1) {
                                    if (f.depth == 2) {
                                        if (f.value == 1) {
                                            return f.value + " " + f.name + " " + " cell model"
                                        } else {
                                            return f.value + " " + f.name + " " + " cell models"
                                        }
                                    }
                                }
                                if (f.depth == 3) {
                                    if (computeTextRotation(f) > 90) {
                                        return "(" + f.value + ") " + f.name;
                                    } else {
                                        return f.name + " (" + f.value + ")";
                                    }
                                }
                            } else if (isDepth == 3) {
                                if (f.depth == 3) {
                                    if (f.name == "CCLF") {
                                        if (f.value == 1) {
                                            return f.value + " " + f.parent.name + " cell model"
                                        } else {
                                            return f.value + " " + f.parent.name + " cell models"
                                        }
                                    } else {
                                        if (f.value == 1) {
                                            return f.value + " " + f.parent.name + " cell model"
                                        } else {
                                            return f.value + " " + f.parent.name + " cell models"
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
                            } else if (isDepth == 3 && d.depth == 3) {
                                return colors["White"]
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
                                    return "labels-cellLine"
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
}; //end draw function
