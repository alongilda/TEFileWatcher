const express = require('express');
const fs = require('fs');
const chokidar = require('chokidar');
const dixiUpload = require('./dixiUpload');
const winston = require('winston');

global.logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'app.log' }),
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});


global.config = require("./config.json");

global.logger.info("Starting with config: " + JSON.stringify(global.config));

// Listener on some folder..
var watcher = chokidar.watch(global.config.inFolder, {
    ignoreInitial: global.config.ignoreInitial, // Make this false to upload all things to begin with
})
watcher
    .on('add', filename => {
        setTimeout(() => {
            dixiUpload.dixiUpload(filename);
        }, 1000)
        
    })
    .on('error', err => {
        global.logger.error("Watcher err", err.stack);
    })