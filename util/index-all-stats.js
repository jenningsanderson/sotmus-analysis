'use strict';

var fs = require('fs')
var path = require('path');
var tileReduce = require('@mapbox/tile-reduce');
var _ = require('lodash')

var mapScript = "map/map-all-stats.js"

var default_file = "detroit_michigan"

var file = process.argv[2]
if (file==null){
    file = default_file;
}

var users = {}

console.warn(path.resolve('../data/',file+'-all-stats.data'));

tileReduce({
    map: path.join(__dirname, mapScript),
    zoom: 15,
    sources: [{name: 'history', mbtiles: path.join("../cities/detroit_historical.mbtiles"), raw: false}],
    output: fs.createWriteStream('../data/'+file+'-all-stats.data'),
//     bbox: [-83.287956,42.255192,-82.910439,42.450233]
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
    var userStream = fs.createWriteStream('../data/'+file+'-users.edgelist');
    Object.keys(users).forEach(function(key){
        userStream.write(`${key},${users[key]}\n`);
    })
})
