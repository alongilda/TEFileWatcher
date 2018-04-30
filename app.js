const express = require('express');
const fs = require('fs');
const chokidar = require('chokidar');
const dixiUpload = require('./dixiUpload');

global.config = require("./config.json");

console.log("Starting with config:\n", global.config);

// Listener on some folder..
var watcher = chokidar.watch(global.config.inFolder, {
    ignoreInitial: global.config.ignoreInitial, // Make this false to upload all things to begin with
})
watcher
    .on('add', filename => {
        dixiUpload.dixiUpload(filename);
    })
    .on('error', err => {
        console.error("Watcher err", err);
    })