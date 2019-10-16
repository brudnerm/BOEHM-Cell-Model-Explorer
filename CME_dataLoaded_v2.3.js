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

function dataLoaded(err, data) {
    var nest = makeNest(data, "primaryDisease", "Subtype", "cellLineName" )
    var newData = [];
        nest.forEach(function (d) {
        d.initial_count = d.values.length;
        var fullCount = [];
        var Subtype = d.values;
        Subtype.forEach(function (e) {
            e.parent = d.key
            e.count = e.values.length;
            var cellLineName = e.values;
            cellLineName.forEach(function(f){
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
    makeTable(data)
}


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
    identifyDepth(root)
};
