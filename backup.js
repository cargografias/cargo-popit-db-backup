var Toolkit = require('popit-toolkit');
var fs = require('fs');
var Q = require('q');

function downloadCollection(toolkit, instanceName, collectionName) {
  return function(){
    return Q.promise(function(resolve, reject, notify) {

      console.log("LOADING", collectionName)

      toolkit.loadAllItems(collectionName).then(
        function(items) {
          try {
            items.sort(function(a, b) {
              return a.id > b.id ? 1 : -1
            })
            if("persons" == collectionName || "organizations" == collectionName){
              items.forEach(function(item){
                if(item.memberships) delete item.memberships;
              })
            }
            fs.writeFileSync('data/' + instanceName + '-' + collectionName + '.json', JSON.stringify(items, null, 2));
            console.log('wrote ' + collectionName + '', items.length)
            resolve();
          } catch (ex) {
            console.log('error', ex);
            reject();
          }
        },
        function(err) {
          console.log('error', err);
          reject();
        },
        function(progress) {
          notify(progress);
        }
      );
    });    
  }
}

function runBackup(instanceName) {

  var toolkit = Toolkit({
    host: instanceName + '.popit.mysociety.org'
  });

  Q.fcall(function() {})
  .then(downloadCollection(toolkit, instanceName, 'persons'))
  .then(downloadCollection(toolkit, instanceName, 'organizations'))
  .then(downloadCollection(toolkit, instanceName, 'memberships'))
  .done(function(){
    console.log("LISTO")
  });
  
}

function runProgram(argv) {
  if (argv.length != 3) {
    console.log("Usage: node backup.js <instanceName>")
  } else {
    var instanceName = argv[2];
    console.log("Instance: " + instanceName);
    runBackup(instanceName)
  }
}

runProgram(process.argv);