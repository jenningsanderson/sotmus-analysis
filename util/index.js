'use strict';

var fs = require('fs')
var path = require('path');
var tileReduce = require('@mapbox/tile-reduce');
var _ = require('lodash')

var mapScript = "map/map-building-stats.js"

var sums = []

var trackingStats = [
    'tileCount',
    'buildings',
    'buildingHeights'
]
for(var i in trackingStats){
  sums.push(0)
}

tileReduce({
    map: path.join(__dirname, mapScript),
    zoom: 15,
    sources: [{name: 'history', mbtiles: path.join("../cities/detroit_historical.mbtiles"), raw: false}],
    output: fs.createWriteStream('buildings.data')
    //bbox: [-83.083364,42.338525,-83.030155,42.362908]
    //geojson: tasks.invalidated[1].geometries[1]
})
.on('reduce', function(res){
  for(var i=0; i<res.length; i++){
    sums[i] += res[i]
  }
})
.on('end', function(){
  for(var i=0; i<sums.length; i++){
    console.log(`${trackingStats[i]}:     ${sums[i]}`)
  }
})
