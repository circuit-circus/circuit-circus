function goToCurrentPage(){var e=window.location.hash;""==e&&(e="#home");var t=e.substring(1,e.length);if($("#nav-logo").removeClass("logo-white"),t.includes("pages/")){var i=t.substring("pages/".length,t.length);toggleLoading(!0),getSinglePage(i,showSinglePage),goToPage(t,!1)}else if(-1===t.indexOf("projects/"))toggleLoading(!0),goToPage(t,!1);else{var i=t.substring("projects/".length,t.length);toggleLoading(!0),goToPage("projects",!1),getSingleProject(i,showSingleProject)}}function goToPage(e,t){$(".page-section").attr("page-id","");var i=$('.page-section[data-id="'+e+'"]');i.length||console.error("Error: Page Section length is "+i.length),$(".page-section.active").removeClass("active"),$('.page-section[data-id="'+e+'"]').addClass("active"),$(".nav-item.active").removeClass("active"),$('.nav-item[data-target="'+e+'"]').addClass("active"),$(".projects-single-section .projects-single-video-container").html(""),"projects"===e&&i.hasClass("not-loaded")?$.ajax({url:"/"+e}).done(function(e){insertProjectsData(e.projects.sort(function(e,t){const i=e.fields.openingDate,a=t.fields.openingDate;var o=0;return i>a?o=1:i<a&&(o=-1),-1*o}),i),toggleLoading(!1)}):"timeline"===e&&i.hasClass("not-loaded")?$.ajax({url:"/"+e}).done(function(e){insertActivityData(e.pages.sort(function(e,t){const i=e.fields.date,a=t.fields.date;var o=0;return i>a?o=1:i<a&&(o=-1),-1*o}),i),toggleLoading(!1)}):toggleLoading(!1)}function insertProjectsData(e,t){var i=$(".background-container");e.forEach(function(e){var a=$(t).find("article.template").clone();$(a).find(".projects-item-permalink").attr("href","#projects/"+e.fields.slug).attr("data-slug",e.fields.slug).attr("data-name",e.fields.title);e.fields.coverMedia&&e.fields.coverMedia.fields.file.url&&$(a).find(".projects-item-cover-image").css("background-image","url("+e.fields.coverMedia.fields.file.url+"?w=1024)"),$(a).find(".projects-item-title").text(e.fields.title),$(a).find(".projects-item-paragraph").text(e.fields.leadParagraph),$(a).removeClass("template"),$(t).find(".page-content").append(a);var o=i.clone();o.attr("data-name",e.fields.title);var n=e.fields.title+" ";n=n.repeat(200),o.html(n),i.after(o)}),t.removeClass("not-loaded").addClass("loaded")}function insertActivityData(e,t){var i=["January","February","March","April","May","June","July","August","September","October","November","December"],a=($(".background-container"),[]);e.forEach(function(e){var o=$(t).find("li.template").clone();$(o).find(".activities-item-title").text(e.fields.title),$(o).find(".activities-item-descrip").text(e.fields.description);var n=new Date(e.fields.date),s=n.getUTCFullYear(),l=i[n.getUTCMonth()];$(o).find(".activities-item-date").text(l),$(o).find(".activities-item-location").text(e.fields.location),$(o).removeClass("template"),$(t).find(".page-content").append(o),$(o).addClass("activity-year-"+s),a.includes(s)?$(o).appendTo($(".divider-"+s+" ul")):($(o).wrap('<div class="activity-year-divider divider-'+s+'"><ul></ul></div>'),$(".divider-"+s).prepend("<h3><span>"+s+"</span></h3>"),a.push(s))}),t.removeClass("not-loaded").addClass("loaded")}function getSingleProject(e,t){$.ajax({url:"/projects/"+e}).done(function(e){insertSingleProjectData(e),toggleLoading(!1),t()})}function insertSingleProjectData(e){$(".lightbox-container").remove(),$(".projects-single-lightbox").css("display","none");var t=$(".projects-single-template").clone();t.find(".projects-single-title").text(e.project.fields.title),t.find(".projects-single-lead").text(e.project.fields.leadParagraph);var i=converter.makeHtml(e.project.fields.bodyText);if(t.find(".projects-single-body").html(i),$(".projects-single-section .projects-single-video-container").html(""),$("body").off("click",".projects-single-video-container .video-wrapper video"),$("body").off("click",".projects-single-video-container .video-wrapper .mute"),$("body").off("click",".projects-single-video-container .video-wrapper .fullscreen"),void 0!==e.project.fields.video&&null!==e.project.fields.video&&e.project.fields.video.length>0){var a=$(".projects-single-video-container .video-wrapper-template");for(var o in e.project.fields.video){var n=e.project.fields.video[o],s=a.clone();s.find("video").attr("src",n.fields.file.url),t.find(".projects-single-video-container").append(s),s.find("video").get(0).muted=!0,s.removeClass("video-wrapper-template")}}if($("body").on("click",".projects-single-video-container .video-wrapper video",function(e){e.preventDefault();var t=$(this).get(0);t.paused?t.play():t.pause()}),$("body").on("click",".projects-single-video-container .video-wrapper .mute",function(e){e.preventDefault();var t=$(this).siblings("video").get(0);t.muted?(t.muted=!1,$(this).addClass("unmuted").removeClass("muted")):(t.muted=!0,$(this).addClass("muted").removeClass("unmuted"))}),$("body").on("click",".projects-single-video-container .video-wrapper .fullscreen",function(e){e.preventDefault();var t=$(this).siblings("video").get(0);t.requestFullscreen?t.requestFullscreen():t.mozRequestFullScreen?t.mozRequestFullScreen():t.webkitRequestFullscreen&&t.webkitRequestFullscreen()}),$(".projects-single-section .projects-single-img-container").html(""),void 0!==e.project.fields.gallery&&null!==e.project.fields.gallery&&e.project.fields.gallery.length>0){var l=$('<div class="projects-single-img"><img/></div>');for(var o in e.project.fields.gallery){var r=e.project.fields.gallery[o],d=l.clone();d.find("img").attr("src",r.fields.file.url+"?w=1024"),r.fields.description&&r.fields.description.length>0&&d.append($('<span class="projects-single-img-description"></span>').text(r.fields.description)),t.find(".projects-single-img-container").append(d)}}$("body").on("click",".projects-single-img-container .projects-single-img img",function(e){$(".lightbox-container").remove();var t=$('<div class="lightbox-container"><img/></div>'),i=t.clone();$(this).siblings().length>0&&$('<span class="lightbox-label"></span>').appendTo(i).text($(this).siblings().text()),i.find("img").attr("src",e.currentTarget.src),$(".projects-single-lightbox").append(i).addClass("active"),setTimeout(function(){$(".projects-single-lightbox").css("display","flex")},600),$(".projects-single-lightbox").click(function(e){e.target.classList.contains("projects-single-lightbox")&&$(".projects-single-lightbox").removeClass("active")})}),$("html").keydown(function(e){"Escape"===e.key&&$(".projects-single-lightbox").removeClass("active")}),t.removeClass("projects-single-template").addClass("projects-single").attr("id",e.project.fields.slug),$(".projects-single-section .page-content").html(t),$(".projects-single-section").removeClass("not-loaded").addClass("loaded").scrollTop(0)}function showSingleProject(){$(".projects-single-section").addClass("active")}function getSinglePage(e,t){$.ajax({url:"/pages/"+e}).done(function(i){insertSinglePageData(i),toggleLoading(!1),e.includes("about")&&$("#nav-logo").addClass("logo-white"),t()})}function insertSinglePageData(e){var t=$(".page-single-template").clone();t.find(".page-single-body").html(marked(e.page.fields.body)),t.removeClass("page-single-template").addClass("page-single").attr("id",e.page.fields.slug),$(".page-single-section .page-content").html(t),$(".page-single-section").removeClass("not-loaded").addClass("loaded").scrollTop(0),$(".page-section").attr("page-id",e.page.fields.slug)}function showSinglePage(){$(".page-single-section").addClass("active")}function toggleLoading(e){e?$(".loading-page").addClass("active"):$(".loading-page").removeClass("active")}function compareProjectDates(e,t){const i=e.fields.openingDate,a=t.fields.openingDate;var o=0;return i>a?o=1:i<a&&(o=-1),-1*o}function loadGoogleAnalytics(){"undefined"==typeof someObject&&$.loadScript("https://www.googletagmanager.com/gtag/js?id=UA-74656126-1",function(){function e(){dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],e("js",new Date),e("config","UA-74656126-1",{anonymize_ip:!0}),e("send","pageview")})}var converter=new showdown.Converter;$(document).ready(function(){goToCurrentPage(),window.onhashchange=function(){goToCurrentPage()},$("body").on("click",".projects-item-permalink",function(){var e=$(this).attr("data-slug");toggleLoading(!0),getSingleProject(e,showSingleProject)}),$("body").on("mouseenter",".projects-item-permalink",function(){var e=$(this).data("name");$('.background-container[data-name="'+e+'"]').addClass("active")}),$("body").on("mouseleave",".projects-item-permalink",function(){var e=$(this).data("name");$('.background-container[data-name="'+e+'"]').removeClass("active")});var e=document.cookie.match(/(;)?cookiebar=([^;]*);?/);e&&e[2]&&"CookieAllowed"==e[2]&&loadGoogleAnalytics()}),jQuery.loadScript=function(e,t){jQuery.ajax({url:e,dataType:"script",success:t,async:!0})};