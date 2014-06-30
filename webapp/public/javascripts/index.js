var App = function (options){

	var handTime = 5.5;

	var $video = $("video");
	var video = $video[0];

	var init = function (){
		console.log("init");
		initHandlers();
		initOverlay();

		FastClick.attach(document.body);
	};

	var initHandlers = function () {
		$video.bind('timeupdate', onVideoTimeupdate);
		$video.bind('ended', onVideoEnded);
		$video.bind('webkitendfullscreen', onVideoEndFullscreen);

		$('.play').click(onPlayClicked);

		$('.yesimage').click(onVideoYesClick);
		$('.choice .yes').click(onChoiceYesClick);
		$('.choice .no').click(onChoiceNoClick);
	};

	var initOverlay = function () {
		var videoratio = 1280/720;
		var maxvideoWidth = 640;

		// resize stuff:
		$(window).on("load resize orientationchange", function() {
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

			// content also follows height of video:
			$('.content').height( videoheight );

			// yesimage must always be square:
			$('.yesimage').height(  $('.yesimage').width() );


			// show content (if not shown):
			$('.content').addClass('show');
		});
	};


	var onPlayClicked = function (event) {
		video.play();
	};


	var onVideoTimeupdate = function (event) {
		if(video.paused) return;
		$('.play').hide(); //hide play icon

		var time = event.target.currentTime;
		if(time > handTime){
			showChoise();
		}else{
			hideChoice();
		}
	};

	var onVideoEnded = function (event) {

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
	};

	var onChoiceYesClick = function (event) {
		showThankyouMessage();
	};

	var onChoiceNoClick = function (event) {
		showToobadMessage();
	};

	var showChoise = function () {
		$('.choice').addClass('show');
		$('.yesimage').addClass('show');
	};

	var hideChoice = function (callback) {
		$('.choice').removeClass('show');
		$('.yesimage').removeClass('show');

		$('.yesimage').one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () { // 'one' executes the function only once
			if(callback) callback();
		});
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

	var isIphoneIpod = function () {
		if((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
			return true;
		}else{
			return false;
		}
	};

	return {
		init: init
	};
};



$(function(){
	var app = new App();
	app.init();
});
