var Service = require('node-windows').Service;
const path = require("path");

// Create a new service object
var svc = new Service({
  name:'Hot Folder',
  description: 'NodeJS in and out transcription engines folder',
  script: path.join(__dirname, 'start.js'),
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();