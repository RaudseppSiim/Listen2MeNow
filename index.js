const express = require('express')
const {
    exec
} = require("child_process");
const configs = require("./config.json")
const app = express()
var fs = require('fs');
var ffmpeg = require('ffmpeg');
const RtspServer = require('rtsp-streaming-server').default;
const port = 3000
const ytsearch = require('youtube-search');
// app.set('view engine', 'html');
var queue = [{
    song: "",
    videoName:"",
    sender: ""
}];
const server = new RtspServer({
    serverPort: 5554,
    clientPort: 6554,
    rtpPortStart: 10000,
    rtpPortCount: 10000
});
const opts = {
    maxResults: 10,
    key: configs.yt
};
var bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
app.get('/', (req, res) => {
    res.sendfile('./index.html');
});
app.get('/playlist',(req,res)=>{
    res.sendfile('./addsongs.html');
});
app.get('/songs', (req, res) => {
    res.statusCode = 200
    res.send(queue)
});
app.post('/search', (req, res) => {
    console.log(req.body.content)
    ytsearch(req.body.content, opts, function (err, results) {
        if (err) return console.log(err);

        for (var i = 0; i < 10; i++) {
            console.log(results.id[i])
        }
    });
});
app.delete('/song',(req,res)=>{
    var id=req.body.id
    queue.splice(id,1);
    console.lo
    res.send(queue)
});
app.post('/song', (req, res) => {
    addToQueue(req.body.content)
    res.statusCode = 200
    res.send(queue)
});

function addToQueue(search) {
    ytsearch(search, opts, function (err, results) {
        if (err) return console.log(err);
        queue.push({
            song: results[0].id,
            videoName:results[0].title,
            sender: "jorss"
        })
    });
}

async function run() {
    try {
        await server.start();

    } catch (e) {
        console.error(e);
    }
}

function letsFFthisshit() {
    try {
        new ffmpeg('./audio/Kidnap Reprise The New Pollutants.mpeg', function (err, video) {
            if (!err) {
                console.log('The video is ready to be processed');
                exec("ffmpeg -i ./audio/Kidnap Reprise The New Pollutants.mpeg -c:v copy -f rtsp rtsp://127.0.0.1:5554/stream1", (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            } else {
                console.log('Error: ' + err);
            }
        });
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
    }
}

//run();

app.listen(port,'0.0.0.0', () => console.log(`Example app listening at http://localhost:${port}`))