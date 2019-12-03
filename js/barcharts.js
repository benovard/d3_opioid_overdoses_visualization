class Barcharts{
    constructor() {
        this.width = 480; 
        this.height = 360;

        this.county_svg = d3.select("body").select("#county_barchart")
            .attr("width", this.width)
            .attr("height", this.height)
        ;

        this.state_svg = d3.select("body").select("#state_barchart")
            .attr("width", this.width)
            .attr("height", this.height)
        ;

        d3.queue()
            .defer(d3.json, "data/data.json")
            .await((error, data) => {
                if (error) {
                    console.log("Uh oh: " + error);
                }
                else {
                    this.makeData(data);
                }
        });

        this.selection = 'deaths';
        this.county_list = [];

        this.barData = {};

    }

    sortByRank (data,key) {

        function sortMe (a, b,key) {
            if (a[1].Ranking[key] != undefined && b[1].Ranking[key] != undefined) {
                if (a[1].Ranking[key] > b[1].Ranking[key]) return 1;
                if (a[1].Ranking[key] == b[1].Ranking[key]) return 0;
                if (a[1].Ranking[key] < b[1].Ranking[key]) return -1;
            }
            if (a[1].Ranking[key] != undefined) {
                return 1;
            }
            if (b[1].Ranking[key] != undefined) {
                return -1;
            }
            if (a[1].Ranking[key] == undefined && b[1].Ranking[key] == undefined) {
                return 0;
            }
        }

        for (var i in data){
            if (data[i].Ranking[key] != undefined) {
                this.county_list.push([i, data[i]]);
            }
        }

        this.county_list.sort((a,b)=>sortMe(a,b,key));

    }

    makeData (data) {
        for (var county in data){
            this.barData[county] = {};
            for(var year in data[county]){
                if (year != 'fips') {
                    this.barData[county][year] = {
                        temperature: data[county][year].Temperature,
                        quantity: data[county][year].Quantity,
                        dosage_unit: data[county][year]['Dosage Unit'],
                        deaths: data[county][year]['Drug Overdoses'],
                        population: data[county][year].Population,
                        deathsPer100k: data[county][year]['Overdoses per 100k']
                    };
                } else {
                    this.barData[county]['fips'] = data[county].fips;
                }
            }
        }
        this.sortByRank(this.barData,this.selection);
    }

    drawCountyBarchart (selectedCounty, selectedData) {

        this.selection = selectedData;

        // remove the previous barchart
        this.county_svg.selectAll('*').remove();

        var countiesToDisplay = []; 

        for (var i in this.county_list){
            if (Math.abs(selectedCounty.properties.Ranking[this.selection] - this.county_list[i][1].Ranking[this.selection] ) <= 5) {
                countiesToDisplay.push(this.county_list[i]);
            }
        }

        const margin = { top: 20, right: 20, bottom: 20, left: 100};
        const innerWidth = this.width - margin.left - margin.right;
        const innerHeight = this.height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
            .domain([countiesToDisplay[10][1].Average[this.selection] - 1, countiesToDisplay[0][1].Average[this.selection]])
            .range([0, innerWidth])
        ;

        var list_of_counties = [];

        for (var i in countiesToDisplay){
            list_of_counties.push(countiesToDisplay[i][0])
        }

        const yScale = d3.scaleBand()
            .domain(list_of_counties)
            .range([0, innerHeight])
            .padding(0.1)
        ;

        const g = this.county_svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
        ;

        g.append('g').call(d3.axisLeft(yScale));
        g.append('g').call(d3.axisBottom(xScale))
            .attr('transform', `translate(0,${innerHeight})`) //this just puts the axis on the bottom
        ;

        g.selectAll('rect')
            .data(countiesToDisplay)
            .enter().append('rect')
            // .attr('x', 0)
            .attr('y', (d,i) => yScale(d[0]))
            .attr('width', (d,i) => xScale(d[1].Average[this.selection]))
            .attr('height', yScale.bandwidth())
        ;

        console.log(countiesToDisplay)
    }

    // drawStateBarchart (data) {

    //     console.log(data);

    //     // only these will need to change based upon which dataset we are displaying
    //     const xValue = d => d.Deaths;
    //     const yValue = d => d.State;

    //     const margin = { top: 20, right: 20, bottom: 20, left: 100};
    //     const innerWidth = this.width - margin.left - margin.right;
    //     const innerHeight = this.height - margin.top - margin.bottom;

    //     const xScale = d3.scaleLinear()
    //         .domain([0, d3.max(data, xValue)])
    //         .range([0, innerWidth])
    //     ;

    //     const yScale = d3.scaleBand()
    //         .domain(data.map(yValue))
    //         .range([0, innerHeight])
    //         .padding(0.1)
    //     ;

    //     const g = this.state_svg.append('g')
    //         .attr('transform', `translate(${margin.left},${margin.top})`)
    //     ;

    //     g.append('g').call(d3.axisLeft(yScale));
    //     g.append('g').call(d3.axisBottom(xScale))
    //         .attr('transform', `translate(0,${innerHeight})`) //this just puts the axis on the bottom
    //     ;


    //     g.selectAll('rect')
    //         .data(data)
    //         .enter().append('rect')
    //         .attr('y', d => yScale(yValue(d)))
    //         .attr('width', d => xScale(xValue(d)))
    //         .attr('height', yScale.bandwidth())

    // }





}

