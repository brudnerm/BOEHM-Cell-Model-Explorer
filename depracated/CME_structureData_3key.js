
function makeNest(data, key1, key2, key3){
    var nest = d3.nest()
        .key(function (d) {
            return d[key1]
        })
        .key(function (d) {
            return d[key2]
        })
        .key(function (d) {
            return d[key3]
        })
        .entries(data)
    
    return nest
    
}
