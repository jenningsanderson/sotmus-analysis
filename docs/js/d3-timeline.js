function createD3Timeline(params, brushEvent){

  params.docID = params.docID || "timeline-svg"

  var svg = d3.select("#"+params.docID),
      margin = {top: 10, right: 20, bottom: 20, left: 50},
      width  = + svg.attr("width")  - margin.left - margin.right,
      height = + svg.attr("height") - margin.top  - margin.bottom;

  var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x),
      yAxis = d3.axisLeft(y)
        .ticks(4);

  var brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("brush end", brushed);

  var area = d3.area()
      .curve(d3.curveMonotoneX)
      .x(function(d) { return x(d.date); })
      .y0(height)
      .y1(function(d) { return y(d.count); });

  svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

  var focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //var context = svg.append("g")
  //    .attr("class", "context")
  //    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var data = params.data //Or something else?

  var maxDate = params.maxDate || d3.max(data, function(d) { return d.date; })
  var minDate = params.minDate || d3.min(data, function(d) { return d.date; })

  x.domain([minDate, maxDate]);
  y.domain([0, d3.max(data, function(d) { return d.count; })]);

  focus.append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area);

  focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

  focus.append("g")
    .attr("class", "brush")
    .call(brush)
    //.call(brush.move, x.range()); // highlight everything by default

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

    if (d3.event.sourceEvent.type == 'mouseup'){
      var s = d3.event.selection || x.range();
      var brushRange = s.map(x.invert, x)
      brushEvent(brushRange)
    }
  }

  //var zoom = d3.zoom()
  //  .scaleExtent([1, 200])
  //  .translateExtent([[0, 0], [width, height]])
  //  .extent([0, 0], [width,height])
  //  .on("zoom", zoomed);

  //function zoomed() {
  //  console.log("ZOOMED")
  //  var t = d3.event.transform;
  //  console.warn(x.domain())
  //  //set the new domain
  //  x.domain(t.rescaleX(x).domain());
  //  console.warn(x.domain())
  //  focus.select(".axis--x").call(xAxis);
  //}

  ////This calls the zoom objects
  //var zoomRect = focus.append("rect")
  //  .attr("width", width)
  //  .attr("height", height)
  //  .attr("class", "zoomRect")
  //  .attr("fill", "none")
  //  .attr("pointer-events", "all")
  //  .call(zoom);

}
