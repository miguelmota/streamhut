var gulp = require('gulp');
var browserify = require('gulp-browserify');
var watch = require('gulp-watch');

gulp.task('default', function () {
  gulp.src('client/scripts')
  .pipe(watch('*.js', function(files) {
    return files.pipe(gulp.dest('./static/scripts'));
  }));
  //.pipe(gulp.dest('./client/scripts'));
});

gulp.task('scripts', function() {
  gulp.src('src/scripts/main.js')
  .pipe(browserify({
    insertGlobals : true
  }))
  .pipe(gulp.dest('./script/bundle.js'))
});
