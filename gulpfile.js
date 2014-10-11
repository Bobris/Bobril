var gulp = require('gulp');

var sources = ['src/**/*.js'];
var testSources = ['test/**/*.js'];
var allSources = sources.concat(testSources);
var tsSources = ['src/**/*.ts'];
var testTsSources = ['test/**/*.ts'];
var allTsSources = sources.concat(testSources);

var dist = './dist/';

gulp.task('uglify', function() {
  var uglify = require('gulp-uglify');
  var bytediff = require('gulp-bytediff');
  var size = require('gulp-size');
  var rename = require('gulp-rename');

  gulp.src(sources)
    .pipe(bytediff.start())
    .pipe(uglify())
    .pipe(bytediff.stop())
	.pipe(rename(function (path) {
        path.basename += ".min";
    }))
    .pipe(gulp.dest(dist))
	.pipe(size({ showFiles: true, gzip:true, title: "Minified+gzip" }));
  gulp.src('src/**/*.d.ts')
    .pipe(gulp.dest(dist));
});

gulp.task('dist', ['uglify','sloc'], function() {
});

gulp.task('watch', ['dist'], function() {
  gulp.watch(sources, function() {
    gulp.run('dist');
  });
});

gulp.task('bump', function(){
  var bump = require('gulp-bump');
  gulp.src('./package.json')
    .pipe(bump({version: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('sloc', function(){
  var sloc = require('gulp-sloc');
  gulp.src(allTsSources)
    .pipe(sloc());
});

gulp.task('default', function(){
  gulp.run('watch');
});