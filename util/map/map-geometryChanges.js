'use strict';
var _     = require('lodash');
var topojson = require('topojson');
var length = require("@turf/length")

/*
* This function rebuilds individual geometries from the topojson (unpacking)
*/
function rebuildGeometries(hT){
  var geometries = {}
  _.sortBy(Object.keys(hT.objects)).forEach(function(version){
    if (geometries.hasOwnProperty( hT.objects[version].properties['@version'] ) ){
      geometries[hT.objects[version].properties['@version']].push ( topojson.feature(hT, hT.objects[version]) )
    }else{
      geometries[hT.objects[version].properties['@version']] = [ topojson.feature(hT, hT.objects[version]) ]
    }
  })
  return geometries
}

module.exports = function(data, tile, writeData, done) {

  //Extract the osm layer from the mbtile
  var layer = data.history.topojsonhistory;

  layer.features.forEach(function(feat){

    // console.log(feat)

    if (feat.properties.hasOwnProperty('@history') ){
      //We have history!
      var hT = JSON.parse(feat.properties['@history']) //hT = historical topology

      console.error("--")
      var geoms = rebuildGeometries(hT);

      Object.keys(geoms).forEach(function(majorVersion){
        console.error(majorVersion)
        if ( geoms[majorVersion].length > 1 ){
          //We have a minor version
          console.error('MINOR')
          console.error(geoms)
          // console.error(geoms[majorVersion])
        }
      })

      writeData(JSON.stringify(feat)+"\n")

      //This line will become very common, this is how we iterate over historical topologies
      _.sortBy(Object.keys(hT.objects)).forEach(function(version){
        // console.log(version)
        // console.log(hT.objects[version].properties)

        if (hT.objects[version].hasOwnProperty('aD')){
          // console.log(hT.objects[version].aD)
        }
      })
    }else{

      //There is no history for this object...

    }

  //   var id   = feat.properties['@id']
  //   var t    = parseInt(feat.properties['@timestamp']) //This is in seconds since epoch (Not milliseconds)
  //
  //   // If the edit happened outside of *this* time window, skip it
  //   if (t < mapOptions.edits_greater_than_timestamp) return
  //
  //   if (mapOptions.analysis_year == 2016){
  //     if (t > Date.UTC(2017,0,1,0,0,0)/1000){return;}
  //   }
  //
  //   // If this way or relation has been processed, then skip it (Only relevant for pre-2016)...
  //   if (skipper.alreadyProcessed(id)) return;
  //
  //   var uid  = feat.properties['@uid']
  //
  //   tileSummary.versions_sum  += feat.properties['@version'];
  //   tileSummary.oCount += 1;
  //
  //   var dayOfEdit = Math.floor((t - mapOptions.edits_greater_than_timestamp)/86400)
  //
  //   //Tally the features at the user level. First create the user if they don't exist.
  //   if(!perTileUsers.hasOwnProperty(uid)){
  //     var name = feat.properties['@user']
  //     perTileUsers[uid] = new utils.objects.SimplePerTileContributer(quadkey, uid, name)
  //   }
  //
  //   perTileUsers[uid].editing_days.push(dayOfEdit)
  //   perTileUsers[uid].edits += 1;
  //
  //   if (feat.properties.highway && feat.geometry.type === "LineString"){
  //     perTileUsers[uid].road_km += turf.lineDistance(feat, "kilometers")
  //
  //   }else if (feat.properties.building){
  //     perTileUsers[uid].buildings += 1
  //   }
  //
  //   if (feat.properties.amenity){
  //     perTileUsers[uid].amenities += 1
  //   }
  });


  done(null, [0, 1])
};
