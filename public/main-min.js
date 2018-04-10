function goToCurrentPage(){var e=window.location.hash;""==e&&(e="#home");var t=e.substring(1,e.length);if(-1===t.indexOf("projects/"))toggleLoading(!0),goToPage(t,!1);else{var o=t.substring("projects/".length,t.length);toggleLoading(!0),goToPage("projects",!1),getSingleProject(o,showSingleProject)}}function goToPage(e,t){var o=$('.page-section[data-id="'+e+'"]');o.length||console.error("Error: Page Section length is "+o.length),$(".page-section.active").removeClass("active"),$('.page-section[data-id="'+e+'"]').addClass("active"),$(".nav-item.active").removeClass("active"),$('.nav-item[data-target="'+e+'"]').addClass("active"),"projects"==e&&o.hasClass("not-loaded")?$.ajax({url:"/"+e}).done(function(e){insertProjectsData(e.projects.sort(compareProjectDates),o),toggleLoading(!1)}):toggleLoading(!1)}function insertProjectsData(e,t){var o=$(".background-container");e.forEach(function(e){var i=$(t).find("article.template").clone(),a=$(i).find(".projects-item-permalink").attr("href","#projects/"+e.fields.slug).text(e.fields.title).attr("data-slug",e.fields.slug).attr("data-name",e.fields.title);e.fields.coverMedia&&e.fields.coverMedia.fields.file.url&&$(i).find(".projects-item-cover-image").css("background-image","url("+e.fields.coverMedia.fields.file.url+")"),$(i).find(".projects-item-title").append(a),$(i).find(".projects-item-paragraph").text(e.fields.leadParagraph),$(i).removeClass("template"),$(t).find(".page-content").append(i);var n=o.clone();n.attr("data-name",e.fields.title);var s=e.fields.title+" ";s=s.repeat(200),n.html(s),o.after(n)}),t.removeClass("not-loaded").addClass("loaded")}function getSingleProject(e,t){$.ajax({url:"/projects/"+e}).done(function(e){insertSingleProjectData(e),toggleLoading(!1),t()})}function insertSingleProjectData(e){var t=$(".projects-single-template");t.find(".projects-single-title").text(e.project.fields.title),t.find(".projects-single-lead").text(e.project.fields.leadParagraph);var o=converter.makeHtml(e.project.fields.bodyText);if(t.find(".projects-single-body").html(o),$(".projects-single-section .projects-single-video-container").html(""),$(".projects-single-video-container video").off("click"),$(".projects-single-video-container .mute").off("click"),void 0!==e.project.fields.video&&null!==e.project.fields.video&&e.project.fields.video.length>0){var i=$('<div class="video-wrapper"><video src="" autoplay loop></video><button class="mute">Turn sound on</button></div>');for(var a in e.project.fields.video){var n=e.project.fields.video[a],s=i.clone();s.find("video").attr("src",n.fields.file.url),t.find(".projects-single-video-container").append(s),s.find("video").get(0).muted=!0}}if($(".projects-single-video-container video").on("click",function(){var e=$(this).get(0);e.paused?e.play():e.pause()}),$(".projects-single-video-container .mute").on("click",function(){var e=$(this).siblings("video").get(0);console.log(e),e.muted?(e.muted=!1,$(this).text("Turn sound off")):(e.muted=!0,$(this).text("Turn sound on"))}),$(".projects-single-section .projects-single-img-container").html(""),void 0!==e.project.fields.gallery&&null!==e.project.fields.gallery&&e.project.fields.gallery.length>0){var r=$('<div class="projects-single-img"><img/></div>');for(var a in e.project.fields.gallery){var l=e.project.fields.gallery[a],d=r.clone();d.find("img").attr("src",l.fields.file.url),l.fields.description&&l.fields.description.length>0&&d.append($('<span class="projects-single-img-description"></span>').text(l.fields.description)),t.find(".projects-single-img-container").append(d)}}t.removeClass(".projects-single-template").addClass("projects-single").attr("id",e.project.fields.slug),$(".projects-single-section .page-content").html(t),$(".projects-single-section").removeClass("not-loaded").addClass("loaded").scrollTop(0)}function showSingleProject(){$(".projects-single-section").addClass("active")}function toggleLoading(e){e?$(".loading-page").addClass("active"):$(".loading-page").removeClass("active")}function compareProjectDates(e,t){const o=e.fields.openingDate,i=t.fields.openingDate;var a=0;return o>i?a=1:o<i&&(a=-1),-1*a}var converter=new showdown.Converter;$(document).ready(function(){goToCurrentPage(),window.onhashchange=function(){goToCurrentPage()},$(".nav-item").on("click",function(e){e.stopPropagation();var t=$(this).attr("data-target");toggleLoading(!0),goToPage(t,!0,this)}),$("body").on("click",".projects-item-permalink",function(){var e=$(this).attr("data-slug");toggleLoading(!0),getSingleProject(e,showSingleProject)}),$("body").on("mouseenter",".projects-item-permalink",function(){var e=$(this).data("name");$('.background-container[data-name="'+e+'"]').addClass("active")}),$("body").on("mouseleave",".projects-item-permalink",function(){var e=$(this).data("name");$('.background-container[data-name="'+e+'"]').removeClass("active")})});