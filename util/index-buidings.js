'use strict';

var fs = require('fs')
var path = require('path');
var tileReduce = require('@mapbox/tile-reduce');
var _ = require('lodash')

var mapScript = "map/map-building-stats.js"

var file = "detroit"

var users = {}

tileReduce({
    map: path.join(__dirname, mapScript),
    zoom: 15,
    sources: [{name: 'history', mbtiles: path.join("/data/EXTRACTS/"+file+"_historical.mbtiles"), raw: false}],
    output: fs.createWriteStream('../data/'+file+'-building-stats.data')
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
    var userStream = fs.createWriteStream('../data/'+file+'-buildings.edgelist');
    Object.keys(users).forEach(function(key){
        userStream.write(`${key},${users[key]}\n`);
    })
})
