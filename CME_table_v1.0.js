function makeTable(data, filter) {

    $(document).ready( function () {
    $('#table_id').DataTable( {
        data: data,
        columns: [
            { data: 'cellLineName' },
            { data: 'arxspanID' },
            { data: 'subSource' },
            { data: 'primaryDisease' },
            { data: 'Subtype' },
            { data: 'tumorType' },
            { data: 'cancerType' },
            { data: 'treatmentHistory' },
            { data: 'gender' },
            { data: 'age' },
            { data: 'cultureType' },
            { data: 'genomicTriad' },
            { data: 'WGS' },
            { data: 'WES' },
            { data: 'RNAseq' },
            { data: 'proteomics' },
            { data: 'methylation' }
            ],
        scrollY:        500,
        deferRender:    true,
        scroller:       true,
        dom: 'Bfrtip',
        buttons: ['csv'],
        fixedHeader: true,
        responsive: true,
        "search": { "search": filter }
        } );
    });
}