
function makeNest(data, key1, key2, key3, key4){
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
        .key(function (d) {
            return d[key4]
        })
        .entries(data)
    
    return nest
    
}
