var _     = require('lodash');
var topojson = require('topojson');
var turf = require("@turf/turf");

/*
*    Reconstruct historical objects (generator style)
*    [ Could consider making a "smart" feature object that could handle *much* of this? ]
*/
function* historyGenerator(historyString){
    let hT = JSON.parse(historyString) //hT = historical topology
    let keys   = _.sortBy(Object.keys(hT.objects),function(v){return Number(v)});
    for (var i=0;i<keys.length; i++){
        yield topojson.feature(hT,hT.objects[keys[i]]);
    }
    return keys.length
}

module.exports = function(data, tile, writeData, done) {

  //Extract the osm layer from the mbtile
  var layer = data.history.historical_topojson;

  var featCount = 0;

  layer.features.forEach(function(feat){
      
    hG = historyGenerator(feat.properties['@history'])
            
    var done, version, vIt, newName, thisUser, prevUser
    while(!done){
      vIt     = hG.next();
      version = vIt.value
      done    = vIt.done
            
      if (!done){
                          
        //How about geometries?
        if(feat.geometry.type=="LineString"){
          var len = turf.length(feat.geometry)
        }
        if (feat.geometry.type==="MultiPolygon" || feat.geometry.type==="Polygon"){
          var objArea = turf.area(feat.geometry)
        }
          
        var aA=[]
        if (version.properties.hasOwnProperty('aA')){
          aA = []
          Object.keys(version.properties.aA).forEach(function(key){
            aA.push(key+"|"+version.properties.aA[key])
          })
        }
        var aD=[]
        if (version.properties.hasOwnProperty('aD')){
          aD = []
          Object.keys(version.properties.aD).forEach(function(key){
            aD.push(key+"|"+version.properties.aD[key])
          })
        }
        var aM=[]
        if (version.properties.hasOwnProperty('aM')){
          aM = []
          Object.keys(version.properties.aM).forEach(function(key){
            aM.push(key+"|"+version.properties.aM[key][0]+"-->"+version.properties.aM[key][1])
          })
        }
          
        var center
        try{
          center = turf.centroid(version.geometry);
        }catch(e){
        }
          
        //Write the row
        writeData(`${[
              feat.properties['@id'],
              feat.properties['@type'],
              feat.properties.highway,
              feat.properties.building,
              feat.properties.amenity,
              len,
              objArea,
              aA.join(","),
              aD.join(","),
              aM.join(","),
              version.properties['@user'],
              version.properties['@version'],
              version.properties['@minorVersion'],
              version.properties['@validSince'],
              version.properties['@validUntil'],
              center,
              JSON.stringify(version.geometry) || undefined
        ].join("\t")}\n`)
       
      }
    }
  });

  done(null,null)
};