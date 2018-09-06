const milliseconds_in_a_day = (1000*60*60*24)

var startDate, endDate
var maxDate, minDate
var brushOn

var D3Timeline = function(brushEventFunction){
    
  var x,y,brush,data;
  
  var brushEvent = brushEventFunction;

  this.fireBrushEvent = function(range){
    brushEvent(range)
  };
    
  function drawBrush(){
    d3.select('.brush').transition().call(brush.move, [x(startDate), x(endDate)]);
    brushOn = true;
  }
    
  this.stepBrush = function(){
    var trail = true
    var outOfBounds = false;
    var step = Number( document.getElementById('stepVal').value ) 
    
    if ( (startDate.getTime() == minDate.getTime()) && (endDate.getTime() == maxDate.getTime()) ){
      console.log("Declaring new dates")
      endDate   = new Date(startDate.getTime() + data.length/10 * milliseconds_in_a_day)
      drawBrush();
      console.log(startDate, endDate)
    }
    
    startDate = new Date(startDate.getTime() + step * milliseconds_in_a_day)
    endDate   = new Date(endDate.getTime() + step * milliseconds_in_a_day)
      
    if (endDate > maxDate){
      endDate = maxDate
      outOfBounds = true;
    }
      
    if (startDate > maxDate){
      startDate = minDate
      brushEvent([startDate, endDate])
      return true
    }
    
    d3.select('.brush').transition().call(brush.move, [x(startDate), x(endDate)]);
    brushEvent([startDate, endDate])
    console.log("Stepped: "+step+" days | "+startDate + " - " + endDate)
      
    return outOfBounds;
  }
    
  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

    if (d3.event.sourceEvent != undefined){
        if (d3.event.sourceEvent.type == 'mouseup'){
          var s = d3.event.selection || x.range();
          var brushRange = s.map(x.invert, x)
          brushEvent(brushRange)
          startDate = brushRange[0]
          endDate   = brushRange[1]
        }

        if ( (startDate.getTime() == minDate.getTime()) && (endDate.getTime() == maxDate.getTime()) ){
          brushOn = false;
        }else{
          brushOn = true;
        }
    }
  }
    

  //Main constructor  
  this.createD3Timeline = function(params){
    params.docID = params.docID || "timeline-svg"
        
    var svg = d3.select("#"+params.docID),
        margin = {top: 10, right: 20, bottom: 20, left: 50},
        width  = + svg.attr("width")  - margin.left - margin.right,
        height = + svg.attr("height") - margin.top  - margin.bottom;
  
    //clear the existing canvas
    svg.selectAll("*").remove();
      
    x = d3.scaleTime().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);
      
    var xAxis = d3.axisBottom(x),
        yAxis = d3.axisLeft(y)
                  .ticks(4);

    brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("brush end", brushed);

    // var area = d3.area()
    //   .curve(d3.curveMonotoneX)
    //   .x(function(d) { return x(d.date); })
    //   .y0(height)
    //   .y1(function(d) { return y(d.count); });

    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    var focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data = params.data //Or something else?

    maxDate = d3.max(data, function(d) { return d.date; })
    minDate = d3.min(data, function(d) { return d.date; })

    x.domain([minDate, maxDate]);

    //max within the dates
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    var daysShown = ( maxDate.getTime() - minDate.getTime() ) / milliseconds_in_a_day
    var bandWidth = (width / daysShown)

    focus.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.date); })
      .attr("y", function(d) { return y(d.count); })
      .attr("width", bandWidth)
      .attr("height", function(d) { return height - y(d.count); });


    // focus.append("path")
    //   .datum(data)
    //   .attr("class", "area")
    //   .attr("d", area);

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
  
    if ( brushOn && ( (startDate > minDate ) || (endDate < maxDate) ) ){
      drawBrush();
    }else{
      startDate = minDate
      endDate   = maxDate
    }
  }
}


/*
Zoom stuff?
*/
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