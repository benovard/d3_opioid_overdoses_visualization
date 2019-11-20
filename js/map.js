var width = 960, height = 600;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
;

var path = d3.geoPath();

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
    if (error) throw error;

    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
    ;

    svg.append("path")
        .attr("class", "county-borders")
        .attr("d", path(topojson.mesh(us, us.objects.counties, function(a, b) { 
            return a !== b; 
        })))
    ;
});