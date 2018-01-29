var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());
app.use('/', express.static(path.join(__dirname, 'public')));
app.get('/favorites', function (req, res, next) {
    var data = fs.readFileSync('./data.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
})

app.post('/favorites', function (req, res, next) {
    if (!req.body.Title || !req.body.imdbID) {
        res.send("Error");
        return;
    }
    var data = JSON.parse(fs.readFileSync('./data.json'));
    var oid = req.body.imdbID;
    data[oid] = req.body;
    fs.writeFile('./data.json', JSON.stringify(data));
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
});

app.listen(3000, function () {
    console.log("Listening on port 3000");
});
