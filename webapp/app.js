#!/usr/bin/env node

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

// EXPRESS: BASE SETUP
// ==============================================
var app     = express();
var port    = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


// EXPRESS: ROUTES
// ==============================================

app.get('/', function (req, res){
	res.render('index', {
        title: "Een boodschap voor Sam",
        name: "Sam",
        video: 'sam.mp4'
    });
});



app.get('/:name', function (req, res){
    res.render('index', {
        title: "Een boodschap voor " + req.params.name,
        name: req.params.name,
        video: req.params.name+'.mp4'
    });
});


// EXPRESS: ERROR HANDLING
// ==============================================
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// EXPRESS: START THE SERVER
// ==============================================
var webserver = app.listen(port);
console.log('Express server listening on port ' + port);




