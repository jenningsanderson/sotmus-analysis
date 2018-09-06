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
//         yield [topojson.feature(hT,hT.objects[keys[i]]),i,keys.length];
    }
    return keys.length
}

module.exports = function(data, tile, writeData, done) {

  //Extract the osm layer from the mbtile
  var layer = data.history.historical_topojson;

  var featCount = 0;
   
  var users = {}

  layer.features.forEach(function(feat){

    featCount++;
      
    hG = historyGenerator(feat.properties['@history'])
            
      
    var done, version, vIt, newName, thisUser, prevUser
    while(!done){
      vIt     = hG.next();
      version = vIt.value
      done    = vIt.done
            
      if (!done){
                
//         // Record the edge
//         thisUser = version.properties['@user']
//         if (version.properties['@version']>1){
//           var key = `${thisUser},${prevUser}`
//           if ( users.hasOwnProperty(key) ){
//             users[key] += 1
//           }else{
//             users[key] = 1
//           }
//         }
//         prevUser = thisUser;
          
        //How about geometries?
        if(feat.geometry.type=="LineString"){
          var len = turf.length(feat.geometry)
        }
                  
        //attributes?        
        var tigerDel = []
        if ( version.properties.hasOwnProperty('aD') ){
          Object.keys(version.properties.aD).forEach(function(key){
            if(key.indexOf('tiger') > -1){
              tigerDel.push(key)
            }
          })
        }
          
        
        if (tigerDel.length>0){  
            //Write the row
            writeData(`${[
                  feat.properties['@id'],
                  feat.properties['@type'],
                  feat.properties.highway,
                  tigerDel.join(","),
                  len,
                  version.properties['@user'],
                  version.properties['@version'],
                  version.properties['@minorVersion'],
                  version.properties['@validSince'],
                  version.properties['@validUntil'],
                  JSON.stringify(version.geometry) || undefined
            ].join("\t")}\n`)
        }
      }
    }
  });

  done(null, [users,0])
};