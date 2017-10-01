// Set event listeners
$(document).ready(function () {

    // Check what page we're on
    var hash = window.location.hash;
    var currentPage = hash.substring(1, hash.length);
    goToPage(currentPage, false);

    $('nav a').on('click', function(event) {
        event.stopPropagation();
        var target = $(this).attr('data-target');

        goToPage(target, true);
    });
});

function goToPage(target, fromMenu) {
    var targetSection = $('section[data-id="' + target + '"]');
    var targetSectionNo = targetSection.attr('data-section-no');

    var transformTo = targetSectionNo + '00';

    // If it's either the projects or workshops page user is trying to navigate to, load these
    if( (target == 'projects' || target == 'workshops') && targetSection.hasClass('not-loaded')) {
        $.ajax({
            url: '/' + target,
        }).done(function(data) {
            insertData(data[target], target, targetSection);
        });
    }

    $('.page-container').css({'transform': 'translate(-' + transformTo + 'vw, 0)'});
    if(!fromMenu) {
        $('.page-container').css({'transition-duration': '1s'});
    }
}

// Insert projects or workshops data
function insertData(data, type, targetSection) {

    data.forEach(function(element) {
        var article = $(targetSection).find('article.template').clone();
        var permalink = $(article).find('a').attr('href', '#' + type + '/' + element.fields.slug).text(element.fields.title);
        $(article).find('h2').append(permalink);
        $(article).find('p.strong').text(element.fields.leadParagraph);
        $(article).removeClass('template');
        $(targetSection).find('.page-content').append(article);
    });

    targetSection.removeClass('not-loaded').addClass('loaded');
}