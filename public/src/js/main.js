// Set event listeners
$(document).ready(function () {

    // Check what page we're on
    var hash = window.location.hash;
    if(hash == "") {
        hash = "#home";
    }
    var currentPage = hash.substring(1, hash.length);
    goToPage(currentPage, false);

    $('.nav-item').on('click', function(event) {
        event.stopPropagation();
        var target = $(this).attr('data-target');

        goToPage(target, true, this);
    });
});

function goToPage(target, fromMenu) {
    var targetSection = $('section[data-id="' + target + '"]');
    if(!targetSection.length) {
        console.log('ERROR!!!!');
    }
    var targetSectionNo = targetSection.attr('data-section-no');

    var transformTo = targetSectionNo + '00';

    $('.nav-item.active').removeClass('active');
    console.log(target);
    $('.nav-item[data-target="' + target + '"]').addClass('active');

    // If this is the projects page user is trying to navigate to, load these
    if( (target == 'projects') && targetSection.hasClass('not-loaded')) {
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

// Insert projects data
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