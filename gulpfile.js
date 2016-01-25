var gulp         = require('gulp'),
    less         = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss    = require('gulp-minify-css'),
    rename       = require('gulp-rename'),
    notify       = require('gulp-notify'),
    cache        = require('gulp-cache'),
    livereload   = require('gulp-livereload'),
    lr           = require('tiny-lr'),
    server       = lr(),
    sourcemaps   = require('gulp-sourcemaps'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify');

gulp.task('styles', function () {
    return gulp.src('public/less/style.less')
        .pipe(less({style : 'expanded', compass : true}))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss({compatibility : 'ie9'}))
        .pipe(gulp.dest('public/stylesheets/'))
        .pipe(livereload(server))
        .pipe(notify({message : 'Styles task complete'}));
});


gulp.task('default', function () {
    gulp.start('watch');
});


gulp.task('watch', function () {

    livereload.listen();
    // Watch .less files
    gulp.watch('public/less/**/*.less', ['styles']);
});
