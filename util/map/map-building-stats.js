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

/*
    Reconstruct historical objects (generator style)
*/
function* historyGenerator(historyString){
    let hT = JSON.parse(historyString) //hT = historical topology
    let keys   = _.sortBy(Object.keys(hT.objects),function(v){return Number(v)});
    for (var i=0;i<keys.length; i++){
        yield topojson.feature(hT,hT.objects[keys[i]]);
//         yield [topojson.feature(hT,hT.objects[keys[i]]),i,keys.length];
    }
    return keys.length
}

/*
    Could consider making a "smart" feature object that could handle *much* of this?
*/


module.exports = function(data, tile, writeData, done) {

  //Extract the osm layer from the mbtile
  var layer = data.history.detroit_historical_geometries_topojsongeojsonseq;

  var featCount = 0;
  var buildings = 0;
  var buildingHeights = 0;

  layer.features.forEach(function(feat){

    featCount++;
    // console.log(feat)

    if (feat.properties.building && feat.properties.building != 'no'){
        
        buildings++;
        
        hG = historyGenerator(feat.properties['@history'])
            
        var done, version, vIt
        while(!done){
            vIt     = hG.next();
            version = vIt.value
            done    = vIt.done
            
            if (!done){
                
                writeData(`${[
                    feat.properties['@id'],
                    version.properties['@user'],
                    version.properties['@version'],
                    version.properties['@minorVersion'],
                    version.properties['@validSince'],
                    version.properties['@validUntil'],
                    version.geometry.type
                          ].join("\t")}\n`)
            }
            
        }
          
    }

  });

  done(null, [featCount, buildings, buildingHeights])
};
