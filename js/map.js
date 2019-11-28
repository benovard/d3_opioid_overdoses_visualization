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
                        population: this.data[county][year].Population
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

        console.log(this.features);

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
            .on('click', function (d) {
                d3.select(this)
                    .style('stroke', 'white')
                    .style('stroke-width', 1)
                    .style('cursor', 'pointer')
                    ;
                d3.select('.county')
                    .text(d.properties.long_name + ', ' + d.properties.state)
                    ;
                d3.select('.deaths')
                    .text(d.properties && d.properties.deaths && 'Deaths: ' + d.properties.deaths)
                    ;
                d3.select('.population')
                    .text(d.properties && d.properties.population && 'Population: ' + d.properties.population)
                    ;
                d3.select('.details')
                    .style('visibility', 'visible')
                    ;
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .style('stroke', null)
                    .style('stroke-width', 0.25)
                    ;
                d3.select('.details')
                    .style('visibility', 'hidden')
                    ;
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
