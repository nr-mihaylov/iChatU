var gulp = require('gulp');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');

gulp.task('default', ['nodemon', 'sass-watch']);

gulp.task('sass-watch', function () {
	gulp.watch('./scss/**/*.scss', ['sass']);
});

gulp.task('sass', function() {
	
	return gulp.src('./scss/**/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./public/stylesheets/'));

});

gulp.task('nodemon', function () {
	nodemon({
		script: './bin/www', 
		env: { 'NODE_ENV': 'development' }
	})
});