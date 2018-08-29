'use strict';

var fs = require('fs')
var path = require('path');
var tileReduce = require('@mapbox/tile-reduce');
var _ = require('lodash')
var tileCount = 0;

// what we're really missing here is the "WHEN" this happened

var mapScript = "map-milan-sample.js"

var featureCount = 0;
var buildingUsers = [];
var minorVersionUsers = [];
var namingRoads = {}

tileReduce({
    map: path.join(__dirname, mapScript),
    zoom: 15,
    sources: [{name: 'history', mbtiles: path.join("milan.mbtiles"), raw: false}],
    output: fs.createWriteStream('debug.log'),
    //bbox: [9.221473,45.475143,9.233775,45.481682]
})
.on('reduce', function(res){
  featureCount += res[0]
  buildingUsers = buildingUsers.concat( res[1] )
  minorVersionUsers = minorVersionUsers.concat( res[2] )

  Object.keys(res[3]).forEach(function(user){
    if (namingRoads.hasOwnProperty(user)){
      namingRoads[user] += res[3][user]
    }else{
      namingRoads[user] = res[3][user]
    }
  })

  tileCount++;
})
.on('end', function(){
  console.log(`Finished with ${featureCount} features across ${tileCount} tiles.`)
  console.log(_.countBy(buildingUsers))
  // console.log(_.countBy(minorVersionUsers))

  var usersWithCounts = []
  Object.keys(namingRoads).forEach(function(user){
    usersWithCounts.push([user, namingRoads[user]])
  })
  console.log(_.sortBy(usersWithCounts, function(x){return -x[1]}))

  // console.log(namingRoads)
})
