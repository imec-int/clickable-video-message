var App = function (options){

	var handTime = 5.5;

	var $video = $("video");
	var video = $video[0];
	var $image = $('.blackbox .overlayimage');

	var init = function (){
		console.log("init");

		video.onended = onVideoEnded;
		video.ontimeupdate = onVideoTimeupdate;

		$('.yesimage').click(onVideoYesClick);
		$('.choice .yes').click(onChoiceYesClick);
		$('.choice .no').click(onChoiceNoClick);
	};

	var onVideoEnded = function (event) {
		$image.addClass('show');
	};

	var onVideoTimeupdate = function (event) {
		if(video.paused) return;

		var time = event.target.currentTime;
		if(time > handTime){
			$('body').addClass('showchoice');
		}else{
			$('body').removeClass('showchoice');
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

	var showThankyouMessage = function () {
		video.pause();
		$('body').addClass('showthankyou');
		$('body').removeClass('showchoice');
		$('body').addClass('hidevideo');
	};

	var showToobadMessage = function () {
		video.pause();
		$('body').addClass('showtoobad');
		$('body').removeClass('showchoice');
		$('body').addClass('hidevideo');
	};

	return {
		init: init
	};
};



$(function(){
	var app = new App();
	app.init();
});

