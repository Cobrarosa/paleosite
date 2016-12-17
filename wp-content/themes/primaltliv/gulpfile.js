/*
 * Basic vars & paths
 */
var	gulp			= require('gulp'),
	gutil			= require('gulp-util'),
	sourcemaps		= require('gulp-sourcemaps'),
	concat			= require('gulp-concat'),
	cleanCSS		= require('gulp-clean-css'),
	compass			= require('gulp-compass'),
	source			= require('vinyl-source-stream'),
	buffer			= require('vinyl-buffer'),
	uglify			= require('gulp-uglify'),
	globby 			= require('globby'),
	browserify		= require('browserify'),
	jshint			= require('gulp-jshint'),
	fontello		= require('gulp-fontello'),
	through 		= require('through2'),
	sassGlobal		= require('gulp-sass-glob'),
	sass			= require('gulp-sass'),
	autoprefixer	= require('gulp-autoprefixer'),
	cssImport 		= require('gulp-cssimport'),
	reactify 		= require('reactify');

	var config = {
     	sassPath: './resources/sass',
		jsPath:		'./resources/js',
		icons:		'./resources/icons',
		public:		'./public',
    	 compontents: './node_modules' 
	}

/*
 * Task asignments
 */

 gulp.task('scripts', function () {
   // gulp expects tasks to return a stream, so we create one here.
   var bundledStream = through();

   bundledStream
     // turns the output bundle stream into a stream containing
     // the normal attributes gulp plugins expect.
     .pipe(source( 'all.js'))
     // the rest of the gulp task, as you would normally write it.
     // here we're copying from the Browserify + Uglify2 recipe.
     .pipe(buffer())
     .pipe(sourcemaps.init({loadMaps: true}))
       // Add gulp plugins to the pipeline here.
    //    .pipe(uglify())
       .on('error', gutil.log)
     .pipe(sourcemaps.write('./'))
     .pipe(gulp.dest(config.public + '/js/'));

   // "globby" replaces the normal "gulp.src" as Browserify
   // creates it's own readable stream.
   	globby([config.jsPath + '/*.js']).then(function(entries) {
     // create the Browserify instance.
     var b = browserify({
       entries: entries,
       debug: true
     });

     // pipe the Browserify stream into the stream we created earlier
     // this starts our gulp pipeline.
     b.bundle().pipe(bundledStream);
   }).catch(function(err) {
     // ensure any errors from globby are handled
     bundledStream.emit('error', err);
   });

   // finally, we return the stream, so gulp knows when this task is done.
   return bundledStream;
 });

// Get icons
gulp.task('get-icons',  function () {
  return gulp.src('icons.json')
    .pipe(fontello())
    .pipe(gulp.dest( config.icons))

});

// Move font folders to public folder
gulp.task('move-fonts', function() {
		return gulp.src( config.icons + '/font/*.*')
		.pipe(gulp.dest( config.public + '/font'))
});



// Minifying CSS files
gulp.task('clean-css', function() {
  return gulp.src( config.public + '/css/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest( config.public + '/css' ));
});


gulp.task('sass', function() {
	return gulp.src([config.sassPath + '/*.scss'])
	  .pipe(sourcemaps.init())
	  .pipe(sass({
		  outputStyle: 'compressed'
	  }).on('error', sass.logError))
	  .pipe(cssImport())
	  .pipe(autoprefixer({
		   browsers: ['last 1 version', 'IE 9', '> 2%']
	   }))
		.pipe(cleanCSS())
	  .pipe(sourcemaps.write('./'))
	  .pipe(gulp.dest(config.public + '/css'));
});


gulp.task('watch', function() {
    gulp.watch(  config.sassPath + '/**/*.scss', ['sass'] );
    gulp.watch( 'resources/**/*.js', ['scripts'] );
});

// gulp.task('default', [ 'scripts', 'sass']);
gulp.task('default', [ 'scripts', 'sass']);
