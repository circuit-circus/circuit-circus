// Set event listeners
$(document).ready(function () {
    $('nav a').on('click', function(event) {
        event.stopPropagation();
        var target = $(this).attr('data-target');
        var targetSection = $('section[data-id="' + target + '"]');
        var targetSectionNo = targetSection.attr('data-section-no');

        var transformTo = targetSectionNo + '00';

        console.log(transformTo);

        $('.page-container').css({'transform': 'translate(-' + transformTo + 'vw, 0)'});

        $.ajax({
            url: '/' + target,
        }).done(function(data) {
            console.log(data);
        });
    });
});
