let map = new Map();

yearSelector = d3.select('#year-slider')
  .append('svg')
  .attr('width', 600)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(50,40)')
  .attr('id', 'slider')
  ;

var slider = d3.sliderBottom()
  .min(2006)
  .max(2011)
  .width(400)
  .tickFormat(d3.format('1000'))
  .ticks(6)
  .step(1)
  .default(0.015)
  .on('onchange', (val) => {map.update(val)})
  ;

yearSelector.call(slider);

// slider = d3.select('#year-slider')
//   .append('input')
//   .attr('type', 'range')
//   .attr('min', 2006)
//   .attr('max', 2011)
//   .style('display', 'block')
//   .attr('id', 'slider')
//   .on('input', sliderChange)
//   ;

dropdownData = ['Opioid Purchases', 'Drug Overdoses', 'Temperature'];

dropdown = d3.select('#year-slider')
  .insert('select', 'svg')
  .on('change', (val) => {map.update(val)})
  .attr('align', 'right')
  ;

dropdown.selectAll('option')
  .data(dropdownData)
  .enter()
  .append('option')
  .attr('value', function(d) {return d})
  .text(function(d) {return d})
  ;
