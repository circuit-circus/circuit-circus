$(document).ready(function(){console.log("READY"),$("nav a").click(function(t){var e=$(this).attr("href");$([document.documentElement,document.body]).animate({scrollTop:$(e).offset().top},600),t.preventDefault()})});