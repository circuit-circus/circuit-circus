var converter = new showdown.Converter();

// Set event listeners
$(document).ready(function () {

    // Find out which page we're on on load
    goToCurrentPage();

    // This is triggered when user uses back button
    window.onhashchange = function() {
        goToCurrentPage();
    }

    // Navigation in main menu
    $('.nav-item').on('click', function(event) {
        event.stopPropagation();
        var target = $(this).attr('data-target');

        goToPage(target, true, this);
    });

    $('body').on('click', '.projects-single-permalink', function() {
        var slug = $(this).attr('data-slug');
        getSingleProject(slug);
        showSingleProject();
    });

    $('body').on('mouseenter', '.projects-single-permalink', function() {
        var string = $(this).attr('data-name') + ' ';
        string = string.repeat(500);
        $('#background-container').html(string);
    });

    $('body').on('mouseleave', '.projects-single-permalink', function() {
        $('#background-container').html('');
    });
});

function goToCurrentPage() {
    var hash = window.location.hash;
    if(hash == '') {
        hash = "#home";
    }
    var currentPage = hash.substring(1, hash.length);

    if(currentPage.indexOf('projects/') === -1) {
        goToPage(currentPage, false);
    }
    else {
        var currentProject = currentPage.substring('projects/'.length, currentPage.length);
        goToPage('projects', false);
        getSingleProject(currentProject);
        showSingleProject();
    }
}

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
            insertProjectsData(data[target], target, targetSection);
        });
    }
}

// Insert projects data
function insertProjectsData(data, type, targetSection) {

    // TO DO : Add loading spinner or something

    console.log(data);

    data.forEach(function(element) {
        var article = $(targetSection).find('article.template').clone();
        var permalink = $(article).find('.projects-single-permalink').attr('href', '#' + type + '/' + element.fields.slug).text(element.fields.title).attr('data-slug', element.fields.slug).attr('data-name', element.fields.title);
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

function getSingleProject(slug) {
    $.ajax({
        url: '/projects/' + slug,
    }).done(function(data) {
        insertSingleProjectData(data);
    });
}

function insertSingleProjectData(data) {
    var project = $('.projects-single-template');
    project.find('.projects-single-title').text(data.project.fields.title);
    project.find('.projects-single-lead').text(data.project.fields.leadParagraph);
    var bodyHtml = converter.makeHtml(data.project.fields.bodyText);
    project.find('.projects-single-body').html(bodyHtml);
    project.removeClass('.projects-single-template').addClass('projects-single').attr('id', data.project.fields.slug);
    $('.projects-single-section .page-content').html(project).removeClass('not-loaded').addClass('loaded');
}

function showSingleProject() {
    $('.projects-single-section').addClass('active');
}