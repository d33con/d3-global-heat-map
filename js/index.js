// margins
var margin = {top: 20, right: 80, bottom: 50, left: 80},
    width = parseInt(d3.select('#map').style('width')),
    width = width - margin.left - margin.right,
    mapRatio = .35,
    height = width * mapRatio;

// array of months for the y-axis labels
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// colour buckets
var colours = ['#008080','#3c9986','#5fb28e','#83cb9a','#ace4ab','#def8c8','#ffe5d4','#ffb1b7','#f47e94','#dd4e6c','#ba213e','#8b0000'];

// scales
var xScale = d3.time.scale().range([0, width]),
    yScale = d3.scale.linear().range([0, height]),
    zScale = d3.scale.quantize().range(colours); // colour scale

// these control the size of the rectangles relative to the data
var xStep = 3.154e10, // 1 year in milliseconds
    yStep = 1;

// height of the individual rectangles
var rectHeight = height / 12;

// svg canvas
var svg = d3.select('#map').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); // sets the origin of the graph

// get the data
d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json', function(error, data) {
   if (error) throw error;

   // change year data to a date object
   data.monthlyVariance.forEach(function(d) {
     d.year = new Date(d.year.toString());
   });

   // the base temperature of the data (8.66)
   var baseTemp = data.baseTemperature;

   // calculate scale domains
   xScale.domain(d3.extent(data.monthlyVariance, function(d) { return d.year; }));
   yScale.domain(d3.extent(data.monthlyVariance, function(d) { return d.month; }));
   zScale.domain(d3.extent(data.monthlyVariance, function(d) { return d.variance + baseTemp; }));

   // Extend the x- and y-domain to fit the last bucket
   xScale.domain([xScale.domain()[0], +xScale.domain()[1] + xStep]);
   yScale.domain([yScale.domain()[0], +yScale.domain()[1] + yStep]);
  
    //tooltip
    var tooltip = d3.select("#map").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

   // draw the rectangles
   svg.selectAll('rect')
        .data(data.monthlyVariance)
      .enter().append('rect')
        .attr('x', function(d) { return xScale(d.year); })
        .attr('y', function(d) { return yScale(d.month); })
        .attr('width', xScale(xStep) - xScale(0))
        .attr('height', yScale(yStep) - yScale(0))
        .style('fill', function(d) { return zScale(d.variance + baseTemp); })
        // tooltip
        .on("mouseover", function(d) {
          
          // format data into proper items
          d.month = new Date(d.month.toString());
          var formatMonth = d3.time.format("%B");
          var formatYear = d3.time.format("%Y");

          var html = "<div><h4>" + formatMonth(d.month) + " " + formatYear(d.year) + "</h4>";
              html += "<h5>Temperature: " + (d.variance + baseTemp).toFixed(2) + "&degC</h5>";
              html += "<h6>Monthly Variance: " + d.variance + "</h6>";
              html += "</div>";
          tooltip.transition()
            .duration(500)
            .style("opacity", 0.95);
          tooltip.html(html)
            .style("left", (d3.event.pageX + 20) + "px")
            .style("top", (d3.event.pageY - 50) + "px")
        })
        .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
        });

  // legend
  var legend = d3.select('#map')
    .append('ul')
      .attr('class', 'list-inline');
  
  var keys = legend.selectAll('li.key')
    .data(zScale.range());
  
  keys.enter().append('li')
    .attr('class', 'key')
    .style('border-top-color', String)
    .text(function(d) {
        var r = zScale.invertExtent(d);
        return (r[0].toFixed(1));
    });

  // axes
  var xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickFormat(d3.time.format('%Y'));

  // add x-axis
  svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
    .append('text')
      .attr('class', 'x-text')
      .attr('x', width / 2)
      .attr('y', margin.bottom - 5)
      .attr('text-anchor', 'end')
      .text('Year');
  
  // add month labels to y-axis
  var monthLabels = svg.selectAll('.monthLabel')
      .data(months)
      .enter().append('text')
        .text(function(d) { return d; })
        .attr('x', 0)
        .attr('y', function(d, i) { return (i * rectHeight); })
        .style('text-anchor', 'middle')
        .attr('transform', 'translate(-' + margin.left / 4 + ',' + rectHeight / 1.75 + ')'); 
  

 });