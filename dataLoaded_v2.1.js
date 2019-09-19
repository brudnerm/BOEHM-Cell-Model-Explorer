// how to load and read data file
// d3.csv is a type that d3 knows
queue()
    .defer(d3.csv, "data/data_global_select.csv", parse)
    .await(dataLoaded);

function parse(d) {
    return {
        arxspanID: d["arxspanID"],
        cellLineName: d["cellLineName"],
        cclfID: d["cclfID"],
        cclfPubID: d["cclfPubID"],
        preliminaryDiagnosis: d["preliminaryDiagnosis"],
        finalDiagnosis: d["finalDiagnosis"],
        primaryDisease: d["primaryDisease"],
        Subtype: d["Subtype"],
        NCIt: d["NCIt"],
        tumorType: d["tumorType"],
        effort: (d["effort"]),
        subSource: d["Subsource"],
        sampleCollectionSite: d["sampleCollectionSite"],
        age: d["age"],
        cancerType: d["cancerType"],
        WES: d["WES"],
        RNAseq: d["RNAseq"],
        proteomics: d["proteomics"],
        methylation: d["methylation"],
        WGS: d["WGS"],
        pairedGermline: d["pairedGermline"],
        pairedTumor: d["pairedTumor"],
        genomicTriad: d["genomicTriad"],
        gender: d["gender"],
        race: d["race"],
        treatmentHistory: d["treatmentHistory"],
        cultureType: d["cultureType"],
        cultureMedium: d["cultureMedium"],
        depth: 4
    }
}

function dataLoaded(err, data) {

    // d3's nest function
    // we defined 2 levels of grouping (.key)
    
    var nest = makeNest(data, "primaryDisease", "Subtype", "subSource" )

    var newData = [];

        nest.forEach(function (d) {
        // d.key which is primaryDisease
        // d.values is a list of its Subtypes
        // console.log("d", d)

        d.initial_count = d.values.length;

        var fullCount = [];

        var Subtype = d.values;

        Subtype.forEach(function (e) {
            // this is just for show
            e.parent = d.key
            e.count = e.values.length;
            //fullCount.push(e.values.length)
  
            var subSource = e.values;
            
            subSource.forEach(function(f){
                
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
    
console.log("newData", newData)
    var sunData = buildHierarchy(newData)
console.log("sunData", sunData)
    draw(sunData)
}

// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {

    var root = {
        "name": "root",
        "children": []
    };

    csv.forEach(function (d) {

        var sequence = d.sequence;
        var size = d.size;
        
        // var size = +csv[i][1];
        // if (isNaN(size)) { 
        // e.g. if this is a header row
        //   continue;
        // }

        // parts is each item in the array (array is list of values between dashes)
        var parts = sequence.split(";;");

        var currentNode = root;
        for (var j = 0; j < parts.length; j++) {
            var children = currentNode["children"];
            var nodeName = parts[j];
            var childNode;
            if (j + 1 < parts.length) {
                // Not yet at the end of the sequence; move down the tree.
                var foundChild = false;
                for (var k = 0; k < children.length; k++) {
                    if (children[k]["name"] == nodeName) {
                        childNode = children[k];
                        foundChild = true;
                        break;
                    }
                }
                // If we don't already have a child node for this branch, create it.
                if (!foundChild) {
                    childNode = {
                        "name": nodeName,
                        "children": []
                    };
                    children.push(childNode);
                }
                currentNode = childNode;
            } else {
                // Reached the end of the sequence; create a leaf node.
                childNode = {
                    "name": nodeName,
                    "size": size,
                    "cellLines": d.values
                };
                children.push(childNode);
            }
        }
    })
    console.log("root", root)
    return root;
};
