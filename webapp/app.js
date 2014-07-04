#!/usr/bin/env node

var express = require('express');
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport('sendmail');

var _ = require('underscore');

var config = require('./config');

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
	renderWrongId('none', res);
});

app.get('/:email', function (req, res){
	renderVideoMessage(req.params.email, res);
});

function renderVideoMessage (email, res) {
	var person = getPerson(email);
	if(!person) return renderWrongId(email, res);

	res.render('index', {
		title: "Een boodschap voor " + person.name,
		person: person,
		mp4: config.videoroot + person.video,
		ogg: config.videoroot + person.video.replace('.mp4', '.ogg'),
		webm: config.videoroot + person.video.replace('.mp4', '.webm')
	});
}

function renderWrongId (id, res) {
	res.render('wrongid', {
		id: id
	});
}

function getPerson (email) {
	email = decodeURIComponent(email);

	var person = _.find(config.people, function (person) {
		return person.email == email;
	});

	if(person) return person;

	// if person doesn't exist, create one on the fly:
	var person = _.clone(config.unkownperson);
	person.email = email;
	return person;
}

app.post('/rest/accept', function (req, res){
	var email = req.body.email;
	var reference = req.body.reference;

	var person = getPerson(email);
	if(!person){
		console.log(email + ' not found when accepting');
		return res.json('err');
	}

	console.log(person.name + ' ('+person.email+') accepts via ' + reference);

	sendAcceptanceMail(person, reference);

	sendConfirmationMail(person);

	res.json('ok');
});

app.post('/rest/decline', function (req, res){
	var email = req.body.email;

	var person = getPerson(email);
	if(!person){
		console.log(email + ' not found when declining');
		return res.json('err');
	}

	console.log(person.name + ' ('+person.email+') declines');
	sendDeclineMail(person);
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




function sendAcceptanceMail(person, reference){
	var mailoptions = {
		from    : person.name + " <"+person.email+">",
		to      : config.sendUserResponseTo,
		subject : "Videoboodschap: bevestiging van " + person.name,
		text    : person.name + " komt naar studio Media. Zeker eens bellen!\n\n("+reference+")\n"
	};
	// console.log(mailoptions);
	transport.sendMail(mailoptions);
}

function sendDeclineMail(person){
	var mailoptions = {
		from    : person.name + " <"+person.email+">",
		to      : config.sendUserResponseTo,
		subject : "Videoboodschap: " + person.name + "komt niet",
		text    : person.name + " komt niet, nog eens bellen?\n"
	};
	// console.log(mailoptions);
	transport.sendMail(mailoptions);
}


function sendConfirmationMail (person) {
	var txt = "";
	txt += "Hallo "+person.name+"\n";
	txt += "U heeft net uw interesse getoond om deel te nemen aan Studio Media 2020. Noteer alvast in uw agenda .\n";
	txt += "23 oktober (de Studio Media zelf zal 2 uur duren in de namiddag- exacte timinds tbc), Square Brussel - \n";
	txt += "\n";
	txt += "Wij nemen nog deze zomer contact met u op voor verdere details.\n";
	txt += "\n";
	txt += "Vriendelijke groeten,\n";
	txt += "\n";
	txt += "Martijn\n";


	var mailoptions = {
		from    : config.sendConfirmationFrom,
		to      : person.name + "<"+person.email+">",
		subject : "Bevestiging Studio Media 2020",
		text    : txt
	};
	// console.log(mailoptions);
	transport.sendMail(mailoptions);
}







