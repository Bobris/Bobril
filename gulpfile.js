var gulp = require('gulp');
var gulpif = require('gulp-if');
var fs = require('graceful-fs');
var typeScriptCompile = require('./tscomp.js');
var through2 = require('through2');

var sources = ['src/**/*.js'];
var testSources = ['test/**/*.js'];
var allSources = sources.concat(testSources);
var tsSources = ['src/**/*.ts'];
var testTsSources = ['test/**/*.ts'];
var allTsSources = sources.concat(testSources);

var dist = './dist/';

gulp.task('uglify', ['copydef'], function() {
  var uglify = require('gulp-uglify');
  var rename = require('gulp-rename');

  return gulp.src(sources)
    .pipe(uglify({ compress: { unsafe:true, pure_funcs: [ 'assert' ], global_defs: { DEBUG: false } } }))
	.pipe(rename(function (path) {
        path.basename += ".min";
    }))
    .pipe(gulp.dest(dist));
});

gulp.task('copydef', function() {
  return gulp.src('src/**/*.d.ts')
    .pipe(gulp.dest(dist));
});

gulp.task('dist', ['copydef','uglify','calc']);

gulp.task('watch', ['ts','dist'], function() {
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

gulp.task('calc', ['uglify'], function () {
    var gzipSync = require('browserify-zlib').gzipSync;
    var distList = fs.readdirSync('dist/');
	distList = distList.filter(function(name) { return /\.min\.js$/.test(name); });
	function extractPluginName(name) {
	    if (name=='bobril') return 'bobril';
		return name.substr(7);
	}
	var name2idx = {};
	var wholebuf = "";
	distList = distList.map(function(name,i) {
       var buf = fs.readFileSync("dist/"+name);
	   var plname=extractPluginName(name.substr(0,name.length-7));
	   wholebuf+=buf.toString();
	   name2idx[plname]=i;
	   return { name:plname, minname: name, minsize: buf.length, gzipsize:gzipSync(buf.toString()).length };
    });
    var srcList = fs.readdirSync('src/');
	srcList.filter(function(name) { return /\.js$/.test(name); }).forEach(function(name) {
       var buf = fs.readFileSync("src/"+name);
	   var plname=extractPluginName(name.substr(0,name.length-3));
	   if (name2idx[plname]==null) return;
	   var o=distList[name2idx[plname]];
	   o.jssize=buf.length;
	   o.jslines=buf.toString().split(/\r\n|\r|\n/).length;
	});
	srcList.filter(function(name) { return /\.ts$/.test(name) && !/\.d\.ts$/.test(name); }).forEach(function(name) {
       var buf = fs.readFileSync("src/"+name);
	   var plname=extractPluginName(name.substr(0,name.length-3));
	   if (name2idx[plname]==null) return;
	   var o=distList[name2idx[plname]];
	   o.tssize=buf.length;
	   o.tslines=buf.toString().split(/\r\n|\r|\n/).length;
	});
	distList.sort(function(a,b) {
	   if (a.name==b.name) return 0;
	   if (a.name=='bobril') return -1;
	   if (b.name=='bobril') return 1;
	   if (a.name<b.name) return -1;
	   return 1;
	});
    function padString(len, str, leftPadded) {
      if (str == undefined) str = ''; else str=''+str;
      if (leftPadded) {
        while (str.length < len) str = ' ' + str;
      } else {
        while (str.length < len) str = str + ' ';
      }
      return str;
    }
	function logInfo(name,tslines,jssize,minsize,gzipsize) {
	    console.log(padString(12,name)+' '+padString(5,tslines,true)+' '+padString(6,jssize,true)+' '+padString(6,minsize,true)+' '+padString(6,gzipsize,true));
    }
	logInfo('Name','Lines','Orig','Minif','Gzip');
	var totaltslines=0,totaljssize=0,totalminsize=0,totalgzipsize=0;
	distList.forEach(function(o) {
	    totaltslines+=o.tslines;
	    totaljssize+=o.jssize;
	    totalminsize+=o.minsize;
	    totalgzipsize+=o.gzipsize;
	    logInfo(o.name,o.tslines,o.jssize,o.minsize,o.gzipsize);
	});
	logInfo('Total Sum',totaltslines,totaljssize,totalminsize,totalgzipsize);
	var concatgzip = gzipSync(wholebuf).length;
	logInfo('Concat','','','',concatgzip);
	var data = {
        parts: distList.map(function(item) { return { name: item.name, tslines: item.tslines, jssize: item.jssize, minsize: item.minsize, gzipsize: item.gzipsize }; }),
		total: { tslines: totaltslines, jssize: totaljssize, minsize: totalminsize, gzipsize: totalgzipsize },
		concatgzipsize: concatgzip
		};
	fs.writeFileSync("examples/libsize/data.js","var libSizeData="+JSON.stringify(data));
});


var alltsfilesToWatch = ['./src/**/*.ts','./examples/**/*.ts','./test/**/*.ts','./package/**/*.ts','./packageFlexIE10/*.ts'];
var alltsProjsToCompile = ['./src/**/tsconfig.json','./examples/**/tsconfig.json','./test/**/tsconfig.json','./package/**/tsconfig.json',"./packageFlexIE10/tsconfig.json"];
alltsfilesToWatch = alltsfilesToWatch.concat(alltsProjsToCompile);

gulp.task('ts', ['compilets'], function () {
    gulp.watch(alltsfilesToWatch, ['compiletsi']);
});

gulp.task('compiletsi', function () {
    return gulp.src(alltsProjsToCompile, { read:false })
	      .pipe(through2.obj(function(file,enc,cb) {
			  typeScriptCompile(file.path, false);
			  setImmediate(cb);
			  }));
});

gulp.task('compilets', function () {
    return gulp.src(alltsProjsToCompile, { read:false })
	      .pipe(through2.obj(function(file,enc,cb) {
			  console.log(file.path);
			  typeScriptCompile(file.path, true);
			  setImmediate(cb);
			  }));
});

gulp.task('default', ['watch']);
