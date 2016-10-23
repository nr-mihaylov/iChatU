var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var minifycss = require('gulp-clean-css');
var minifyjs = require('gulp-minify');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');

gulp.task('default', [
	'nodemon', 
	'sass', 
	'js', 
	'sass-watch', 
	'js-watch'
]);

gulp.task('compile', [ 
	'sass', 
	'js'
]);

gulp.task('sass-watch', function () {
	gulp.watch('./client/scss/*.scss', ['sass']);
});

gulp.task('js-watch', function () {
	gulp.watch('./client/js/*.js', ['js']);
});

gulp.task('sass', function() {
	
	return gulp.src('./client/scss/style.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(minifycss())
		.pipe(rename({
			basename: "styles",
			suffix: ".min",
			extname: ".css"	
		}))
		.pipe(gulp.dest('./public/stylesheets/'));

});

gulp.task('js', function() {
	return gulp.src([
		'./client/js/util.js', 
		'./client/js/ui.js', 
		'./client/js/shell.js', 
		'./client/js/client.js', 
		'./client/js/interpreter.js', 
		'./client/js/commandHandler.js', 
		'./client/js/ichatu.js'
	])
	.pipe(concat('script.js'))
	.pipe(minifyjs({
			ext: {
				min: '.min.js'
			},
			noSource: true
		}))
	.pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('nodemon', function () {
	nodemon({
		script: './bin/www', 
		env: { 'NODE_ENV': 'development' }
	})
});