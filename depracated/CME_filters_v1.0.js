    var checks = d3.select("#checkboxes").append("svg")
        .attr("width", 500)
        .attr("height", 150),
        checkBox1 = new d3CheckBox()

    //Just for demonstration
    var txt = svg
        .append("text")
        .attr("x", 10)
        .attr("y", 80)
        .text("Click checkboxes"),
        update = function () {
            var checked1 = checkBox1.checked()
            txt.text(checked1);
        };

    //Setting up each check box
    checkBox1
        .size(40)
        .x(10)
        .y(10)
        .markStrokeWidth(10)
        .boxStrokeWidth(4)
        .checked(true)
        .clickEvent(update);

    svg.call(checkBox1);