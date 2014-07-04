var App = function (options){

	var debug = false;

	var person = options.person;

	var handTime = null;
	var handTimeBeforeEnd = 5.5;

	var $video = $("video");
	var video = $video[0];
	var choiceVisible = false;

	var init = function (){
		if(debug) console.log("init");
		initHandlers();
		initOverlay();

		FastClick.attach(document.body);
	};

	var initHandlers = function () {

		// just show choice for the people who can't play html5 video:
		if(!canPlayHtml5Video()){
			showChoise();
		}

		$video.bind('loadedmetadata', onVideoLoadedmetadata);
		$video.bind('canplay', onVideoCanplay);
		$video.bind('timeupdate', onVideoTimeupdate);
		$video.bind('ended', onVideoEnded);
		$video.bind('webkitendfullscreen', onVideoEndFullscreen);

		$('.play').click(onPlayClicked);
	};

	var initOverlay = function () {

		// resize stuff:
		// we're doing this in javascript because the overlay-div should be on exact the same place as the video-element
		$(window).on("load resize orientationchange", function() {
			var videoratio = 1280/720;
			var maxvideoWidth = 860;

			// some 'responsiveness':
			if( $(window).width() < 1280){
				maxvideoWidth = 640;
			}


			var videoWidth = $(window).width();
			if(videoWidth>maxvideoWidth) videoWidth = maxvideoWidth;
			var videoheight = videoWidth/videoratio;

			// set dimensions video and overlay:
			$('video, .overlay').outerHeight( videoheight );
			$('video, .overlay').outerWidth( videoWidth );

			// center video and overlay:
			var x = ($(window).width() - videoWidth)/2;
			if(x < 0) x = 0;

			$('video').offset({ left: x});
			$('.overlay').offset({ left: x});

			// content (the horizontal gray bar) also follows height of video:
			$('.content').height( videoheight );

			// yesimage must always be square:
			$('.yesimage').height(  $('.yesimage').width() );

			// show content (if not shown):
			// that way, the video fades in AFTER all resizing is done
			// else you'll see some DOM-elements flickering around
			$('.content').addClass('show');
		});
	};

	var onVideoLoadedmetadata = function () {
		// set the time of the clickable hand based on the lenght of the video:
		handTime = video.duration - handTimeBeforeEnd;
	};

	var onVideoCanplay = function () {
		if(debug){
			// go straight to 2 seconds before the time the hand should appear:
			video.currentTime = handTime - 2;
		}
	};

	// when our own play button is clicked:
	var onPlayClicked = function (event) {
		if(debug) console.log('play clicked');
		hidePlay();
		video.play();
	};

	// happens every x seconds when the current position (time) of the video changes:
	var onVideoTimeupdate = function (event) {
		if(video.paused) return; // don't to things when the video is paused
		hidePlay(); // when autoplay is on, this makes sure the play-button is hidden

		if(!handTime) return;

		var time = event.target.currentTime;
		if(time > handTime){
			showChoise();
		}else{
			// this wil probably never happen because there are no controls:
			hideChoice();
		}
	};

	var onVideoEnded = function (event) {
		// on iPhone/iPad: close the external Quicktime player at the end of the video:
		if (typeof video.webkitExitFullscreen !== "undefined") {
			video.webkitExitFullscreen();
		}
	};

	var onVideoEndFullscreen = function (event) {
		// iPhone's a bitch, we have to remove the video for it to be clickable (replace it with an end image)
		if(isIphoneIpod()){
			showChoise();

			$('.endimage').addClass('show');
			// remove video after it's hidden:
			$('.endimage').one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () { // 'one' executes the function only once
				video.pause(); // just to make sure, can only happen in debugging
				$video.hide();
			});
		}
	};

	var onVideoYesClick = function (event) {
		showThankyouMessage();
		$.post('/rest/accept', {email: person.email, reference: 'hand click'}); // pass the reference of the click, so we can see if the use was smart enough to click the hand
	};

	var onChoiceYesClick = function (event) {
		showThankyouMessage();
		$.post('/rest/accept', {email: person.email, reference: 'text click'});
	};

	var onChoiceNoClick = function (event) {
		showToobadMessage();
		$.post('/rest/decline', {email: person.email});
	};

	var showChoise = function () {
		if(choiceVisible) return; // do this only once, else click handlers would be added more than once

		$('.choice').addClass('show');
		$('.yesimage').addClass('show');

		// add handlers here
		// so one can only click them from now on
		$('.yesimage').on('click', onVideoYesClick);
		$('.choice .yes').on('click', onChoiceYesClick);
		$('.choice .no').on('click', onChoiceNoClick);

		choiceVisible = true;
	};

	var hideChoice = function (callback) {
		$('.yesimage').off('click', onVideoYesClick);
		$('.choice .yes').off('click', onChoiceYesClick);
		$('.choice .no').off('click', onChoiceNoClick);

		$('.choice').removeClass('show');
		$('.yesimage').removeClass('show');

		$('.yesimage').one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () { // 'one' executes the function only once
			if(callback) callback();
		});

		choiceVisible = false;
	};

	var showThankyouMessage = function () {
		video.pause();

		$('.thankyou').addClass('show');
		// wait till choice is gone:
		hideChoice(function () {
			// wait some more to add dramatic effect :-)
			setTimeout(function () {
				$('.thankyou p').addClass('show');
			},400);
		});
	};

	var showToobadMessage = function () {
		video.pause();

		$('.toobad').addClass('show');
		// wait till choice is gone:
		hideChoice(function () {
			// wait some more to add dramatic effect :-)
			setTimeout(function () {
				$('.toobad p').addClass('show');
			},400);
		});
	};


	var hidePlay = function () {
		$('.play').addClass('hide'); //hide play icon
		$('.play').one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () { // 'one' executes the function only once
			$('.play').hide();
		});
	};

	var isIphoneIpod = function () {
		if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
			return true;
		}else{
			return false;
		}
	};

	var canPlayHtml5Video = function () {
		return (typeof(document.createElement('video').canPlayType) != 'undefined');
	};

	return {
		init: init
	};
};





