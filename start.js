var nodemon = require('nodemon');

var options = {
    script: 'app.js',
    watch: ['app.js', 'dixiUpload.js']
};

startNodemon();

function startNodemon() {
    var nodemonInstance = nodemon(options)
    
    .on('start', function () {
        console.log('[*] nodemon started\n-------------------------------------------------------------');
    })

    .on('crash', function (code) {
        console.log('----------------------------crash----------------------------');
        setTimeout(function () {

            delete nodemonInstance;
            startNodemon();

            console.log('[*] Restarted');
        }, 5000);
    });
}

