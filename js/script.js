var selectedData = 'Opioid Purchases';
var selectedYear = 2006;
let map = new Map(selectedYear, selectedData);
let barchart = new Barcharts();

var yearSelector = d3.select('#year-slider')
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
  .on('onchange', (val) => {
    selectedYear = val;
    map.update(selectedYear, selectedData);
  })
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

// dropdownData = ['Opioid Purchases', 'Drug Overdoses', 'Temperature'];

// dropdown = d3.select('#year-slider')
//   .insert('select', 'svg')
//   .on('change', (val) => {
//     selectedData = val;
//     map.update(selectedYear, selectedData);
//   })
//   .attr('align', 'right')
//   ;

// dropdown.selectAll('option')
//   .data(dropdownData)
//   .enter()
//   .append('option')
//   .attr('value', function(d) {return d})
//   .text(function(d) {return d})
//   ;

d3.selectAll('input[name="switch-two"]')
  .on('change', function(){
    selectedData = this.value;
    map.update(selectedYear, selectedData);
  })
  ;
