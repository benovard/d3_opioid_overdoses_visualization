class Map {
    constructor(year, data) {
        this.us;
        this.data;
        d3.queue()
            .defer(d3.json, 'data/topojson-counties.json')
            .defer(d3.json, 'data/data.json')
            .await((error, us, data) => {
                if (error) {
                    console.log('Uh oh: ' + error);
                }
                else {
                    this.us = us;
                    this.data = data;
                    this.drawMap()
                }
            });

        this.width = 960; 
        this.height = 750;
        this.svg = d3.select('body').select('#map')
            .attr('width', this.width)
            .attr('height', this.height);

        this.map = this.svg.append('g')
            .attr('class', 'map');

        this.year = String(year);
        this.selectedData = data;
        this.mapData = {};

        this.path = d3.geoPath();
    }

    drawMap() {
        const ls_w = 96; // width of the map divided by 10 gives us 10 cells with a size of 96
        const ls_h = 20; // height of a cell for the legend
        var ext_color_domain = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
        var ext_color_range = ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b']
        var legend_labels = ['< 1', '10+', '20+', '30+', '40+', '50+', '60+', '70+', '80+', '90+'];

        // use a scaleLinear instead maybe?
        // this.colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0,maxSelectedValue]);
        // or better yet if the value passed to colorScale is undefined, it is maybe a light red
        this.colorScale = d3.scaleThreshold()
            .domain(ext_color_domain)
            .range(ext_color_range);

        this.features = topojson.feature(this.us, this.us.objects.counties).features;

        // create mapData from data
        for (var county in this.data){
            this.mapData[county] = {};
            for(var year in this.data[county]){
                if (year != 'fips') {
                    this.mapData[county][year] = {
                        temperature: this.data[county][year].Temperature,
                        quantity: this.data[county][year].Quantity,
                        dosage_unit: this.data[county][year]['Dosage Unit'],
                        deaths: this.data[county][year]['Drug Overdoses'],
                        population: this.data[county][year].Population,
                        deathsPer100k: this.data[county][year]['Overdoses per 100k']
                    };
                } else {
                    this.mapData[county]['fips'] = this.data[county].fips;
                }
            }
        }
        console.log(this.mapData);

        // match names in topojson and data
        this.features.forEach(d => {
            var temp = this.mapData[d.properties.id] ? this.mapData[d.properties.id] : {};
            d.properties = {...d.properties, ...temp};
        });

        this.map.call(d3.zoom().on('zoom', () => {
            console.log('zoom');
            this.map.attr('transform', d3.event.transform);
        }));

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opactiy", 0)
        ;

        this.map.append('g')
            .attr('class', 'counties')
            .selectAll('path')
            .data(this.features)
            .enter()
            .append('path')
            .attr('d', this.path)
            .attr('id', function (d) {
                return d.properties.id;
            })
            .style('fill', (d) => {
                return d.properties[this.year] && d.properties[this.year][this.selectedData] ? this.colorScale(d.properties[this.year][this.selectedData]) : undefined;
            })
            .on('click', (d) => {
                var thisCounty = d.properties[this.year];
                var thisCountyAvg = d.properties['Average'];
                console.log(d)
                d3.select('.county')
                    .text(d.properties.long_name + ', ' + d.properties.state)
                ;
                d3.select('.deaths')
                    .text(thisCounty.deaths == undefined ? 'Deaths: No Data' : 'Deaths: ' + thisCounty.deaths)
                ;
                d3.select('.population')
                    .text(thisCounty.population == undefined ? 'Population: No Data' : 'Population: ' + thisCounty.population)
                ;
                d3.select('.prescriptions')
                    .text(thisCounty.quantity == undefined ? 'Total Prescriptions: No Data' : 'Total Prescriptions: ' + thisCounty.quantity)
                ;
                d3.select('.temp')
                    .text(thisCounty.temperature == undefined ? 'Average Temperature For The Year ' + this.year + ': No Data' : 'Average Temperature: ' + thisCounty.temperature + " °F")
                ;
                d3.select('#avg_label')
                    .text('Averages for the years 2006 - 2011: ')
                ;
                d3.select('.avg_pop')
                    .text(thisCountyAvg.population == undefined ? 'Population: No Data' : 'Population: ' + thisCountyAvg.population)
                ;
                d3.select('.avg_deaths')
                    .text(thisCountyAvg.deaths == undefined ? 'Deaths: No Data' : 'Deaths: ' + thisCountyAvg.deaths)
                ;
                d3.select('.avg_prescriptions')
                    .text(thisCountyAvg.quantity == undefined ? 'Prescriptions: No Data' : 'Prescriptions: ' + thisCountyAvg.quantity)
                ;
                d3.select('.avg_temp')
                    .text(thisCountyAvg.temperature == undefined ? 'Temperature: No Data' : 'Temperature: ' + thisCountyAvg.temperature + " °F")
                ;
            })
            .on('mouseover', (d) => {
                // d3.select(this)
                //     .style('stroke', 'white')
                //     .style('stroke-width', 2.5)
                //     .style('cursor', 'pointer')
                // ;
                
                var tooltipData = "";
                if (this.selectedData == 'deaths'){
                    if(d.properties[this.year].deaths == undefined) tooltipData = `Total Overdoses: No Data`;
                    else tooltipData = `Total Overdoses: ${d.properties[this.year].deaths}`;
                }
                else if (this.selectedData == 'quantity'){
                    if(d.properties[this.year].quantity == undefined) tooltipData = `Total Prescriptions: No Data`;
                    else tooltipData = `Total Prescriptions: ${d.properties[this.year].quantity}`;
                } 
                else if (this.selectedData == 'temperature'){
                    if(d.properties[this.year].temperature == undefined) tooltipData = `Average Temperature: No Data`;
                    else tooltipData = `Average Temperature: ${d.properties[this.year].temperature} °F`;
                } 
                else if (this.selectedData == 'deathsPer100k'){
                    if(d.properties[this.year].deathsPer100k == undefined) tooltipData = `Overdoses Per 100k: No Data`;
                    else tooltipData = `Overdoses Per 100k: ${d.properties[this.year].deathsPer100k.toFixed(2)}`;
                } 

                tooltip.transition()    
                    .duration(200)    
                    .style("opacity", .9)
                ;    
                tooltip.html(d.properties.long_name + 
                             '<br>' + tooltipData)  
                    .style("left", (d3.event.pageX) + "px")   
                    .style("top", (d3.event.pageY - 28) + "px")
                ;  
            })
            .on('mouseout', (d) => {
                // d3.select(this)
                //     .style('stroke', null)
                //     .style('stroke-width', 0.25)
                // ;
                tooltip.transition()    
                    .duration(500)    
                    .style("opacity", 0);
            })
        ;
        
        this.map.append('path')
            .attr('class', 'county-borders')
            .attr('d', this.path(topojson.mesh(this.us, this.us.objects.counties, function(a, b) { 
                return a !== b; 
            })))
        ;

        var legend = this.svg.append('g').attr('class','legend');

        legend.selectAll('rect')
            .data(ext_color_domain)
            .enter()
            .append('rect')
            .attr('x',(d,i)=>960-(i*ls_w)-ls_w)
            .attr('y',680)
            .attr('width',ls_w)
            .attr('height',ls_h)
            .style('fill',(d,i)=>this.colorScale(d))
            .style('opacity',0.8)
        ;

		legend.selectAll('text')
            .data(ext_color_domain)
            .enter()
            .append('text')
            .attr('x', function(d, i){ return 960 - (i*ls_w) - ls_w;})
            .attr('y', 720)
            .text(function(d, i){ return legend_labels[i]; })
        ;

		var legend_title = 'Number of deaths:';
        legend.append('text')
            .attr('x',0)
            .attr('y',670)
            .attr('class','legend_title')
            .text(legend_title)
        ;

    };

    // updates the map when data is changed
    update(year, data){
        this.year = String(year);
        this.selectedData = data;

        this.map.select('.counties')
            .selectAll('path')
            .style('fill', (d) => {
                return d.properties[this.year] && d.properties[this.year][this.selectedData] ? this.colorScale(d.properties[this.year][this.selectedData]) : undefined;
            })
            ;
    };

}
