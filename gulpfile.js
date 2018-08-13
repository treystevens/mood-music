var gulp = require('gulp');


gulp.task('autoprefixer', function () {
    var postcss      = require('gulp-postcss');
    var sourcemaps   = require('gulp-sourcemaps');
    var autoprefixer = require('autoprefixer');

    return gulp.src('public/styles/*css')
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer() ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/styles/dist'));
});



