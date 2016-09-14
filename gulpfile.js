var gulp = require("gulp");

// plugins
var jshint = require("gulp-jshint");
var connect = require('gulp-connect-php');
var changed = require("gulp-changed");
var plumber = require("gulp-plumber");
var imagemin = require("gulp-imagemin");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var cleanCSS = require('gulp-clean-css');
var clean = require('gulp-rimraf');
var useref = require('gulp-useref-plus');
var gulpIf = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var webstandards = require('gulp-webstandards');
var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');




var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};

gulp.task('validate', function() {
  return gulp.src("")
		.pipe(webstandards());
});




/* TASKS FOR 'CREATE_PROJECT' MAIN TASK */

//clean a new project directory before project creation
gulp.task('clean', [], function() {
  return gulp.src("dist/*", { read: false })
		.pipe(clean());
});


//copy components
gulp.task("copy-components", ['copy-php'], function() {
	return gulp.src("src/components/*")
	.pipe(gulp.dest("dist/components"));
});

//copy php folder to a created project
gulp.task("copy-php", ['compress-images'], function() {
	return gulp.src("src/assets/php/*")
	.pipe(gulp.dest("dist/assets/php"));
});


//copy and compress images to a created project
gulp.task("compress-images", ['copy-lib'], function() {
	return gulp.src("src/assets/img/*")
	.pipe(imagemin({ progressive: true }))
	.pipe(gulp.dest("dist/assets/img"));
});

//copy lib folder to a created project
gulp.task("copy-lib", ['copy-project'], function() {
	return gulp.src("src/lib/**/*")
	.pipe(gulp.dest("dist/lib/"));
});


gulp.task('copy-project', ['clean'], function() {
	
	//read files from src directory
  return gulp.src('src/*')
	/*look for comments
	<!-- build:<type> <path> -->
		list of script / link tags (HTML Markup)
	<!-- endbuild -->*/
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    //concatenate and minify css files
    .pipe(gulpIf('*.css', cleanCSS()))
	/*write files (with links to new css and js files) from src directory 
	and new css and js files to a specified directory*/
    .pipe(gulp.dest('dist'))
	
});

/* CREATE AN OPTIMIZED PROJECT FROM src SOURCE FOLDER */

gulp.task('create', ['copy-project', 'compress-images', 'copy-lib', 'copy-php', 'copy-components', 'create-articles'], function() {
	
	console.log("Create sourcemaps");
	
    gulp.src(SRC_JS)
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('sourcemap'))
	.pipe(gulp.dest('dist/assets/js'));
	
    gulp.src(SRC_CSS)
    .pipe(sourcemaps.init())
    .pipe(concat('styles.min.css'))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('sourcemap'))
	.pipe(gulp.dest('dist/assets/css'));
  
});




/* FILE PATHS FOR ARTICLES */

//css files
var SRC_CSS_ART = "src/articles/assets/css/*.css";


//clean a new project directory before project creation
gulp.task('clean_art', [], function() {
  return gulp.src("dist/articles/*", { read: false })
		.pipe(clean());
});

//copy and compress images to a created project
gulp.task("compress-images_art", ['copy-lib'], function() {
	return gulp.src("src/articles/assets/img/*")
	.pipe(imagemin({ progressive: true }))
	.pipe(gulp.dest("dist/articles/assets/img"));
});

//copy lib folder to a created project
gulp.task("copy-lib_art", ['copy-project_art'], function() {
	return gulp.src("src/articles/lib/**/*")
	.pipe(gulp.dest("dist/articles/lib/"));
});

gulp.task('copy-project_art', ['clean_art'], function() {
	
	//read files from src directory
  return gulp.src('src/articles/*')
	/*look for comments
	<!-- build:<type> <path> -->
		list of script / link tags (HTML Markup)
	<!-- endbuild -->*/
    .pipe(useref())
    //concatenate and minify css files
    .pipe(gulpIf('*.css', cleanCSS()))
	/*write files (with links to new css and js files) from src directory 
	and new css and js files to a specified directory*/
    .pipe(gulp.dest('dist/articles/'))
	
});

/* CREATE AN OPTIMIZED PROJECT FROM src SOURCE FOLDER */

gulp.task('create-articles', ['copy-project_art', 'compress-images_art', 'copy-lib_art'], function() {
	
	console.log("Create sourcemaps");
	
    gulp.src(SRC_CSS_ART)
    .pipe(sourcemaps.init())
    .pipe(concat('styles.min.css'))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write('sourcemap'))
	.pipe(gulp.dest('dist/articles/assets/css'));
  
});




/* Browser refresh and debugging */

gulp.task('browserSync', function() {
  connect.server({}, function (){
    browserSync({
      proxy: '127.0.0.1/arnuga3/arnuag3/src/'
    });
  });
});

/* watch for changes and refresh a browser if any */

gulp.task('js', function () {
    return gulp.src(SRC_JS)
		.pipe(plumber())
		.pipe(jshint())
		.pipe(jshint.reporter("default"))
		.pipe(browserSync.reload({
		  stream: true
		}));
});

gulp.task('sass-compile', function() {
	return gulp.src('src/assets/scss/*.scss')
		.pipe(sass({outputStyle: 'expanded'}))
		.pipe(autoprefixer(autoprefixerOptions))
		.pipe(gulp.dest('src/assets/scss/css'))
		.pipe(browserSync.reload({
		  stream: true
		}));
});

gulp.task('css', function () {
    return gulp.src(SRC_CSS)
		.pipe(browserSync.reload({
		  stream: true
		}));
});

gulp.task('php', function () {
    return gulp.src(SRC_PHP)
		.pipe(browserSync.reload({
		  stream: true
		}));
});

gulp.task('html', function () {
    return gulp.src(SRC_HTML)
		.pipe(changed(SRC_HTML))
		.pipe(browserSync.reload({
		  stream: true
		}));
});


gulp.task("watch", ['browserSync', 'js', 'sass-compile', 'php', 'html'], function() {
	gulp.watch(SRC_JS, ['js']);
	gulp.watch(SRC_SCSS, ['sass-compile']);
	gulp.watch(SRC_PHP, ['php']);
	gulp.watch(SRC_HTML, ['html']);
});


/* DEFAULT TASK */

gulp.task("default", ["watch"]);






gulp.task('checkJS', function () {
    return gulp.src('src/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter("default"));
});