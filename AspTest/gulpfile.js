// Less configuration
var gulp = require("gulp");
var less = require("gulp-less");

gulp.task("less",
    function() {
        gulp.src("wwwroot/css/*.less")
            .pipe(less())
            .pipe(gulp.dest(function(f) {
                return f.base;
            }));
    });

gulp.task("watch_less",
    ["less"],
    function() {
        gulp.watch("wwwroot/css/*.less", ["less"]);
    });