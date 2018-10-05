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
                       // Record the edge
        thisUser = version.properties['@user']

            if (version.properties['@version']>1){
              var key = `${thisUser},${prevUser}`
              if( key.indexOf('DaveHansenTiger')<0 ){
                if ( key.indexOf('bot') < 0){
                  if ( users.hasOwnProperty(key) ){
                    users[key] += 1
                  }else{
                    users[key] = 1
                  }
                }
              }
            }
        prevUser = thisUser;

          
        //How about geometries?
        if(feat.geometry.type=="LineString"){
          var len = turf.length(feat.geometry)
        }
          
        if (feat.geometry.type==="MultiPolygon" || feat.geometry.type==="Polygon"){
          var objArea = turf.area(feat.geometry)
        }
                  
        //attributes?
        var aA = []
        if ( version.properties.hasOwnProperty('aA') ){
          Object.keys(version.properties.aA).forEach(function(key){
            aA.push(key + "-->" + version.properties.aA[key].replace(/[\t\r\n]/g, " ")) 
          });
        }
          
        //attributes?
        var aM = []
        if ( version.properties.hasOwnProperty('aM') ){
          Object.keys(version.properties.aM).forEach(function(key){
            aM.push(key + "-->" + version.properties.aM[key][0].replace(/[\t\r\n]/g, " ")+"<-->"+version.properties.aM[key][1].replace(/[\t\r\n]/g, " ")) 
          });
        }
          
        //attributes?
        var aD = []
        if ( version.properties.hasOwnProperty('aD') ){
          Object.keys(version.properties.aD).forEach(function(key){
            aD.push(key + "-->" + version.properties.aD[key].replace(/[\t\r\n]/g, " ")) 
          });
        }

        
        //location?
        var center = {'geometry':{'coordinates':null}}
        try{
          center = turf.centroid(version.geometry);
        }catch(e){
            
        }
          
        var name;
        if (feat.properties.name){
          name = feat.properties.name.replace(/[\t\r\n]/g, " ")
        }
          
        var user;
        if (feat.properties['@user']){
          user = feat.properties['@user'].replace(/[\r\n]/g, " ");
        }
                                  
        //Write the row
        writeData(`${[
              feat.properties['@id'],
              feat.properties['@type'],
              feat.properties.amenity,
              feat.properties.highway,
              feat.properties.building,
              name,
              len,
              objArea,
              aA.join("|-|"),
              aM.join("|-|"),
              aD.join("|-|"),
              version.properties['@user'],
              version.properties['@version'],
              version.properties['@minorVersion'],
              version.properties['@validSince'],
              version.properties['@validUntil'],
              version.properties['@changeset'],
              center.geometry.coordinates || undefined
        ].join("\t")}\n`)
      }
    }
  });

  done(null, [users,0])
};