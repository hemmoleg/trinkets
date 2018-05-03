// Less configuration
var gulp = require('gulp');
var less = require('gulp-less')
var tsc = require('gulp-typescript')

gulp.task('less', function() {
    gulp.src('css/*.less')
        .pipe(less({
            strictMath: 'on'
        }))
        .pipe(gulp.dest(function(f) {
            return f.base;
        }))
});

gulp.task('watch_less', ['less'], function() {
    gulp.watch('css/*.less', ['less']);
});

gulp.task("typescript", function () {
    return gulp.src('js/*.ts')
        .pipe(tsc({
            noImplicitAny: true,
        }))
        .pipe(gulp.dest(function(f) {
            return f.base;
        }))
});

gulp.task('watch_typescript', ['typescript'], function(){
    gulp.watch('js/*.ts', ['typescript']);
});