// Set event listeners
$(document).ready(function () {
    $('nav a').on('click', function() {
        var target = $(this).attr('data-target');
        console.log(target);

        $.ajax({
            url: '/' + target,
        }).done(function(data) {
            console.log(data);
        });
    });
});
