var gulp = require('gulp');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');
var karma = require('karma');
var esdoc = require('gulp-esdoc');

gulp.task('lint', function() {
   return gulp.src('src/*.js')
      .pipe(jscs({
         fix: true
      }))
      .pipe(jscs.reporter())
      .pipe(jscs.reporter('fail'))
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(jshint.reporter('fail'))
      .pipe(gulp.dest('src'));
});

gulp.task('test', function(done) {
   new karma.Server({
      configFile: __dirname + '/karma.conf.js'
   }, done).start();
});

gulp.task('documentation', function () {
   return gulp.src('src')
      .pipe(esdoc());
});

gulp.task('clean', function () {
   return del([
      'dist/*',
      'doc/**/*',
      'coverage/**/*'
   ]);
});

gulp.task('watch', function() {
   gulp.watch('src/**/*.js', ['build']);
});

gulp.task('build:debug', function() {
   var babelifyConfig = {
      plugins: [
         'add-module-exports',
         'transform-es2015-modules-umd',
         'transform-remove-console'
      ]
   };
   var browserifyInstance = browserify({
         debug: true,
         entries: 'src/main.js',
         standalone: 'WebReader'
      })
      .transform('babelify', babelifyConfig);

   return browserifyInstance
      .bundle()
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({
         loadMaps: true
      }))
      .pipe(uglify())
      .pipe(rename('web-reader.min.js'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('dist'));
});

gulp.task('build:min', function() {
   var browserifyInstance = browserify({
      debug: true,
      entries: 'src/main.js',
      standalone: 'WebReader',
      transform: [babelify]
   });

   return browserifyInstance
      .bundle()
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({
         loadMaps: true
      }))
      .pipe(rename('web-reader.debug.js'))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('dist'));
});

gulp.task('build', ['build:min', 'build:debug']);

gulp.task('default', ['clean', 'lint', 'test', 'documentation', 'build']);