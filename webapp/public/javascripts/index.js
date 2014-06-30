var App = function (options){

	var handTime = 0.5;

	var $video = $("video");
	var video = $video[0];

	var init = function (){
		console.log("init");
		initHandlers();
		initOverlay();
	};

	var initHandlers = function () {
		$video.bind('timeupdate', onVideoTimeupdate);
		$video.bind('ended', onVideoEnded);
		$video.bind('webkitendfullscreen', onVideoEnded);

		$('.play').click(onPlayClicked);

		$('.yesimage').click(onVideoYesClick);
		$('.choice .yes').click(onChoiceYesClick);
		$('.choice .no').click(onChoiceNoClick);

		$video.on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', onVideoTransitionEnd);
	};

	var initOverlay = function () {
		var videoratio = 1280/720;
		var maxvideoWidth = 640;

		// resize stuff:
		$(window).on("load resize orientationchange", function() {
			var videoWidth = $(window).width();
			if(videoWidth>maxvideoWidth) videoWidth = maxvideoWidth;
			var videoheight = videoWidth/videoratio;



			$('video').outerHeight( videoheight );
			$('video').outerWidth( videoWidth );

			console.log(videoWidth);

			$('.overlay').outerHeight( videoheight );
			$('.overlay').outerWidth( videoWidth );

			// center video and overlay:
			var x = ($(window).width() - videoWidth)/2;
			if(x < 0) x = 0;

			$('video').offset({ left: x});
			$('.overlay').offset({ left: x});

			// content also follows height of video:
			$('.content').height( videoheight );

			// yesimage must always be square:
			$('.yesimage').height(  $('.yesimage').width() );
		});
	};


	var onPlayClicked = function (event) {
		video.play();
	};


	var onVideoTimeupdate = function (event) {
		if(video.paused) return;

		$('.play').hide();

		var time = event.target.currentTime;
		if(time > handTime){
			$('.choice').addClass('show');
			$('.yesimage').addClass('show');
		}else{
			$('.choice').removeClass('show');
			$('.yesimage').removeClass('show');
		}
	};

	var onVideoEnded = function (event) {

	};

	var onVideoTransitionEnd = function (event) {

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

	var showThankyouMessage = function () {
		video.pause();
		$('.thankyou').addClass('show');
		$('.choice').removeClass('show');
	};

	var showToobadMessage = function () {
		video.pause();
		$('.toobad').addClass('show');
		$('.choice').removeClass('show');
	};

	return {
		init: init
	};
};



$(function(){
	var app = new App();
	app.init();
});

