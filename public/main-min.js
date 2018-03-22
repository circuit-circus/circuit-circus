function goToPage(e,t){var a=$('.page-section[data-id="'+e+'"]');a.length||console.log("ERROR!!!!"),$(".page-section.active").removeClass("active"),$('.page-section[data-id="'+e+'"]').addClass("active"),$(".nav-item.active").removeClass("active"),$('.nav-item[data-target="'+e+'"]').addClass("active"),"projects"==e&&a.hasClass("not-loaded")?$.ajax({url:"/"+e}).done(function(t){insertProjectsData(t[e],e,a),toggleLoading(!1)}):toggleLoading(!1)}function insertProjectsData(e,t,a){var o=$(".background-container");e.forEach(function(e){var i=$(a).find("article.template").clone(),n=$(i).find(".projects-single-permalink").attr("href","#"+t+"/"+e.fields.slug).text(e.fields.title).attr("data-slug",e.fields.slug).attr("data-name",e.fields.title);e.fields.coverMedia&&e.fields.coverMedia.fields.file.url&&$(i).find(".projects-single-cover-image").css("background-image","url("+e.fields.coverMedia.fields.file.url+")"),$(i).find(".projects-single-title").append(n),$(i).find(".projects-single-paragraph").text(e.fields.leadParagraph),$(i).removeClass("template"),$(a).find(".page-content").append(i);var l=o.clone();l.attr("data-name",e.fields.title);var s=e.fields.title+"";s=s.repeat(200),l.html(s),o.after(l)}),a.removeClass("not-loaded").addClass("loaded")}function getSingleProject(e,t){$.ajax({url:"/projects/"+e}).done(function(e){insertSingleProjectData(e),toggleLoading(!1),t()})}function insertSingleProjectData(e){var t=$(".projects-single-template");t.find(".projects-single-title").text(e.project.fields.title),t.find(".projects-single-lead").text(e.project.fields.leadParagraph);var a=converter.makeHtml(e.project.fields.bodyText);if(t.find(".projects-single-body").html(a),$(".projects-single-section .projects-single-img-container").html(""),void 0!==e.project.fields.gallery&&null!==e.project.fields.gallery&&e.project.fields.gallery.length>0){var o=$("<img/>");for(var i in e.project.fields.gallery){var n=e.project.fields.gallery[i],l=o.clone();l.attr("src",n.fields.file.url),t.find(".projects-single-img-container").append(l)}}t.removeClass(".projects-single-template").addClass("projects-single").attr("id",e.project.fields.slug),$(".projects-single-section .page-content").html(t).removeClass("not-loaded").addClass("loaded")}function showSingleProject(){$(".projects-single-section").addClass("active")}function toggleLoading(e){e?$(".loading-page").addClass("active"):$(".loading-page").removeClass("active")}var converter=new showdown.Converter;$(document).ready(function(){var e=window.location.hash;""==e&&(e="#home");var t=e.substring(1,e.length);if(-1===t.indexOf("projects/"))toggleLoading(!0),goToPage(t,!1);else{var a=t.substring("projects/".length,t.length);goToPage("projects",!1),toggleLoading(!0),getSingleProject(a,showSingleProject)}$(".nav-item").on("click",function(e){e.stopPropagation();var t=$(this).attr("data-target");toggleLoading(!0),goToPage(t,!0,this)}),$("body").on("click",".projects-single-permalink",function(){var e=$(this).attr("data-slug");toggleLoading(!0),getSingleProject(e,showSingleProject)}),$("body").on("mouseenter",".projects-single-permalink",function(){var e=$(this).data("name");$('.background-container[data-name="'+e+'"]').addClass("active")}),$("body").on("mouseleave",".projects-single-permalink",function(){var e=$(this).data("name");$('.background-container[data-name="'+e+'"]').removeClass("active")})});