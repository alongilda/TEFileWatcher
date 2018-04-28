const express = require('express');
const fs = require('fs');
const chokidar = require('chokidar');

global.config = require("./config.json");
console.log(global.config);

// Listener on some folder..
var watcher = chokidar.watch(global.config.inFolder)
watcher.on('add', filename => {
    console.log("Filename has been add", filename);
})



// var fswatcher = fs.watch(global.config.inFolder)
// fswatcher.on('change', (eventType, filename) => {
//     console.log("Event type", eventType);
//     console.log("filename: ", filename );
// })

// fswatcher.on('error', (err) => {
//     console.error(err);
// })


// Callback server shit

// var callbackServer = express();
// callbackServer.post('/', function (req, res) {
//     console.log("This is req", req)
//     console.log(req.body)

//     res.sendStatus(200);
// });

// callbackServer.listen(4444);