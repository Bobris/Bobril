var gulp = require('gulp');
var gulpif = require('gulp-if');

var sources = ['src/**/*.js'];
var testSources = ['test/**/*.js'];
var allSources = sources.concat(testSources);
var tsSources = ['src/**/*.ts'];
var testTsSources = ['test/**/*.ts'];
var allTsSources = sources.concat(testSources);

var dist = './dist/';

gulp.task('uglify', ['copydef'], function() {
  var uglify = require('gulp-uglify');
  var bytediff = require('gulp-bytediff');
  var rename = require('gulp-rename');

  return gulp.src(sources)
    .pipe(bytediff.start())
    .pipe(uglify({ compress: { unsafe:true, pure_funcs: [ 'assert' ], global_defs: { DEBUG: false } } }))
    .pipe(bytediff.stop())
	.pipe(rename(function (path) {
        path.basename += ".min";
    }))
    .pipe(gulp.dest(dist));
});

gulp.task('gzipsize', ['uglify'], function() {
  var size = require('gulp-size');
  var concat = require('gulp-concat');
  return gulp.src([dist+'*.js'])
	.pipe(size({ showFiles: true, gzip:true, title: "Minified+gzip" }))
	.pipe(concat('all.min.js'))
	.pipe(size({ showFiles: false, gzip:true, title: "Minified+concat+gzip" }))
	;
});

gulp.task('copydef', function() {
  return gulp.src('src/**/*.d.ts')
    .pipe(gulp.dest(dist));
});

gulp.task('dist', ['copydef','uglify','gzipsize','sloc']);

gulp.task('watch', ['dist'], function() {
  gulp.watch(sources, function() {
    gulp.run('dist');
  });
});

gulp.task('bump', function(){
  var bump = require('gulp-bump');
  return gulp.src('./package.json')
    .pipe(bump({version: 'minor'}))
    .pipe(gulp.dest('./'));
});

gulp.task('sloc', ['gzipsize'], function(){
  var sloc = require('gulp-sloc');
  return gulp.src(allTsSources)
    .pipe(sloc());
});

gulp.task('buildexamplesclean', function (cb) {
    var rimraf = require('rimraf');
    rimraf('./gh-pages', cb);
});

gulp.task('buildexampleshtml', ['buildexamplesclean'], function() {
  var rebuild = require('gulp-html-rebuild');
  return gulp.src('examples/**/*.*')
  .pipe(gulpif(/\.html$/,rebuild({
    onopentag: function (name, attrs) {
	  if (name === "script") {
	     if (attrs.src && attrs.src.substring(0,10)=="../../src/") {
		     attrs.src="../bobril/"+attrs.src.substring(10);
         }		 
	  }
      return "<" + name + rebuild.createAttrStr(attrs) + ">";
    }
  }))).pipe(gulp.dest('gh-pages/'));
});

gulp.task('buildexamplesbobril', ['buildexampleshtml'], function() {
  return gulp.src('src/*.*').pipe(gulp.dest('gh-pages/bobril/'));
});

gulp.task('pages', ['buildexamplesbobril'], function () {
    var deploy = require('gulp-gh-pages');
    return gulp.src('./gh-pages/**/*')
        .pipe(deploy({}));
});

gulp.task('default', ['watch']);