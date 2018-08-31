var _     = require('lodash');
var topojson = require('topojson');
var turf = require("@turf/turf")

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
  var buildings = 0;
  var buildingHeights = 0;
    
  var users = {}

  layer.features.forEach(function(feat){

    featCount++;

    if (feat.properties.building && feat.properties.building != 'no'){
        
        buildings++;
        
        hG = historyGenerator(feat.properties['@history'])
            
        var done, version, vIt, name, thisUser, prevUser
        while(!done){
            vIt     = hG.next();
            version = vIt.value
            done    = vIt.done
            
            if (!done){
                
                // Record the edge
                thisUser = version.properties['@user']
                if (version.properties['@version']>1){
                    var key = `${thisUser},${prevUser}`
                    
                    if ( users.hasOwnProperty(key) ){
                        users[key] += 1
                    }else{
                        users[key] = 1
                    }
                }
                prevUser = thisUser;
                
                
                //attributes
                if ( version.properties.hasOwnProperty('aA') ){
                  
                  if ( version.properties.aA.hasOwnProperty('name') ){
                    name = version.properties.aA.name
                  }
                }
                
//                 if ( version.properties.hasOwnProperty('aM') ){
//                   if ( version.properties.aM.hasOwnProperty('name') ){
//                     //
//                   }
//                 }
                
                //Write the row
                writeData(`${[
                    feat.properties['@id'],
                    version.properties['@user'],
                    version.properties['@version'],
                    version.properties['@minorVersion'],
                    version.properties['@validSince'],
                    version.properties['@validUntil'],
                    name
                          ].join("\t")}\n`)
            }
            
        }
    }
  });

  done(null, [users,0])
};
