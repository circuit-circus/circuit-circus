var converter = new showdown.Converter();

// Set event listeners
$(document).ready(function () {

    // Find out which page we're on on load
    goToCurrentPage();

    // This is triggered when user uses back button
    window.onhashchange = function() {
        goToCurrentPage();
    }

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

    // Cookie consent
    var cookieValue = document.cookie.match(/(;)?cookiebar=([^;]*);?/);
    if(cookieValue && cookieValue[2]) {
        if (cookieValue[2] == 'CookieAllowed') {
            loadGoogleAnalytics();
        }
    }

});

function goToCurrentPage() {
    var hash = window.location.hash;
    if(hash == '') {
        hash = "#home";
    }
    var currentPage = hash.substring(1, hash.length);

    $('#nav-logo').removeClass('logo-white');

    if(currentPage.includes('pages/')) {
        var currentProject = currentPage.substring('pages/'.length, currentPage.length);
        toggleLoading(true);
        getSinglePage(currentProject, showSinglePage);
        goToPage(currentPage, false);
    }
    else if(currentPage.indexOf('projects/') === -1) {
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
    $('.page-section').attr('page-id', '');

    var targetSection = $('.page-section[data-id="' + target + '"]');
    if(!targetSection.length) {
        console.error('Error: Page Section length is ' + targetSection.length);
    }

    $('.page-section.active').removeClass('active');
    $('.page-section[data-id="' + target + '"]').addClass('active');

    $('.nav-item.active').removeClass('active');
    $('.nav-item[data-target="' + target + '"]').addClass('active');

    $('.projects-single-section .projects-single-video-container').html(''); // Clear old videos before adding new one

    // If this is the projects page user is trying to navigate to, load these
    if( (target === 'projects') && targetSection.hasClass('not-loaded')) {
        $.ajax({
            url: '/' + target,
        }).done(function(data) {
            // Sort projects
            var projectsData = data.projects.sort(function(a, b) {
                const openingA = a.fields.openingDate;
                const openingB = b.fields.openingDate;

                var comparison = 0;
                if (openingA > openingB) {
                  comparison = 1;
                } else if (openingA < openingB) {
                  comparison = -1;
                }
                return comparison * -1;
            });
            insertProjectsData(projectsData, targetSection);
            toggleLoading(false);
        });
    }
    else if( (target === 'activities') && targetSection.hasClass('not-loaded')) {
        $.ajax({
            url: '/' + target,
        }).done(function(data) {
            // Sort projects
            var activityData = data.pages.sort(function(a, b) {
                const openingA = a.fields.date;
                const openingB = b.fields.date;

                var comparison = 0;
                if (openingA > openingB) {
                  comparison = 1;
                } else if (openingA < openingB) {
                  comparison = -1;
                }
                return comparison * -1;
            });
            insertActivityData(activityData, targetSection);
            toggleLoading(false);
        });
    }
    else {
        toggleLoading(false);
    }
}

// Insert projects data
function insertProjectsData(data, targetSection) {
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

// Insert projects data
function insertActivityData(data, targetSection) {
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var bgContainer = $('.background-container');
    var addedYears = [];

    data.forEach(function(element) {
        var listItem = $(targetSection).find('li.template').clone();
        $(listItem).find('.activities-item-title').text(element.fields.title)
        $(listItem).find('.activities-item-descrip').text(element.fields.description);
        var itemDate = new Date(element.fields.date);
        var itemYear = itemDate.getUTCFullYear();
        var dateStr = (monthNames[itemDate.getUTCMonth()])/* + ', ' + (itemYear)*/;
        $(listItem).find('.activities-item-date').text(dateStr);
        $(listItem).find('.activities-item-location').text(element.fields.location);
        $(listItem).removeClass('template');
        $(targetSection).find('.page-content').append(listItem);
        $(listItem).addClass('activity-year-' + itemYear);

        if(!addedYears.includes(itemYear)) {
            $(listItem).wrap('<div class="activity-year-divider divider-' + itemYear + '"><ul></ul></div>');
            $('.divider-' + itemYear).prepend('<h3><span>' + itemYear + '</span></h3>');
            addedYears.push(itemYear);
        }
        else {
            $(listItem).appendTo($('.divider-' + itemYear + ' ul'));
        }
    });

    targetSection.removeClass('not-loaded').addClass('loaded');
}

function getSingleProject(slug, callback) {
    $.ajax({
        url: '/projects/' + slug,
        /*user: 'admin',
        password: 'c778c7beb369a309530d03e77e9fcddb3c2305d6cca411f1e3a89c16e207d470'*/
    }).done(function(data) {
        insertSingleProjectData(data);
        toggleLoading(false);
        callback();
    });
}

function insertSingleProjectData(data) {
    $('.lightbox-container').remove()
    $('.projects-single-lightbox').css('display', 'none')

    var project = $('.projects-single-template').clone();
    project.find('.projects-single-title').text(data.project.fields.title);
    project.find('.projects-single-lead').text(data.project.fields.leadParagraph);

    var bodyHtml = converter.makeHtml(data.project.fields.bodyText);
    project.find('.projects-single-body').html(bodyHtml);

    $('.projects-single-section .projects-single-video-container').html(''); // Clear old videos before adding new one
    $('body').off('click', '.projects-single-video-container .video-wrapper video');
    $('body').off('click', '.projects-single-video-container .video-wrapper .mute');
    $('body').off('click', '.projects-single-video-container .video-wrapper .fullscreen');
    if(data.project.fields.video !== undefined && data.project.fields.video !== null && data.project.fields.video.length > 0) {
        var vidElem = $('.projects-single-video-container .video-wrapper-template');
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
    $('body').on('click', '.projects-single-video-container .video-wrapper .fullscreen', function(e) {
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

    $('body').on('click', '.projects-single-img-container .projects-single-img img', function(e) {
        $('.lightbox-container').remove()

        var imgElem = $('<div class="lightbox-container"><img/></div>');
        var newImg = imgElem.clone();

        if($(this).siblings().length > 0) {
            $('<span class="lightbox-label"></span>').appendTo(newImg).text($(this).siblings().text())
        }

        newImg.find('img').attr('src', e.currentTarget.src)
        $('.projects-single-lightbox').append(newImg).addClass('active')

        // Prevent lightbox from showing CSS animations when opening project
        setTimeout(function() {
            $('.projects-single-lightbox').css('display', 'flex')
        }, 600)

        $('.projects-single-lightbox').click(function(e) {
            if(e.target.classList.contains('projects-single-lightbox')) {
                $('.projects-single-lightbox').removeClass('active')
            }
        })
    });

    $('html').keydown(function(e) {
        if(e.key === 'Escape') {
            $('.projects-single-lightbox').removeClass('active')
        }
    })

    project.removeClass('projects-single-template').addClass('projects-single').attr('id', data.project.fields.slug);
    $('.projects-single-section .page-content').html(project);
    $('.projects-single-section').removeClass('not-loaded').addClass('loaded').scrollTop(0);
}

function showSingleProject() {
    $('.projects-single-section').addClass('active');
}

function getSinglePage(slug, callback) {
    $.ajax({
        url: '/pages/' + slug,
    }).done(function(data) {
        insertSinglePageData(data);
        toggleLoading(false);
        if(slug.includes('about')) {
            $('#nav-logo').addClass('logo-white');
        }
        callback();
    });
}

function insertSinglePageData(data) {

    var project = $('.page-single-template').clone();
    project.find('.page-single-body').html(marked(data.page.fields.body));
    project.removeClass('page-single-template').addClass('page-single').attr('id', data.page.fields.slug);

    // If we're on the about page, add the member profile references
    // if(data.page.fields.slug == 'about' && (data.page.fields.references && data.page.fields.references.length > 0)) {

    //     data.page.fields.references.forEach(function(element) {
    //         console.log(element.fields.memberImage.fields.file.url);
    //         var profile = $('.members-profile-item-container--template').clone();

    //         profile.find('.members-profile-image').css('background-image', 'url(' + element.fields.memberImage.fields.file.url + ')');
    //         profile.find('.members-profile-name').text(element.fields.memberName);
    //         profile.find('.members-profile-description').html(marked(element.fields.memberDescription));

    //         profile.removeClass('members-profile-item-container--template').addClass('members-profile-item-container');

    //         project.find('.members-profile-container').append(profile);
    //     })


    // }

    $('.page-single-section .page-content').html(project);
    $('.page-single-section').removeClass('not-loaded').addClass('loaded').scrollTop(0);

    $('.page-section').attr('page-id', data.page.fields.slug);
}

function showSinglePage() {
    $('.page-single-section').addClass('active');
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

function loadGoogleAnalytics() {
    if (typeof someObject == 'undefined') $.loadScript('https://www.googletagmanager.com/gtag/js?id=UA-74656126-1', function(){
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-74656126-1', { 'anonymize_ip': true });
        gtag('send', 'pageview');

    }); 
}

jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}
