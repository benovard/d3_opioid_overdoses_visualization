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
        .defer(d3.json, "data/county_barchart_test_data.json")
        .defer(d3.json, "data/data.json")
        .await((error, county_data, data) => {
            if (error) {
                console.log("Uh oh: " + error);
            }
            else {
                this.makeData(data)
                // this.drawCountyBarchart(county_data)
                // this.drawStateBarchart(data)
            }
        });

        this.selection = 'temperature';
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
            this.county_list.push([i, data[i]]);
        }
        this.county_list.sort((a,b)=>sortMe(a,b,key));
        console.log(this.county_list)
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

    drawCountyBarchart (data) {
        console.log('county',data)

        // only these will need to change based upon which dataset we are displaying
        const xValue = d => d.Deaths;
        const yValue = d => d.County;

        const margin = { top: 20, right: 20, bottom: 20, left: 100};
        const innerWidth = this.width - margin.left - margin.right;
        const innerHeight = this.height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, xValue)])
            .range([0, innerWidth])
        ;

        const yScale = d3.scaleBand()
            .domain(data.map(yValue))
            .range([0, innerHeight])
            .padding(0.1)
        ;

        const g = this.county_svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
        ;

        g.append('g').call(d3.axisLeft(yScale));
        g.append('g').call(d3.axisBottom(xScale))
            .attr('transform', `translate(0,${innerHeight})`) //this just buts the axis on the bottom
        ;


        g.selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('y', d => yScale(yValue(d)))
            .attr('width', d => xScale(xValue(d)))
            .attr('height', yScale.bandwidth())

    }

    drawStateBarchart (data) {



        console.log(data);

        // only these will need to change based upon which dataset we are displaying
        const xValue = d => d.Deaths;
        const yValue = d => d.State;

        const margin = { top: 20, right: 20, bottom: 20, left: 100};
        const innerWidth = this.width - margin.left - margin.right;
        const innerHeight = this.height - margin.top - margin.bottom;

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, xValue)])
            .range([0, innerWidth])
        ;

        const yScale = d3.scaleBand()
            .domain(data.map(yValue))
            .range([0, innerHeight])
            .padding(0.1)
        ;

        const g = this.state_svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
        ;

        g.append('g').call(d3.axisLeft(yScale));
        g.append('g').call(d3.axisBottom(xScale))
            .attr('transform', `translate(0,${innerHeight})`) //this just puts the axis on the bottom
        ;


        g.selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('y', d => yScale(yValue(d)))
            .attr('width', d => xScale(xValue(d)))
            .attr('height', yScale.bandwidth())

    }





}

