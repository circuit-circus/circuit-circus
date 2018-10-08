$(document).ready(function() {
	console.log('READY');
	$('nav a').click(function(e) {
		var thisId = $(this).attr('href');

    $([document.documentElement, document.body]).animate({
        scrollTop: $(thisId).offset().top
    }, 600);
		e.preventDefault();
	});
});