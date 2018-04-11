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

        toggleLoading(true);
        goToPage(target, true, this);
    });

    $('body').on('click', '.projects-item-permalink', function() {
        var slug = $(this).attr('data-slug');
        toggleLoading(true);
        getSingleProject(slug, showSingleProject);
    });

    $('body').on('mouseenter', '.projects-item-permalink', function() {
        var name = $(this).data('name');
        $('.background-container[data-name="' + name + '"]').addClass('active');
    });

    $('body').on('mouseleave', '.projects-item-permalink', function() {
        var name = $(this).data('name');
        $('.background-container[data-name="' + name + '"]').removeClass('active');
    });
});

function goToCurrentPage() {
    var hash = window.location.hash;
    if(hash == '') {
        hash = "#home";
    }
    var currentPage = hash.substring(1, hash.length);

    if(currentPage.indexOf('projects/') === -1) {
        toggleLoading(true);
        goToPage(currentPage, false);
    }
    else {
        var currentProject = currentPage.substring('projects/'.length, currentPage.length);
        toggleLoading(true);
        goToPage('projects', false);
        getSingleProject(currentProject, showSingleProject);
    }
}

function goToPage(target, fromMenu) {
    var targetSection = $('.page-section[data-id="' + target + '"]');
    if(!targetSection.length) {
        console.error('Error: Page Section length is ' + targetSection.length);
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
            // Sort projects
            var projectsData = data.projects.sort(compareProjectDates);
            insertProjectsData(projectsData, targetSection);
            toggleLoading(false);
        });
    }
    else {
        toggleLoading(false);
    }
}

// Insert projects data
function insertProjectsData(data, targetSection) {

    // TO DO : Add loading spinner or something

    // console.log(data);

    var bgContainer = $('.background-container');

    data.forEach(function(element) {
        var article = $(targetSection).find('article.template').clone();
        var permalink = $(article).find('.projects-item-permalink').attr('href', '#projects/' + element.fields.slug).attr('data-slug', element.fields.slug).attr('data-name', element.fields.title);
        if(element.fields.coverMedia && element.fields.coverMedia.fields.file.url) { // Make better check
            $(article).find('.projects-item-cover-image').css('background-image', 'url(' + element.fields.coverMedia.fields.file.url + '?w=1024)');
        }
        $(article).find('.projects-item-title').text(element.fields.title)
        $(article).find('.projects-item-paragraph').text(element.fields.leadParagraph);
        $(article).removeClass('template');
        $(targetSection).find('.page-content').append(article);

        var thisBgContainer = bgContainer.clone();
        thisBgContainer.attr('data-name', element.fields.title);
        var string = element.fields.title + ' '; // Convert to string
        string = string.repeat(200);
        thisBgContainer.html(string);
        bgContainer.after(thisBgContainer);
    });

    targetSection.removeClass('not-loaded').addClass('loaded');
}

function getSingleProject(slug, callback) {
    $.ajax({
        url: '/projects/' + slug,
    }).done(function(data) {
        insertSingleProjectData(data);
        toggleLoading(false);
        callback();
    });
}

function insertSingleProjectData(data) {
    var project = $('.projects-single-template').clone();
    project.find('.projects-single-title').text(data.project.fields.title);
    project.find('.projects-single-lead').text(data.project.fields.leadParagraph);

    var bodyHtml = converter.makeHtml(data.project.fields.bodyText);
    project.find('.projects-single-body').html(bodyHtml);

    $('.projects-single-section .projects-single-video-container').html(''); // Clear old videos before adding new one
    $('.projects-single-video-container video').off('click');
    $('.projects-single-video-container .mute').off('click');
    if(data.project.fields.video !== undefined && data.project.fields.video !== null && data.project.fields.video.length > 0) {
        var vidElem = $('.projects-single-video-container .video-wrapper');
        for(var i in data.project.fields.video) {
            var vidDat = data.project.fields.video[i];
            var newVid = vidElem.clone();
            newVid.find('video').attr('src', vidDat.fields.file.url);
            project.find('.projects-single-video-container').append(newVid);
            newVid.find('video').get(0).muted = true;
            newVid.removeClass('video-wrapper-template');
        }
    }

    $('body').on('click', '.projects-single-video-container .video-wrapper video', function(e) {
        e.preventDefault();
        var vidElem = $(this).get(0);
        if(vidElem.paused) {
            vidElem.play();
        }
        else {
            vidElem.pause();
        }
    });
    $('body').on('click', '.projects-single-video-container .video-wrapper .mute', function(e) {
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

    $('.projects-single-section .projects-single-img-container').html(''); // Clear old images before adding new one
    if(data.project.fields.gallery !== undefined && data.project.fields.gallery !== null && data.project.fields.gallery.length > 0) {
        var imgElem = $('<div class="projects-single-img"><img/></div>');
        for(var i in data.project.fields.gallery) {
            var imgDat = data.project.fields.gallery[i];
            var newImg = imgElem.clone();
            newImg.find('img').attr('src', imgDat.fields.file.url + '?w=1024');
            if(imgDat.fields.description && imgDat.fields.description.length > 0) {
                newImg.append($('<span class="projects-single-img-description"></span>').text(imgDat.fields.description));
            }
            project.find('.projects-single-img-container').append(newImg);
        }
    }
    console.log(project);

    project.removeClass('projects-single-template').addClass('projects-single').attr('id', data.project.fields.slug);
    $('.projects-single-section .page-content').html(project);
    $('.projects-single-section').removeClass('not-loaded').addClass('loaded').scrollTop(0);
}

function showSingleProject() {
    $('.projects-single-section').addClass('active');
}

function toggleLoading(shouldShow) {
    shouldShow ? $('.loading-page').addClass('active') : $('.loading-page').removeClass('active');
}

// Utility function in sorting project entries
function compareProjectDates(a, b) {
  const openingA = a.fields.openingDate;
  const openingB = b.fields.openingDate;

  var comparison = 0;
  if (openingA > openingB) {
    comparison = 1;
  } else if (openingA < openingB) {
    comparison = -1;
  }
  return comparison * -1;
}
