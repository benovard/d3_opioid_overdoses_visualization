class Map{

    constructor(){
        this.width = 960; 
        this.height = 750;
        this.svg = d3.select("body").select("#map")
            .attr("width", this.width)
            .attr("height", this.height)
            ;
        this.map = this.svg.append("g")
            .attr("class", "map")
            ;

        d3.queue()
            .defer(d3.json, "data/topojson-counties.json")
            .defer(d3.json, "data/overdoses_2010.json")
            .await((error, us, data) => {
                if (error) {
                    console.log("Uh oh: " + error);
                }
                else {
                    this.drawMap(us, data)
                }
            });
    }

    drawMap (us, data) {

        console.log(data);

        var path = d3.geoPath();

        var color = d3.scaleThreshold()
            .domain([1, 10, 20, 30, 40, 50, 60, 70, 80, 90])
            .range(["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"]);
        
        var ext_color_domain = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
        var legend_labels = ["< 1", "10+", "20+", "30+", "40+", "50+", "60+", "70+", "80+", "90+"];

        var features = topojson.feature(us, us.objects.counties).features;
        var deathsById = {};

        data.forEach(function (d) {
            deathsById[d.County] = {
                deaths: +d.Deaths,
                population: +d.Population,
                deathsPerCap: +d['Death Rate per 100k']
            }
        });

        features.forEach(function (d) {
            d.details = deathsById[d.properties.name] ? deathsById[d.properties.name] : {};
        });

        this.map.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(features)
            .enter().append("path")
            .attr("d", path)
            .attr("name", function (d) {
                return d.properties.name;
            })
            .attr("id", function (d) {
                return d.id;
            })
            .style("fill", function (d) {
                return d.details && d.details.deathsPerCap ? color(d.details.deathsPerCap) : undefined;
            })
            .on('click', function (d) {

                d3.select(this)
                    .style("stroke", "white")
                    .style("stroke-width", 1)
                    .style("cursor", "pointer");
                
                d3.select(".county")
                    .text(d.properties.name);

                d3.select(".deaths")
                    .text(d.details && d.details.deaths && "Deaths: " + d.details.deaths);
                
                d3.select(".population")
                    .text(d.details && d.details.population && "Population: " + d.details.population);

                d3.select('.details')
                    .style('visibility', "visible")
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .style("stroke", null)
                    .style("stroke-width", 0.25);
                
                d3.select('.details')
                    .style('visibility', "hidden");
            })
        ;

        this.map.append("path")
            .attr("class", "county-borders")
            .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { 
                return a !== b; 
            })))
        ;

        var legend = this.svg.selectAll("g.legend")
            .data(ext_color_domain)
            .enter().append("g")
            .attr("class", "legend")
        ;
		 
        const ls_w = 96; // width of the map divided by 10 gives us 10 cells with a size of 96
        const ls_h = 20; // height of a cell for the legend
		 
		legend.append("rect")
            .attr("x", function(d, i) { 
                return 960 - (i*ls_w) - ls_w;
            })
            .attr("y", 680)
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function(d, i) { 
                return color(d); 
            })
            .style("opacity", 0.8)
        ;
		 
		legend.append("text")
            .attr("x", function(d, i){ return 960 - (i*ls_w) - ls_w;})
            .attr("y", 720)
            .text(function(d, i){ return legend_labels[i]; })
        ;

		var legend_title = "Number of deaths:";

		this.svg.append("text")
            .attr("x", 0)
            .attr("y", 670)
            .attr("class", "legend_title")
            .text(function() {
                return legend_title
            })
        ;

    };

    update(year){
        console.log(year);
    };

}