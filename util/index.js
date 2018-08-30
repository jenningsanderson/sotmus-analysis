'use strict';

var fs = require('fs')
var path = require('path');
var tileReduce = require('@mapbox/tile-reduce');
var _ = require('lodash')

var mapScript = "map/map-building-stats.js"

var users = {}

tileReduce({
    map: path.join(__dirname, mapScript),
    zoom: 15,
    sources: [{name: 'history', mbtiles: path.join("../cities/detroit_historical.mbtiles"), raw: false}],
    output: fs.createWriteStream('buildings.data')
    //bbox: [-83.083364,42.338525,-83.030155,42.362908]
    //geojson: tasks.invalidated[1].geometries[1]
})
.on('reduce', function(res){
    Object.keys(res[0]).forEach(function(key){
        if ( users.hasOwnProperty(key) ){
            users[key] += res[0][key]
        }else{
            users[key] = res[0][key]
        }
    })
})
.on('end', function(){
    var userStream = fs.createWriteStream('users.edgelist');
    Object.keys(users).forEach(function(key){
        userStream.write(`${key},${users[key]}\n`);
    })
})
