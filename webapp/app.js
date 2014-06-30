#!/usr/bin/env node

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport('sendmail');

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


function renderVideoMessage (name, res) {
	res.render('index', {
		title: "Een boodschap voor " + name,
		name: name,
		video: name+'.mp4'
	});
}

app.get('/', function (req, res){
	renderVideoMessage('Sam', res);
});

app.get('/:name', function (req, res){
	renderVideoMessage(req.params.name, res);
});


app.post('/rest/accept', function (req, res){
	var name = req.body.name;
	var reference = req.body.reference;

	console.log(name + ' accepts via ' + reference);
	sendAcceptanceMail(name, reference);
	res.json('ok');
});

app.post('/rest/decline', function (req, res){
	var name = req.body.name;

	console.log(name + ' declines');
	sendDeclineMail(name);
	res.json('ok');
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
	console.log(err);
	console.log(err.stack);
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




function sendAcceptanceMail(name, reference){
	var mailoptions = {
		from    : "Martijn's videoboodschap <videoboodschap@mixlab.be>",
		to      : "Sam Decrock <sam.decrock@iminds.be>",
		subject : "Videoboodschap: bevestiging van " + name,
		text    : name + " laat weten dat hij afkomt naar het verjaardagsfeestje van Martijn\n\n("+reference+")\n"
	};
	// console.log(mailoptions);
	transport.sendMail(mailoptions);
}

function sendDeclineMail(name){
	var mailoptions = {
		from    : "Martijn's videoboodschap <videoboodschap@mixlab.be>",
		to      : "Sam Decrock <sam.decrock@iminds.be>",
		subject : "Videoboodschap: " + name + "komt niet",
		text    : name + " laat weten dat hij geen zin heeft om af te komen. Wat een kieken!\n"
	};
	// console.log(mailoptions);
	transport.sendMail(mailoptions);
}







