
projection = d3.geoConicConformal().scale(150).translate([400, 350]);

function drawMap(world){
  const geoJSON = topojson.feature(world, world.objects.countries).features;
  const geoGenerator = d3.geoPath().projection(this.projection);

  let map = d3.select('#map')
    .selectAll('path')
    .data(geoJSON)
    ;

  map.enter()
    .append('path')
    .attr('d', geoGenerator)
    .attr('class', 'counties')
    .attr('id', (d,i) => d.id)
    ;

  d3.select('#map')
    .append('path')
    .datum(d3.geoGraticule())
    .attr('class', 'grat')
    .attr('d', geoGenerator)
    .attr('opacity', 0.25)
    ;
}
