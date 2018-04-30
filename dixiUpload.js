// We need this to build our post string
const querystring = require('querystring');
const http = require('http');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');



function PostFile(filename, cb) {
    try {

        // The request is send via the url
        request_metadata = {
            category: "television",
            domain: "heb_gen",
            sample_rate: "16000",
            notify_url: null
        }
    
        var uri_data = querystring.stringify({
            request: JSON.stringify(request_metadata)
        })
    
        // Create a new form to upload
        var form = new FormData();
        form.append('file', fs.createReadStream(filename));
    
        var post_options = {
            host: global.config.serverIP,
            port: global.config.serverPort,
            path: '/speechboard_web_batch/rest/request/upload?' + uri_data,
            method: 'POST',
            headers: form.getHeaders()
        };
    
        req = http.request(post_options, () => { });
        form.pipe(req);
    
        req.on('response', (res) => {
            
            var fullData = []
    
            res.on('data', (chunk) => {
                // You can process streamed parts here...
                fullData.push(chunk);
            });
    
            res.on('end', () => {
                var body = Buffer.concat(fullData).toString('utf-8');
                cb(null, body)
            });
        });
    }
    
    catch (e) {
        cb(e, null)
    }

}

// Get request looks like thiscd
// http://hostname:8082/speechboard_web_batch/rest/request/result?request={"id":"1","format":"JSON"}
// only with the json converted to url like

function GetFile(id, cb) {
    var http = require('http');
    var get_data = querystring.stringify({
        request: JSON.stringify({
            id: id,
            format: 'JSON'
        })
    })

    var options = {
        host: global.config.serverIP,
        port: global.config.serverPort,
        path: '/speechboard_web_batch/rest/request/result?' + get_data
    };

    var req = http.get(options, function (res) {
        if (res.statusCode != 200) {
            return cb("http error " + res.statusCode, null);
        }

        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        res
            .on('data', function (chunk) {
                // You can process streamed parts here...
                bodyChunks.push(chunk);
            })
            .on('end', function () {
                var body = Buffer.concat(bodyChunks);
                cb(null, body)
            })
    });

    req.on('error', function (e) {
        global.logger.error('ERROR: ' + e.stack);
    });
}

function getPlainText(wordarr) {
    try {
        return (null, wordarr.map(val => val.word).join(" "));
    }
    
    catch (e) {
        return (e, null)
    }
}

function getOutFileName(filename) {
    return path.join(global.config.outFolder, path.basename(filename, path.extname(filename)) + ".txt")
}

function finalizeFile(filename, txt) {
    try {
        var outFileName = getOutFileName(filename)
        fs.writeFileSync(outFileName, txt);

        return null
    }

    catch (e) {
        return e
    }
}

function getWordArr(res) {
    try {
        var dRes = JSON.parse(res).result
        var dBody = JSON.parse(dRes);
        
        wordArr = []

        dBody.forEach((sentence) => {
            sStart = sentence['segment-start']
            
            sentence.result.hypotheses[0]['word-alignment'].forEach((word) => {
                let realStart = parseFloat(word.start) + parseFloat(sStart)

                wordArr.push({
                    word: word.word,
                    confidence: word.confidence,
                    start_time: realStart,
                    end_time: realStart + parseFloat(word.length)
                })
            })
        })

        return (null, wordArr)
    }

    catch (e) {
        return (e, null)
    }


}

function queryResult(id, cb) {
    var query_every = 1000 // 1s in ms
    var max_time = 1800000; // half an hour in ms

    var interval = setInterval(() => {

        GetFile(id, (err, res) => {
            if (err) {
                cb(err, null)
                return
            }

            try {
                body = res.toString('utf-8')
                json_body = JSON.parse(body)

                if (json_body.result == null) {
                    return
                } 

                cb(null, body)
                clearInterval(interval);
            }

            catch (e) {
                cb(err, null)
            }

        });

    }, query_every)

    setTimeout(() => {
        clearInterval(interval)
        cb("queryResult timeout", null);
    }, max_time)
}

// Main function
function upload(filename, EasyOrder, order) {
    global.logger.info("Starting upload with file " + filename);
    PostFile(filename, (err, id) => {
        if (err) {
            global.logger.error("[dixiUpload - upload] - PostFile err " + err.stack)
            return
        }

        global.logger.info("Starting to query result with id " + id + filename);
        
        queryResult(id, (err, res) => {
            global.logger.info("Succesfully queried result with id " + id + filename);

            if (err) {
                global.logger.error("[dixiUpload - upload] - queryResult err " + err.stack)
                return
            }

            var err, warr = getWordArr(body);
            if (err) {
                global.logger.error("[dixiUpload - upload] - getWordArr err " + err.stack)
                return
            }

            var err, plainText = getPlainText(warr)
            if (err) {
                global.logger.error("[dixiUpload - upload] - getPlainText err" + err.stack)
                return
            }

            var err = finalizeFile(filename, plainText)
            if (err) {
                global.logger.error("[dixiUpload - upload] - getPlainText err " +  err)
                return
            }

            global.logger.info("Finished succesufly for file " + filename);


        })

    });
}

// upload("/Users/alon/Documents/sample.wav")

module.exports = {dixiUpload : upload};