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
    var targetSection = $('.page-section[data-id="' + target + '"]');
    if(!targetSection.length) {
        console.log('ERROR!!!!');
    }

    $('.page-section.active').removeClass('active');
    $('.page-section[data-id="' + target + '"]').addClass('active');

    $('.nav-item.active').removeClass('active');
    $('.nav-item[data-target="' + target + '"]').addClass('active');

    // If this is the projects page user is trying to navigate to, load these
    if( (target == 'projects') && targetSection.hasClass('not-loaded')) {
        $.ajax({
            url: '/' + target,
        }).done(function(data) {
            insertData(data[target], target, targetSection);
        });
    }
}

// Insert projects data
function insertData(data, type, targetSection) {

    data.forEach(function(element) {
        var article = $(targetSection).find('article.template').clone();
        var permalink = $(article).find('.projects-single-permalink').attr('href', '#' + type + '/' + element.fields.slug).text(element.fields.title);
        if(element.fields.coverMedia && element.fields.coverMedia.fields.file.url) { // Make better check
            $(article).find('.projects-single-cover-image').css('background-image', 'url(' + element.fields.coverMedia.fields.file.url + ')');
        }
        $(article).find('.projects-single-title').append(permalink);
        $(article).find('.projects-single-paragraph').text(element.fields.leadParagraph);
        $(article).removeClass('template');
        $(targetSection).find('.page-content').append(article);
    });

    targetSection.removeClass('not-loaded').addClass('loaded');
}