
function draw(loadedData) {

    vis.append("svg:circle")
        .attr("r", radius)
        .style("fill", "none")

        var g = vis.selectAll("g")
            .data(partition.nodes(loadedData))
            .enter().append("g")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
        
        
        var path = g.append("path")
            .attr("d", arc)
            .on("click", click)
//            .on("mouseover", mouseover)
//            .on("mouseout", mouseout)
            .style("opacity", function(d) { 
                if (d.depth == 0) { return 0 }
                else if (d.depth == 1) { return 0.1 }
                else if(d.depth == 3 && d.info.subSource != "CCLF") { return 0 } ; })
            .style("fill", function (d) {
                if (d.depth == 0) { return "white" }
                else if (d.depth == 1) { return colors[d.name] }
                else if (d.depth == 2) { return colors[(d.parent).name] }
                else if (d.depth == 3) { 
                     if (d.info.subSource == "CCLF")  { return "orange" }
                     else { return "gray" } }; })
            .style("stroke", function (d) { 
                if(d.depth == 3 && d.info.subSource == "CCLF") { return "orange" }
                else { return "white" } } )
            .style("stroke-width", 1)
        
        var dots = g.append("circle")
            .attr("r", 4).attr("cx", 0).attr("cy", 0)
            .attr("transform", function(d) { return setLocation(d, 10) })
            .style("fill", "none")
            .style("stroke-width", 1)
            .style("stroke", function (d) {
                if (d.depth != 3) { return "none" }
                else if (d.info['RNAseq'] == "yes") { return "red"}  
                })
        
        var text = g.append("text")
            .text(function (d) { if (d.depth == 1 && d.dx > 0.01) { return namePlusParaNumber(d) } })
            .attr("class", "labels-lg")
            .attr("dx", "0").attr("dy", ".35em")
            .attr("transform", function(d) { return setLocation(d, 7) })
            .attr("text-anchor", function(d) { 
                if (computeTextRotation(d) > 90) {return "start"} 
                else { return "end" }; })
            .style("fill", function(d) { 
                if (d.depth == 1) { return colors[d.name] }; })
        
    function mouseover(d) {
        d3.select(this).select("path")
            .style("stroke-width", function (d) { 
                if(d.depth == 3 && d.info.subSource == "CCLF") { return 1 }
                else { return 5 } } )
            .style("stroke", function (d) { 
                if(d.depth == 3 && d.info.subSource == "CCLF") { return "orange" }
                else { return "white" } } )
        
        d3.select(this).moveToFront()
            
    }
    
    function mouseout(d) {
        d3.select(this).select("path")
            .style("stroke-width", 1)
            .style("stroke", function (d) { 
                if(d.depth == 3 && d.info.subSource == "CCLF") { return "orange" }
                else { return "white" } } )

    }
    
    function click(d) {
        console.log("clicked", d)
            
        var table = $('#table_id').DataTable();
            if (d.name != "root") {
                table.search(d.name)
                .draw() 
            }
            else {
                table.search("")
                .draw() 
            }
        
        var isDepth = identifyDepth(d);
        var transTime = 1000
        text.transition().duration(transTime).attr("opacity", 0)
        dots.transition().duration(transTime).attr("opacity", 0)
        path.transition().duration(transTime)
            .attrTween("d", arcTween(d))
            .style("opacity", function (e) {
                if (isDepth == 0) {
                    if (e.depth == 0) { return 0 } 
                        else if (e.depth == 1) { return 0.07 } 
                        else if (e.depth == 2) { return 1 } 
                        else if (e.depth == 3) {
                            if (e.info.subSource == "CCLF") { return 1 } 
                            else { return 0 } } } 
                else if (isDepth == 1) {
                    if (e.depth == 1) { return .5 } 
                    else if (e.depth == 2) { return 1 } 
                    else if (e.depth == 3) {
                        if (e.info.subSource == "CCLF") { return 1 } 
                        else { return .25 } } } 
                else if (isDepth == 2) {
                    if (e.depth == 1) { return 0 } 
                    else if (e.depth == 2) { return 0.5 } 
                    else if (e.depth == 3) {
                        if (e.info.subSource == "CCLF") { return 1 } 
                        else { return 0.25 } } } 
                else if (isDepth == 3) { 
                    if (e.depth == 1) { return 0 } 
                    else if (e.depth == 2) { return 0.5 } 
                    else if (e.depth == 3) {
                        if (e.info.subSource == "CCLF") { return 1 } 
                        else { return 0.25 } } } })
            .style("stroke", function(e) {
                if (isDepth == 0) { 
                    if(e.depth == 3 && e.info.subSource == "CCLF") { return "orange" }
                    else { return "white" } } 
                if (isDepth >= 0) { return "white" } })            
            .each("end", function(e, i) {
                if (e.x >= d.x && e.x < (d.x + d.dx)) {
                    var zoomDots = d3.select(this.parentNode).select("circle");
                        zoomDots.transition().duration(transTime)
                            .attr("transform", function(f) { 
                                if (isDepth == 0) { return setLocation(f, 10) }
                                else if(isDepth == 1) { return setLocation(f, 7) }
                                else if(isDepth == 2) { return setLocation(f, 4.5) }
                                else if(isDepth == 3) { return setLocation(f, 4.5) }
                                })
                            .attr("opacity", 1) 

                    var arcText = d3.select(this.parentNode).select("text");
                        arcText.transition().duration(transTime)
                            .text(function (f) {
                                if (isDepth == 0) {
                                    if (f.depth == 1 && f.dx > 0.01) { return namePlusParaNumber(f) } } 
                                else if (isDepth == 1) {
                                    if (f.depth == 1) { return namePlusTextNumber(f) }
                                    else if (f.depth == 2) { return namePlusParaNumber(f) } } 
                                else if (isDepth == 2) {
                                    if (f.depth == 2) { return namePlusTextNumber(f) }
                                    if (f.depth == 3) { return namePlusParaNumber(f) } } 
                                else if (isDepth == 3) {
                                    if (f.depth == 3) { return f.name } } } )
                            .attr("opacity", 1)
                            .attr("transform", function (f) {
                                if (isDepth == 0) {
                                    if (f.depth == 1) { return setLocation(f, 7) } } 
                                else if (isDepth == 1) {
                                    if (f.depth == 1) { return setLocationCenter } 
                                    else if (f.depth == 2) { return setLocation(f, 10) } } 
                                else if (isDepth == 2) { 
                                    if (f.depth == 2) { return setLocationCenter } 
                                    else if (f.depth == 3) { return setLocation(f, 8) } } 
                                else if (isDepth == 3) { return setLocationCenter } })
                            .attr("text-anchor", function (f) {
                                    if (isDepth == 0) {
                                        if (computeTextRotation(f) > 90) { return "start" } 
                                        else { return "end" } } 
                                    else if (isDepth == 1) {
                                        if (f.depth > 1) {
                                            if (computeTextRotation(f) > 90) { return "start" } 
                                            else { return "end" } } 
                                        else if (f.depth == 1) { return "middle" } } 
                                    else if (isDepth == 2) {
                                        if (f.depth == 2) { return "middle" } 
                                        else if (f.depth == 3) { 
                                            if (computeTextRotation(f) > 90) { return "start" } 
                                            else { return "end" } } } 
                                    else if (isDepth == 3) { return "middle" } })
                            .style("fill", function (f) {
                                    if (f.depth == 1) { return colors[(f.children ? f : f.parent).name] } 
                                    else if (isDepth > 1 && f.depth == 2) { return colors[(f.parent).name] } 
                                    else if (isDepth == 3 && f.depth == 3) { return colors["White"] } })
                            .attr("class", function (f) {
                                    if (isDepth == 0) { 
                                        if (f.depth == 1) { return "labels-lg" } } 
                                    else if (isDepth == 1) {
                                        if (f.depth == 1) { return "labels-extralg" } 
                                        else if (f.depth == 2) { return "labels-subtype" } 
                                        else if (f.depth == 3) { return "labels-cellLine" } } 
                                    else if (isDepth == 2) {
                                        if (f.depth == 2) { return "labels-extralg" } 
                                        else { return "labels-source" } } 
                                    else if (isDepth == 3) { return "labels-extralg" } }) 
                } }) 
    } 
} 

