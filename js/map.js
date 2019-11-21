var width = 960, height = 600;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
;

var map = svg.append("g")
    .attr("class", "map");


d3.queue()
    .defer(d3.json, "data/topojson-counties.json")
    .defer(d3.json, "data/overdoses_2010.json")
    .await(function (error, us, data) {
        if (error) {
            console.log("Uh oh: " + error);
        }
        else {
            drawMap(us, data)
        }
    });

function drawMap (us, data) {

    console.log(data);

    var path = d3.geoPath();

    var color = d3.scaleThreshold()
        .domain([1, 10, 20, 30, 40, 50, 60, 70, 80, 90])
        .range(["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"]);

    var features = topojson.feature(us, us.objects.counties).features;
    var deathsById = {};

    data.forEach(function (d) {
        deathsById[d.County] = {
            deaths: +d.Deaths,
            population: +d.Population,
        }
    });

    console.log(deathsById);

    features.forEach(function (d) {
        d.details = deathsById[d.properties.name] ? deathsById[d.properties.name] : {};
    });


    map.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(features)
        .enter().append("path")
        .attr("d", path)
        .attr("name", function (d) {
            // console.log(d.properties.name)
            console.log(d.properties)
            return d.properties.name;
        })
        .attr("id", function (d) {
            return d.id;
        })
        .style("fill", function (d) {
            return d.details && d.details.deaths ? color(d.details.deaths) : undefined;
        })
        .on('mouseover', function (d) {

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

    map.append("path")
        .attr("class", "county-borders")
        .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { 
            return a !== b; 
        })))
    ;


};