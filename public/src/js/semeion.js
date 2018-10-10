$(document).ready(function() {
	$('nav a').click(function(e) {
		var thisId = $(this).attr('href');

    $([document.documentElement, document.body]).animate({
        scrollTop: $(thisId).offset().top
    }, 600);
		e.preventDefault();
	});

	$('body').on('click', '.concept-video-container .video-wrapper video', function(e) {
	    e.preventDefault();
	    var vidElem = $(this).get(0);
	    if(vidElem.paused) {
	        vidElem.play();
	    }
	    else {
	        vidElem.pause();
	    }
	});
	$('body').on('click', '.concept-video-container .video-wrapper .mute', function(e) {
	    e.preventDefault();
	    var vidElem = $(this).siblings('video').get(0);
	    if(vidElem.muted) {
	        vidElem.muted = false;
	        $(this).addClass('unmuted').removeClass('muted');
	    }
	    else {
	        vidElem.muted = true;
	        $(this).addClass('muted').removeClass('unmuted');
	    }
	});
	$('body').on('click', '.concept-video-container .video-wrapper .fullscreen', function(e) {
	    e.preventDefault();
	    var vidElem = $(this).siblings('video').get(0);
	    if (vidElem.requestFullscreen) {
	        vidElem.requestFullscreen();
	    } else if (vidElem.mozRequestFullScreen) {
	        vidElem.mozRequestFullScreen();
	    } else if (vidElem.webkitRequestFullscreen) {
	        vidElem.webkitRequestFullscreen();
	    }
	});
});