#!/usr/bin/env node

var express = require('express');
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport('sendmail');

var videodata = require('./videodata');

// EXPRESS: BASE SETUP
// ==============================================
var app     = express();
var port    = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Only use logger for development environment
if (app.get('env') === 'development') {
	app.use(morgan('dev'));
}


// EXPRESS: ROUTES
// ==============================================

app.get('/', function (req, res){
	renderVideoMessage('sam', res);
});

app.get('/:id', function (req, res){
	renderVideoMessage(req.params.id, res);
});

function renderVideoMessage (id, res) {
	var person = videodata[id];
	if(!person) return renderWrongId(id, res);


	res.render('index', {
		title: "Een boodschap voor " + person.name,
		name: person.name,
		video: person.video
	});
}

function renderWrongId (id, res) {
	res.render('wrongid', {
		id: id
	});
}

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
		text    : name + " laat weten dat hij/zij afkomt naar het verjaardagsfeestje van Martijn\n\n("+reference+")\n"
	};
	// console.log(mailoptions);
	transport.sendMail(mailoptions);
}

function sendDeclineMail(name){
	var mailoptions = {
		from    : "Martijn's videoboodschap <videoboodschap@mixlab.be>",
		to      : "Sam Decrock <sam.decrock@iminds.be>",
		subject : "Videoboodschap: " + name + "komt niet",
		text    : name + " laat weten dat hij/zij geen zin heeft om af te komen. Wat een kieken!\n"
	};
	// console.log(mailoptions);
	transport.sendMail(mailoptions);
}







