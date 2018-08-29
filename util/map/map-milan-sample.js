'use strict';
var _     = require('lodash');
var topojson = require('topojson');
const turfLength = require("@turf/length")

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


function lookUpColor(userName){
  switch (userName) {
  case 'ilrobi':
    return '#FC49A3';
  case 'stanton':
    return '#CC66FF';
  case 'EdoM':
    return '#66CCFF';
  case 'ggranga':
    return '#66FFCC';
  case 'Cristian1989':
    return '#00FF00';
  case 'marco_camagni':
    return '#FFCC66';
  case 'AnyFile':
    return '#FF6666';
  case 'FedericoCozzi':
    return '#FF0000';
  case 'MC mapper':
    return '#FF8000';
  case 'frammm':
    return '#FFFF66';
  case 'adirricor':
    return '#00FFFF';
  case 'g195':
    return '#00FFFF';
  case 'kaitu':
    return '#00FFFF';
  case 'Niouta':
    return '#00FFFF';
  case 'ciclobby-onlus':
    return '#00FFFF';
  default:
    return 'pink'
  }
}

module.exports = function(data, tile, writeData, done) {

  var featureCount = 0;

  var buildingUsers = [];

  var minorVersionUsers = [];

  var namingRoads = {}

  //Extract the osm layer from the mbtile
  var layer = data.history.topojsonhistory;

  layer.features.forEach(function(feat){

    featureCount++

    // if (feat.properties['@id'] != 264617935 ) return;

    if (feat.properties.hasOwnProperty('@history') ){
      //We have history!
      var hT = JSON.parse(feat.properties['@history']) //hT = historical topology

      // console.error("--")

      //Dealing with geometries:
      /*
      var geoms = rebuildGeometries(hT);

      Object.keys(geoms).forEach(function(majorVersion){
        // console.error(majorVersion)
        // writeData(JSON.stringify(geoms[majorVersion][0])+"\n")
        // writeData(JSON.stringify(geoms[majorVersion][0].properties, null, 2))
        // console.error(majorVersion + " " + geoms[majorVersion][0].geometry.coordinates[0].length)
        if ( geoms[majorVersion].length > 1 ){
          //We have a minor version
          console.error('MINOR')
          for(var i=1; i<geoms[majorVersion].length; i++){
            // writeData(JSON.stringify(geoms[majorVersion][i])+"\n")
          }
          // console.error(geoms[majorVersion])
        }
      })
      */

      // writeData(JSON.stringify(feat)+"\n")

      //This line will become very common, this is how we iterate over historical topologies

      var counter = 0;

      var users = []

      _.sortBy(Object.keys(hT.objects),function(x){return Number(x)}).forEach(function(version){
        // console.log(version)
        // console.log(hT.objects[version].properties)

        //Let's build some tuples of who edits after who
        try{

          users.push(hT.objects[version].properties['@uid']);

          // writeData( `"${prevUser}" "${hT.objects[version].properties['@uid']}"\n`
          // if (hT.objects[version].properties['@minorVersion'] > 0){
          //   // counter++// minorVersionUsers.push(hT.objects[version].properties['@user'])
          //   // writeData(hT.objects[version].properties['@validSince']+"\n")
          //   var feature = topojson.feature(hT, hT.objects[version])
          //
          //   writeData(JSON.stringify(feature.geometry)+"\n")
          //
          // }
          // if (hT.objects[version].properties.highway && hT.objects[version].properties.hasOwnProperty('aA')) {
          //
          //   if (hT.objects[version].properties.aA.name){
            // var feature = topojson.feature(hT, hT.objects[version])

            // writeData(JSON.stringify(feature)+"\n")
          //     var length = (turfLength.default(feature))
          //
          //     // feature.properties.color = lookUpColor(feature.properties['@user'])
          //
          //     writeData(JSON.stringify(
          //       {'type':'Feature',
          //        'geometry':feature.geometry,
          //        'properties':{
          //          'color':lookUpColor(feature.properties['@user'])
          //        }
          //       })+"\n")
          //
          //     // if (feature.properties['@user'] == 'ofLatofLong'){
          //     //   console.error(feature)
          //     // }
          //
          //     if (namingRoads.hasOwnProperty(feature.properties['@user'])){
          //       namingRoads[feature.properties['@user']] += length;
          //     }else{
          //       namingRoads[feature.properties['@user']] = length;
          //     }
          //   }
          //
          //
          // }
          // if (){
          //   // writeData(JSON.stringify(hT.objects[version].properties.aM, null, 2)+"\n")
          //   if (hT.objects[version].properties.aM.hasOwnProperty("building")){
          //     if (hT.objects[version].properties.aM.building[0]=='yes'){
          //       buildingUsers.push(hT.objects[version].properties['@user'])
          //     }
          //   }
          // }

          // if (hT.objects[version].properties.hasOwnProperty('aM')){
            // counter++;
            // writeData(JSON.stringify(hT.objects[version].properties.aM, null, 2)+"\n")
            // if (hT.objects[version].properties.aM.hasOwnProperty("building")){
              // if (hT.objects[version].properties.aM.building[0]=='yes'){
                // buildingUsers.push(hT.objects[version].properties['@user'])
              // }
            // }
          // }

        }catch(e){
          console.error("eerr")
        }
      })
      // if (counter > 1){
      //   var newProps = []
      //   _.sortBy(Object.keys(hT.objects),function(x){return Number(x)}).forEach(function(version){
      //     newProps.push(hT.objects[version].properties)
      //   });
      //   feat.properties["@history"] = JSON.parse(feat.properties["@history"])
      //   // writeData(JSON.stringify(newProps,null,2)+"\n")

      writeData(JSON.stringify(
            {'type':'Feature',
             'geometry':feat.geometry,
             'properties':{
               'users':_.uniq(users).length/10
             }
            })+"\n")

    }else{

      //There is no history for this object...

      //Do we check for v1 information?

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


  done(null, [featureCount, buildingUsers, minorVersionUsers, namingRoads])
};
