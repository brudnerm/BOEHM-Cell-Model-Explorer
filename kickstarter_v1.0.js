////////////////////////////////////////////////////////////////////////////////////
//  Set up SVG in DOM
////////////////////////////////////////////////////////////////////////////////////

var screenHeight = window.innerHeight;
var screenWidth = window.innerWidth;

var margin = {
        t: 0,
        l: 0,
        b: 0,
        r: 0
    },
    width = d3.select("#plot_ks").node().clientWidth - margin.l - margin.r,
    height = d3.select("#plot_ks").node().clientHeight - margin.t - margin.b;

var vis = d3.select("#plot")
    .append("svg")
    .attr("width", width + margin.l + margin.r)
    .attr("height", height + margin.t + margin.b)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var radius = Math.min(width, height) / 2;
// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;



////////////////////////////////////////////////////////////////////////////////////
//  Get Data from Google Sheet
////////////////////////////////////////////////////////////////////////////////////

queue()
    .defer(d3.csv, "data/test.csv", parse)
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
        cultureMedium: d["Culture Medium"],
        level: d["Level"]
    }
}



////////////////////////////////////////////////////////////////////////////////////
//  Load Data, Draw Sunburt, Draw Table
////////////////////////////////////////////////////////////////////////////////////

function dataLoaded(err, data) {

    makeTableTumors(data)
}





////////////////////////////////////////////////////////////////////////////////////
//  Make Table for Tumor
////////////////////////////////////////////////////////////////////////////////////

function makeTableTumors(data) {

    $(document).ready(function () {
        $('#table_tumors').DataTable({
            data: data,
            columns: [
                {
                    data: null
                },
                {
                    data: 'cellLineName'
                },
                {
                    data: 'primaryDisease'
                },
                {
                    data: 'Subtype'
                },
                {
                    data: 'level'
                },
                {
                    data: 'RNAseq'
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
                }
            ],
            //            scrollY: 325,
            deferRender: true,
            //            scroller: true,
            //            dom: 'Bfrtip',
            //            buttons: ['csv'],
            responsive: true,
            search: true,
            bSortClasses: false,
            columnDefs: [
                {
                    classname: "select-checkbox",
                    targets: 0,
                    checkboxes: {
                        selectRow: true
                    }
         },
                {
                    targets: 4,
                    render: function (data) {
                        // Progress Bar
                        //                        return '<td data-order="' + data + '"><progress value="' + data + '" max="5"></progress></td>'

                        // Custom Levels
                        return '<img src="images/step' + data + '.png" style="height:10px;width:100px;" />'
                    }
         }
      ],
            'select': {
                'style': 'multi'
            }
        });

        // Handle form submission event 
        $('#frm-example').on('submit', function (e) {
            var form = this;
            var rows_selected = table.column(0).checkboxes.selected();
            // Iterate over all selected checkboxes
            $.each(rows_selected, function (index, rowId) {
                // Create a hidden element 
                $(form).append(
                    $('<input>')
                    .attr('type', 'hidden')
                    .attr('name', 'id[]')
                    .val(rowId)
                );
            });

            // Output form data to a console     
            $('#example-console-rows').text(rows_selected.join(","));

            // Output form data to a console     
            $('#example-console-form').text($(form).serialize());

            // Remove added elements
            $('input[name="id\[\]"]', form).remove();

            // Prevent actual form submission
            e.preventDefault();

            console.log(form)
        });


        // Use Search Bar '#searchCellLines' to Filter Table
        var table_tumors = $('#table_tumors').DataTable();
        $('#searchTumors').keyup(function () {
            table_tumors.search($(this).val()).draw();
        });
    });
}
