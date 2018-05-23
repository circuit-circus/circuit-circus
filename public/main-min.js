function goToCurrentPage(){var e=window.location.hash;""==e&&(e="#home");var t=e.substring(1,e.length);if($("#nav-logo").removeClass("logo-white"),-1===t.indexOf("projects/"))toggleLoading(!0),goToPage(t,!1),t.includes("about")&&$("#nav-logo").addClass("logo-white");else{var o=t.substring("projects/".length,t.length);toggleLoading(!0),goToPage("projects",!1),getSingleProject(o,showSingleProject)}}function goToPage(e,t){var o=$('.page-section[data-id="'+e+'"]');o.length||console.error("Error: Page Section length is "+o.length),$(".page-section.active").removeClass("active"),$('.page-section[data-id="'+e+'"]').addClass("active"),$(".nav-item.active").removeClass("active"),$('.nav-item[data-target="'+e+'"]').addClass("active"),"projects"==e&&o.hasClass("not-loaded")?$.ajax({url:"/"+e}).done(function(e){insertProjectsData(e.projects.sort(compareProjectDates),o),toggleLoading(!1)}):toggleLoading(!1)}function insertProjectsData(e,t){var o=$(".background-container");e.forEach(function(e){var i=$(t).find("article.template").clone();$(i).find(".projects-item-permalink").attr("href","#projects/"+e.fields.slug).attr("data-slug",e.fields.slug).attr("data-name",e.fields.title);e.fields.coverMedia&&e.fields.coverMedia.fields.file.url&&$(i).find(".projects-item-cover-image").css("background-image","url("+e.fields.coverMedia.fields.file.url+"?w=1024)"),$(i).find(".projects-item-title").text(e.fields.title),$(i).find(".projects-item-paragraph").text(e.fields.leadParagraph),$(i).removeClass("template"),$(t).find(".page-content").append(i);var a=o.clone();a.attr("data-name",e.fields.title);var n=e.fields.title+" ";n=n.repeat(200),a.html(n),o.after(a)}),t.removeClass("not-loaded").addClass("loaded")}function getSingleProject(e,t){$.ajax({url:"/projects/"+e}).done(function(e){insertSingleProjectData(e),toggleLoading(!1),t()})}function insertSingleProjectData(e){var t=$(".projects-single-template").clone();t.find(".projects-single-title").text(e.project.fields.title),t.find(".projects-single-lead").text(e.project.fields.leadParagraph);var o=converter.makeHtml(e.project.fields.bodyText);if(t.find(".projects-single-body").html(o),$(".projects-single-section .projects-single-video-container").html(""),$("body").off("click",".projects-single-video-container .video-wrapper video"),$("body").off("click",".projects-single-video-container .video-wrapper .mute"),$("body").off("click",".projects-single-video-container .video-wrapper .fullscreen"),void 0!==e.project.fields.video&&null!==e.project.fields.video&&e.project.fields.video.length>0){var i=$(".projects-single-video-container .video-wrapper-template");for(var a in e.project.fields.video){var n=e.project.fields.video[a],r=i.clone();r.find("video").attr("src",n.fields.file.url),t.find(".projects-single-video-container").append(r),r.find("video").get(0).muted=!0,r.removeClass("video-wrapper-template")}}if($("body").on("click",".projects-single-video-container .video-wrapper video",function(e){e.preventDefault();var t=$(this).get(0);t.paused?t.play():t.pause()}),$("body").on("click",".projects-single-video-container .video-wrapper .mute",function(e){e.preventDefault();var t=$(this).siblings("video").get(0);t.muted?(t.muted=!1,$(this).addClass("unmuted").removeClass("muted")):(t.muted=!0,$(this).addClass("muted").removeClass("unmuted"))}),$("body").on("click",".projects-single-video-container .video-wrapper .fullscreen",function(e){e.preventDefault();var t=($(this).siblings("video").get(0),document.getElementById("myvideo"));t.requestFullscreen?t.requestFullscreen():t.mozRequestFullScreen?t.mozRequestFullScreen():t.webkitRequestFullscreen&&t.webkitRequestFullscreen()}),$(".projects-single-section .projects-single-img-container").html(""),void 0!==e.project.fields.gallery&&null!==e.project.fields.gallery&&e.project.fields.gallery.length>0){var s=$('<div class="projects-single-img"><img/></div>');for(var a in e.project.fields.gallery){var l=e.project.fields.gallery[a],d=s.clone();d.find("img").attr("src",l.fields.file.url+"?w=1024"),l.fields.description&&l.fields.description.length>0&&d.append($('<span class="projects-single-img-description"></span>').text(l.fields.description)),t.find(".projects-single-img-container").append(d)}}console.log(t),t.removeClass("projects-single-template").addClass("projects-single").attr("id",e.project.fields.slug),$(".projects-single-section .page-content").html(t),$(".projects-single-section").removeClass("not-loaded").addClass("loaded").scrollTop(0)}function showSingleProject(){$(".projects-single-section").addClass("active")}function toggleLoading(e){e?$(".loading-page").addClass("active"):$(".loading-page").removeClass("active")}function compareProjectDates(e,t){const o=e.fields.openingDate,i=t.fields.openingDate;var a=0;return o>i?a=1:o<i&&(a=-1),-1*a}var converter=new showdown.Converter;$(document).ready(function(){goToCurrentPage(),window.onhashchange=function(){goToCurrentPage()},$("body").on("click",".projects-item-permalink",function(){var e=$(this).attr("data-slug");toggleLoading(!0),getSingleProject(e,showSingleProject)}),$("body").on("mouseenter",".projects-item-permalink",function(){var e=$(this).data("name");$('.background-container[data-name="'+e+'"]').addClass("active")}),$("body").on("mouseleave",".projects-item-permalink",function(){var e=$(this).data("name");$('.background-container[data-name="'+e+'"]').removeClass("active")})});