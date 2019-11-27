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
        .defer(d3.json, "data/state_barchart_test_data.json")
        .await((error, county_data, state_data) => {
            if (error) {
                console.log("Uh oh: " + error);
            }
            else {
                this.drawCountyBarchart(county_data)
                this.drawStateBarchart(state_data)
            }
        });
    }

    drawCountyBarchart (data) {

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

