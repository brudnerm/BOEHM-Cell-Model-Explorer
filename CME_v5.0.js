////////////////////////////////////////////////////////////////////////////////////
//  Set up SVG in DOM
////////////////////////////////////////////////////////////////////////////////////


//  Get screen height and width
var screenHeight = window.innerHeight;
var screenWidth = window.innerWidth;

//  Set margin for Plot SVG
var margin = {
        t: 0,
        l: 0,
        b: 0,
        r: 0
    },
    width = d3.select("#plot").node().clientWidth - margin.l - margin.r, //  determine 'width'
    height = d3.select("#plot").node().clientHeight - margin.t - margin.b; //  determine 'height'

//  Create 'vis' variable for plot, selecting plot SVG element
var vis = d3.select("#plot")
    .append("svg") //  make 'vis' append SVG element
    .attr("width", width + margin.l + margin.r) //  set 'vis' width + left & right margin
    .attr("height", height + margin.t + margin.b) //  set 'vis' height + top & bottom margin
    .append("g") // create 'g' element in 'vis' for the arcs to append to
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"); //  move plot to center of SVG element

//  Determine plot radius based on width and height
var radius = Math.min(width, height) / 2;

//  Total size of all segments; we set this later, after loading the data.
var totalSize = 0;



////////////////////////////////////////////////////////////////////////////////////
//  Color Definitions
////////////////////////////////////////////////////////////////////////////////////

var colors = {
    "Lung Cancer": "#E74C3C",
    "Pancreatic Cancer": "#2E86C1",
    "Brain Cancer": "#E9967A",
    "Leukemia": "#6495ED",
    "Gastric Cancer": "#239B56",
    "Skin Cancer": "#5F9EA0",
    "Colon/Colorectal Cancer": "#BC8F8F",
    "Esophageal Cancer": "#8FBC8B",
    "Lymphoma": "#87CEEB",
    "Breast Cancer": "#F08080",
    "Ovarian Cancer": "#A569BD",
    "Kidney Cancer": "#2471A3",
    "Fibroblast": "#FF6347",
    "Head and Neck Cancer": "#7FB3D5",
    "Endometrial/Uterine Cancer": "#9370DB",
    "Sarcoma": "#A9A9A9",
    "Bladder Cancer": "#CD853F",
    "Myeloma": "#778899",
    "Liver Cancer": "#922B21",
    "Thyroid Cancer": "#DEB887",
    "Bone Cancer": "#909497",
    "Neuroblastoma": "#0E6655",
    "": "#5499C7",
    "Prostate Cancer": "#2980B9",
    "Bile Duct Cancer": "#B7950B",
    "Unknown": "#CCD1D1",
    "Rhabdoid": "#45B39D",
    "Liposarcoma": "#85C1E9",
    "Embryonal Cancer": "#D98880",
    "Gallbladder Cancer": "#F7DC6F",
    "Non-Cancerous": "#CCD1D1",
    "Immortalized": "#CCD1D1",
    "White": "white",
    "root": "white"
};



////////////////////////////////////////////////////////////////////////////////////
//  Function to Make Hierarchy
////////////////////////////////////////////////////////////////////////////////////

// Make nest based on data. keys refer to order of leaves in sunburst
function makeNest(data, key1, key2, key3) {
    var nest = d3.nest() //  D3 function for nesting data into JSON
        .key(function (d) { //  Primary element in hierarchy (Primary Disease)
            return d[key1]
        })
        .key(function (d) { //  Secondary element in hierarchy (Disease Subtype)
            return d[key2]
        })
        .key(function (d) { //  Tertiary element in hierarchy   (Cell line/highlight leaf)
            return d[key3]
        })
        .entries(data) //  Get data
    return nest //  Create nest
}



////////////////////////////////////////////////////////////////////////////////////
//  Move To Front/Back
////////////////////////////////////////////////////////////////////////////////////

//  Set up D3 prototype function for Move-to-Front
d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

//  Set up D3 prototype function for Move-to-Back
d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
        var firstChild = this.parentNode.firstChild;
        if (firstChild) {
            this.parentNode.insertBefore(this, firstChild);
        }
    });
};



////////////////////////////////////////////////////////////////////////////////////
//  Sunburst Scales
////////////////////////////////////////////////////////////////////////////////////

//  Create linear scale for X-axis (determines arc length, circumference around a circle)
var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

//  Create linear scale for X-axis (determines radius length, diameter of a circle)
var y = d3.scale.linear()
    .range([0, radius * 1.25]);

//  Creates variable for partitions that will become arcs that make up the sunburst viz
var partition = d3.layout.partition()
    .value(function (d) {
        return d.size;
        var size = d.size //  Size will determine how big each arc is
    });



////////////////////////////////////////////////////////////////////////////////////
//  Sunburst Functions: Arc Definition
////////////////////////////////////////////////////////////////////////////////////

//  Define arcs that will make up sunburst
var arc = d3.svg.arc()
    .startAngle(function (d) { //  Based on X-axis scale
        //  Start angle for arcs begins where previous arc ended
        return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
    })
    .endAngle(function (d) { //  Based on X-axis scale
        //  End angle for arcs is starting point plus size
        return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
    })
    .innerRadius(function (d) { //  Based on Y-axis scale
        if (d.depth != 3) {
            // Starts at 0, or where previous depth radius ends
            // Determine starting radius length for primary and secondary leaves
            return Math.max(0, y(d.y));
        } else {
            // Determine starting radius length for cell line outer leaf
            return Math.max(0, y(d.y) * .8);
        }
    })
    .outerRadius(function (d) { //  Based on Y-axis scale
        // y is determined by depth level
        // Set outer radius for root and primary leaf
        if (d.depth <= 1) {
            return Math.max(0, y(d.y + d.dy));
            // Set outer radius for secondary leaf
        } else if (d.depth == 2) {
            return Math.max(0, y(d.y + d.dy) * .8);
            // Set outer radius for outer highlight leaf
        } else if (d.depth == 3) {
            return Math.max(0, y(d.y + d.dy) * .7);
        }
    })
    .cornerRadius(4)



////////////////////////////////////////////////////////////////////////////////////
//  Sunburst Functions: Arc Transition Math
////////////////////////////////////////////////////////////////////////////////////

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



////////////////////////////////////////////////////////////////////////////////////
//  Functions for Radially Positioning Text and Dots
////////////////////////////////////////////////////////////////////////////////////

// Gets rotation angle for text in arcs around a circle
function computeTextRotation(d) {
    var ang = (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
    return (ang > 90) ? 180 + ang : ang;
}

// Offsets text below center 'back' button
var setLocationCenter = "translate(0, 45)"

// Gets location for the center of arcs and offsets based on radius/depth
function setLocation(d, offsetValue) {
    var rotation = computeTextRotation(d); //  Get rotation angle
    var x = arc.centroid(d)[0]; //  Find x center of arc
    var y = arc.centroid(d)[1]; //  Find y center of arc
    var offset = radius / offsetValue; //  Determines offset value based on input
    if (rotation > 90) {
        offset = offset * -1
    }
    var xOffset = x + (offset * Math.cos(Math.PI * rotation / 180)); //  calculate new x
    var yOffset = y + (offset * Math.sin(Math.PI * rotation / 180)); //  calculate new y
    //  Return D3 translate function
    return "translate(" + xOffset + "," + yOffset + ")rotate(" + rotation + ")";
}



////////////////////////////////////////////////////////////////////////////////////
//  Functions for Labeling Arcs
////////////////////////////////////////////////////////////////////////////////////

// Label as: "# thisName cell models"
function namePlusTextNumber(input) {
    return input.value + " " + input.name + " cell models"
}
// Truncating label, label as: "thisName (#)" or "(#) thisName" based on arc position
function namePlusParaNumber(input) {
    // Truncate string if longer than 13 characters, replace with ellipsis (...)
    var truncate;
    if (input.name.length > 13) {
        truncate = "..."
    } else {
        truncate = ""
    }
    if (input.depth != 1) { //  Labels for Subtype and Cell Line leaves
        if (computeTextRotation(input) > 90) {
            //  If arc is on left side of circle, put (#) first, then truncated name
            return "(" + input.value + ") " + input.name.substring(0, 13) + truncate;
        } else {
            //  If arc is on right side of circle, put name first, then (#)
            return input.name.substring(0, 13) + truncate + " (" + input.value + ")";
        }
    } else { //  Labels for Primary Disease, not truncated
        if (computeTextRotation(input) > 90) {
            //  If arc is on left side of circle, put (#) first, then truncated name
            return "(" + input.value + ") " + input.name;
        } else {
            //  If arc is on right side of circle, put name first, then (#)
            return input.name + " (" + input.value + ")";
        }
    }
}



////////////////////////////////////////////////////////////////////////////////////
//  Get Data from Google Sheet
////////////////////////////////////////////////////////////////////////////////////

queue()
    .defer(d3.csv, "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9k1hVV00IO1JMiPm2t4b6nt4Ro1831ytv6PsnDaVJW1JJyJoqn9DIR76zK3pUtsPRFlrsJJmAPQxY/pub?gid=0&single=true&output=csv", parse)
    //    .defer(d3.csv, "data/data_global_select.csv", parse) //Local data load
    .await(dataLoaded);

function parse(d) {
    return {
        arxspanID: d["Arxspan Registration ID (from DepMap models sheet)"],
        cellLineName: d["Stripped Cell Line Name"],
        cclfID: d["CCLF Publication ID (from DepMap models sheet)"],
        cclfPubID: d["cclfID (from DepMap models sheet/CCLF tableau)"],
        preliminaryDiagnosis: d["Preliminary Diagnosis (from DepMap models sheet)"],
        finalDiagnosis: d["Diagnosis (from CCLF tableau)"],
        primaryDisease: d["Primary Disease (Emily's annotation)"],
        Subtype: d["Subtype (Emily's annotation)"],
        NCIt: d["NCIt (Emily added by matching NCIt hierarchy to primary disease and subtype)"],
        tumorType: d["Primary, Metastatic, or Unknown"],
        effort: (d["Effort (Sample Derivation or Cell Line Onboarding)"]),
        subSource: d["Subsource (CCLF, Academic lab, Vendor, Sanger)"],
        sampleCollectionSite: d["Sample Collection Site"],
        age: d["Age"],
        cancerType: d["Pediatric/ Adult Common / Adult Rare"],
        WES: d["WES (yes/no/in progress)"],
        RNAseq: d["RNAseq (yes/no/ in progress)"],
        proteomics: d["Proteomics (yes/no)"],
        methylation: d["Methylation (yes/no)"],
        WGS: d["WGS (yes/no/in progress)"],
        pairedGermline: d["Paired germline (blood/ adjacent normal/ saliva/ no)"],
        pairedTumor: d["Paired tumor tissue (fluid/ tumor resection/ needle biopsy/ no)"],
        genomicTriad: d["Genomic Triad"],
        gender: d["Gender"],
        race: d["Race"],
        treatmentHistory: d["Treatment History"],
        cultureType: d["Culture Type"],
        cultureMedium: d["Culture Medium"]
    }
}


////////////////////////////////////////////////////////////////////////////////////
//  Checkbox Select
////////////////////////////////////////////////////////////////////////////////////



//function filterData(data) {
//    var filtData = data.filter(function (d) {
//        checkedArray.forEach(function (e) {
//            var filterField = e.split('_')[0]
//            var filterTarget = e.split('_')[1]
//            return d.filterField == filterTarget
//        })
//        //        return d.subSource == "CCLF"
//    })
//}


////////////////////////////////////////////////////////////////////////////////////
//  Load Data, Draw Sunburt, Draw Table
////////////////////////////////////////////////////////////////////////////////////

function dataLoaded(err, data) {

    var checkedArray = [];
    var filtData = [];
    $('input[type=checkbox]').click(function () {

        var filterTerm = this.value
        var filterField = filterTerm.split('_')[0]
        var filterValue = filterTerm.split('_')[1]

        if (this.checked) {
            checkedArray.push(filterTerm)
            console.log("added", checkedArray)

            data.forEach(function (d) {
                checkedArray.forEach(function (e) {
                    if (d[filterField] == filterValue) {
                        //                    console.log(d)
                        filtData.push(d)
                    }
                })
            })

        } else {
            for (var i = checkedArray.length - 1; i >= 0; i--) {
                if (checkedArray[i] === filterTerm) {
                    checkedArray.splice(i, 1);
                }
            }
            console.log("removed", checkedArray)
            data.forEach(function (d) {
                checkedArray.forEach(function (e) {
                    if (d[filterField] != filterValue) {
                        //                    console.log(d)
                        filtData.push(d)
                    }
                })
            })
        }





        console.log(filtData)
        //  Call makeNest function
        var nest = makeNest(filtData, "primaryDisease", "Subtype", "cellLineName")
        //  Create newData array
        var newData = [];
        //  Count
        nest.forEach(function (d) {
            d.initial_count = d.values.length;
            var fullCount = [];
            var Subtype = d.values;
            Subtype.forEach(function (e) {
                e.parent = d.key
                e.count = e.values.length;
                var cellLineName = e.values;
                cellLineName.forEach(function (f) {
                    f.parent = e.key
                    f.count = f.values.length;
                    fullCount.push(f.values.length)
                    newData.push({
                        sequence: d.key + ";;" + e.key + ";;" + f.key,
                        size: f.values.length,
                        values: f.values
                    })
                })
            })
            d.count = d3.sum(fullCount);
        })
        var sunData = buildHierarchy(newData)
        draw(sunData)
        makeTable(filtData)
    })
}



////////////////////////////////////////////////////////////////////////////////////
//  Hierarchy JSON Function
////////////////////////////////////////////////////////////////////////////////////

function buildHierarchy(csv) {
    var root = {
        "name": "root",
        "children": []
    };
    csv.forEach(function (d) {
        var sequence = d.sequence;
        var size = d.size;
        var parts = sequence.split(";;");
        var currentNode = root;
        for (var j = 0; j < parts.length; j++) {
            var children = currentNode["children"];
            var nodeName = parts[j];
            var childNode;
            if (j + 1 < parts.length) {
                var foundChild = false;
                for (var k = 0; k < children.length; k++) {
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                if (!foundChild) {
                    childNode = {
                        "name": nodeName,
                        "children": []
                    };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                childNode = {
                    "name": nodeName,
                    "size": size,
                    "info": d.values[0]
                };
                children.push(childNode);
            }
        }
    })
    return root;
    console.log(root);
    identifyDepth(root)
};



////////////////////////////////////////////////////////////////////////////////////
//  Make Table for Cell Lines
////////////////////////////////////////////////////////////////////////////////////

function makeTable(data) {

    $(document).ready(function () {
        $('#table_id').DataTable({
            data: data,
            columns: [
                {
                    data: 'cellLineName'
                },
                {
                    data: 'arxspanID'
                },
                {
                    data: 'subSource'
                },
                {
                    data: 'primaryDisease'
                },
                {
                    data: 'Subtype'
                },
                {
                    data: 'tumorType'
                },
                {
                    data: 'cancerType'
                },
                {
                    data: 'treatmentHistory'
                },
                {
                    data: 'gender'
                },
                {
                    data: 'age'
                },
                {
                    data: 'cultureType'
                },
                {
                    data: 'genomicTriad'
                },
                {
                    data: 'WGS'
                },
                {
                    data: 'WES'
                },
                {
                    data: 'RNAseq'
                },
                {
                    data: 'proteomics'
                },
                {
                    data: 'methylation'
                }
            ],
            scrollY: 500,
            deferRender: true,
            scroller: true,
            dom: 'Bfrtip',
            buttons: ['csv'],
            fixedHeader: true,
            responsive: true,
            search: true
        });
    });
}



////////////////////////////////////////////////////////////////////////////////////
//  Dots Selector
////////////////////////////////////////////////////////////////////////////////////

//  Default selection for dots on page load
var dotsField = "cultureType";
var dotsTarget = "3D";

//  Called in HTML when dot radio button is clicked, detect button and determine field and target
function dotClick() {
    //  Get value of selected radio button
    var dotSelection = document.querySelector('input[name=dotmarker]:checked').value;
    var field = dotSelection.split('_')[0] //  Get d.info field, eg. "Culture Type"
    var target = dotSelection.split('_')[1] //  Get d.info target eg. "3D organoid"
    // Set return values
    dotsField = field;
    dotsTarget = target;
    // Call function to update viz
    updateOuterDots()
}

//  Update the dots based on dotClick() returns
function updateOuterDots() {
    d3.selectAll(".outerDots")
        .style("stroke", function (d) {
            if (d.depth != 3) {
                return "none"
            } else if (d.info[dotsField] == dotsTarget) {
                return "red"
            }
        })
}



////////////////////////////////////////////////////////////////////////////////////
//  Highlighter Selector
////////////////////////////////////////////////////////////////////////////////////

//  Default selection for dots on page load
var highlightField = "subSource"
var highlightTarget = "CCLF"

//  Called in HTML when highlight radio button is clicked, detect button and determine field and target
function highlightClick() {
    //  Get value of selected radio button
    var highlightSelection = document.querySelector('input[name=highlighter]:checked').value;
    var field = highlightSelection.split('_')[0] //  Get d.info field, eg. "subSource"
    var target = highlightSelection.split('_')[1] //  Get d.info target eg. "CCLF"
    // Set return values
    highlightField = field;
    highlightTarget = target;
    // Call function to update viz
    updateOuterhighlight()

}

// Update outer highlight/cell model leaf based on highlightClick() returns
function updateOuterhighlight() {
    d3.selectAll("path")
        .style("opacity", function (e) {
            if (e.depth == 0) {
                return 0
            } else if (e.depth == 1) {
                return 0.1
            } else if (e.depth == 2) {
                return 1
            } else if (e.depth == 3) {
                if (e.info[highlightField] == highlightTarget) {
                    return 1
                } else {
                    return 0
                }
            }
        })
        .style("fill", function (d) {
            if (d.depth == 0) {
                return "white"
            } else if (d.depth == 1) {
                return colors[d.name]
            } else if (d.depth == 2) {
                return colors[(d.parent).name]
            } else if (d.depth == 3) {
                if (d.info[highlightField] == highlightTarget) {
                    return "orange"
                } else {
                    return "gainsboro"
                }
            };
        })
}



////////////////////////////////////////////////////////////////////////////////////
//  Draw Function
////////////////////////////////////////////////////////////////////////////////////

function draw(loadedData) {

    vis.append("svg:circle")
        .attr("r", radius)
        .style("fill", "none")

    var g = vis.selectAll("g")
        .data(partition.nodes(loadedData))
        .enter().append("g")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)



    ////////////////////////////////////////////////////////////////////////////////////
    //  Draw Sunburst Arc-Path
    ////////////////////////////////////////////////////////////////////////////////////

    var path = g.append("path")
        //        .attr("class", ".outerhighlight")
        .attr("d", arc)
        .on("click", click)
        .style("opacity", function (d) {
            if (d.depth == 0) {
                return 0
            } else if (d.depth == 1) {
                return 0.1
            } else if (d.depth == 2) {
                return 1
            } else if (d.depth == 3) {
                if (d.info[highlightField] == highlightTarget) {
                    return 1
                } else {
                    return 0
                }
            }
        })
        .style("fill", function (d) {
            if (d.depth == 0) {
                return "white"
            } else if (d.depth == 1) {
                return colors[d.name]
            } else if (d.depth == 2) {
                return colors[(d.parent).name]
            } else if (d.depth == 3) {
                if (d.info[highlightField] == highlightTarget) {
                    return "orange"
                } else {
                    return "gainsboro"
                }
            };
        })
        .style("stroke", "white")
        .style("stroke-width", 1)



    ////////////////////////////////////////////////////////////////////////////////////
    //  Add Dots
    ////////////////////////////////////////////////////////////////////////////////////

    var dots = g.append("circle")
        .attr("r", 4).attr("cx", 0).attr("cy", 0)
        .attr("transform", function (d) {
            return setLocation(d, 10)
        })
        .attr("class", "outerDots")
        .style("fill", "none")
        .style("stroke-width", 1)
        .style("stroke", function (d) {
            if (d.depth != 3) {
                return "none"
            } else if (d.info[dotsField] == dotsTarget) {
                return "red"
            }
        })



    ////////////////////////////////////////////////////////////////////////////////////
    //  Add Labels
    ////////////////////////////////////////////////////////////////////////////////////

    var text = g.append("text")
        .text(function (d) {
            if (d.depth == 1 && d.dx > 0.01) {
                return namePlusParaNumber(d)
            }
        })
        .attr("class", "labels-lg")
        .attr("dx", "0").attr("dy", ".35em")
        .attr("transform", function (d) {
            return setLocation(d, 7)
        })
        .attr("text-anchor", function (d) {
            if (computeTextRotation(d) > 90) {
                return "start"
            } else {
                return "end"
            };
        })
        .style("fill", function (d) {
            if (d.depth == 1) {
                return colors[d.name]
            };
        })



    ////////////////////////////////////////////////////////////////////////////////////
    //  Set up "Back" Text
    ////////////////////////////////////////////////////////////////////////////////////

    vis.append("text")
        .attr("id", "go-back")
        .html("Back")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("class", "labels-back")
        .style("opacity", 0)

    d3.select("#go-back").moveToFront()



    ////////////////////////////////////////////////////////////////////////////////////
    //  Mouse over
    ////////////////////////////////////////////////////////////////////////////////////

    function mouseover(d) {
        d3.select(this).select("path")
            .style("stroke-width",
                function (d) {
                    if (d.depth == 3) {
                        return 1
                    } else {
                        return 5
                    }
                })
            .style("stroke", "white")

        d3.select(this).moveToFront()

    }

    function mouseout(d) {
        d3.select(this).select("path")
            .style("stroke-width", 1)
            .style("stroke", "white")
    }



    ////////////////////////////////////////////////////////////////////////////////////
    //  Click
    ////////////////////////////////////////////////////////////////////////////////////

    function click(d) {

        console.log("clicked", d)

        var table = $('#table_id').DataTable();
        if (d.name != "root") {
            if (d.parent.name != "root") {
                table.search(d.parent.name + " \"  " + d.name + "  \"")
                    .draw()
            } else {
                table.search(d.name)
                    .draw()
            }
        } else {
            table.search("")
                .draw()
        }

        var isDepth = d.depth;



        ////////////////////////////////////////////////////////////////////////////////////
        //  Make "Back" Text Appear/Disappear
        ////////////////////////////////////////////////////////////////////////////////////

        if (isDepth != 0) {
            d3.select("#go-back").style("opacity", 1)
            d3.select("#go-back").moveToFront()
        } else {
            d3.select("#go-back").style("opacity", 0)
        }



        ////////////////////////////////////////////////////////////////////////////////////
        //  Labels and Dots Disappear During Transition
        ////////////////////////////////////////////////////////////////////////////////////

        var transTime = 1000
        text.transition().duration(transTime).attr("opacity", 0)
        dots.transition().duration(transTime).attr("opacity", 0)



        ////////////////////////////////////////////////////////////////////////////////////
        //  Re-Draw Sunburst Arc-Path
        ////////////////////////////////////////////////////////////////////////////////////

        path.transition().duration(transTime)
            .attrTween("d", arcTween(d))
            .style("opacity", function (e) {
                if (isDepth == 0) {
                    if (e.depth == 0) {
                        return 0
                    } else if (e.depth == 1) {
                        return 0.1
                    } else if (e.depth == 2) {
                        return 1
                    } else if (e.depth == 3) {
                        if (e.info[highlightField] == highlightTarget) {
                            return 1
                        } else {
                            return 0
                        }
                    }
                } else if (isDepth == 1) {
                    if (e.depth == 0) {
                        return 0
                    } else if (e.depth == 1) {
                        return .5
                    } else if (e.depth == 2) {
                        return 1
                    } else if (e.depth == 3) {
                        if (e.info[highlightField] == highlightTarget) {
                            return 1
                        }
                    }
                } else if (isDepth == 2) {
                    if (e.depth == 1) {
                        return 0
                    } else if (e.depth == 2) {
                        return 0.5
                    } else if (e.depth == 3) {
                        if (e.info[highlightField] == highlightTarget) {
                            return 1
                        }
                    }
                } else if (isDepth == 3) {
                    if (e.depth == 1) {
                        return 0
                    } else if (e.depth == 2) {
                        return 0.5
                    } else if (e.depth == 3) {
                        return 1
                    }
                }
            })
            .style("stroke", "white")
            .each("end", function (e, i) {
                if (e.x >= d.x && e.x < (d.x + d.dx)) {



                    ////////////////////////////////////////////////////////////////////////////////////
                    //  Re-draw Dots
                    ////////////////////////////////////////////////////////////////////////////////////

                    var clickDots = d3.select(this.parentNode).select("circle");
                    clickDots.transition().duration(transTime)
                        .attr("transform", function (f) {
                            if (isDepth == 0) {
                                return setLocation(f, 10)
                            } else if (isDepth == 1) {
                                return setLocation(f, 7)
                            } else if (isDepth == 2) {
                                return setLocation(f, 4.5)
                            } else if (isDepth == 3) {
                                return setLocation(f, 4.5)
                            }
                        })
                        .attr("opacity", 1)



                    ////////////////////////////////////////////////////////////////////////////////////
                    //  Re-draw Text
                    ////////////////////////////////////////////////////////////////////////////////////

                    var arcText = d3.select(this.parentNode).select("text");
                    arcText.transition().duration(transTime)
                        .text(function (f) {
                            if (isDepth == 0) {
                                if (f.depth == 1 && f.dx > 0.01) {
                                    return namePlusParaNumber(f)
                                }
                            } else if (isDepth == 1) {
                                if (f.depth == 1) {
                                    return namePlusTextNumber(f)
                                } else if (f.depth == 2) {
                                    return namePlusParaNumber(f)
                                }
                            } else if (isDepth == 2) {
                                if (f.depth == 2) {
                                    return namePlusTextNumber(f)
                                }
                                if (f.depth == 3) {
                                    return namePlusParaNumber(f)
                                }
                            } else if (isDepth == 3) {
                                if (f.depth == 3) {
                                    return f.name
                                }
                            }
                        })
                        .attr("opacity", 1)
                        .attr("transform", function (f) {
                            if (isDepth == 0) {
                                if (f.depth == 1) {
                                    return setLocation(f, 7)
                                }
                            } else if (isDepth == 1) {
                                if (f.depth == 1) {
                                    return setLocationCenter
                                } else if (f.depth == 2) {
                                    return setLocation(f, 10)
                                }
                            } else if (isDepth == 2) {
                                if (f.depth == 2) {
                                    return setLocationCenter
                                } else if (f.depth == 3) {
                                    return setLocation(f, 8)
                                }
                            } else if (isDepth == 3) {
                                return setLocationCenter
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
                        .style("fill", function (f) {
                            if (f.depth == 1) {
                                return colors[(f.children ? f : f.parent).name]
                            } else if (isDepth > 1 && f.depth == 2) {
                                return colors[(f.parent).name]
                            } else if (isDepth == 3 && f.depth == 3) {
                                return colors["White"]
                            }
                        })
                        .attr("class", function (f) {
                            if (isDepth == 0) {
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
            })
    }
}
