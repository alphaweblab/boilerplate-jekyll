'use strict';

var gulp			= require('gulp');
var postcss 		= require('gulp-postcss');
var tinypng			= require('gulp-tinypng');
var concat			= require('gulp-concat');
var minify			= require('gulp-minifier');
var tailwindcss 	= require('tailwindcss');
var uncss           = require('postcss-uncss');
var cssimport       = require('gulp-cssimport');
var child 			= require('child_process');
var gutil 			= require('gulp-util');
var browserSync 	= require('browser-sync').create();

var siteRoot 		= './_site';

gulp.task('jekyll', function (done) {
	const jekyll = child.spawn('bundle', [
		'exec',
		'jekyll',
		'serve',
		'--watch',
		'--incremental',
		'--drafts'
	]);

	const jekyllLogger = (buffer) => {
		buffer.toString()
			.split(/\n/)
			.forEach((message) => gutil.log('Jekyll: ' + message));
	};

	jekyll.stdout.on('data', jekyllLogger);
	jekyll.stderr.on('data', jekyllLogger);
	done();
});

gulp.task('stylesheets', function () {
	return gulp.src([
				'./_site/assets/stylesheets/master.css',
				'./node_modules/flexboxgrid/css/flexboxgrid.min.css',
			])
			.pipe(concat('master.css'))
			.pipe(postcss([
				tailwindcss('./assets/scripts/tailwind.js'),
				require('autoprefixer'),
				uncss({ html: ['./_site/**/*.html'] }),
			]))
			.pipe(cssimport({}))
			.pipe(minify({
				minify: true,
				collapseWhitespace: true,
				conservativeCollapse: true,
				minifyJS: true,
				minifyCSS: true,
			}))
			.pipe(gulp.dest('./_site/assets/stylesheets/minified'));
});

gulp.task('images', function () {
    return gulp.src(['./_site/assets/images/*.jpg', './_site/assets/images/*.png'])
	        .pipe(tinypng('w2lWbNviXvf2vp4OhLKNUOsexrAd0x-R'))
	        .pipe(gulp.dest('./_site/assets/images'));
});

gulp.task('plugins', function () {
	return 	gulp.src([
				'./node_modules/jquery/dist/jquery.min.js'
			])
	        .pipe(concat('plugins.js'))
	        .pipe(gulp.dest('./_site/assets/scripts'));
});

gulp.task('minify-js', function () {
    return gulp.src('./_site/assets/scripts/*')
			.pipe(minify({
				minify: true,
				collapseWhitespace: true,
				conservativeCollapse: true,
				minifyJS: true,
				minifyCSS: true,
			}))
            .pipe(gulp.dest('./_site/assets/scripts'));
});

gulp.task('serve', function () {
	browserSync.init({
		files: [siteRoot + '/**'],
		port: 4000,
		server: {
			baseDir: siteRoot
		}
	});
	gulp.watch("./_site/assets/stylesheets/master.css", gulp.series('stylesheets'));
});

gulp.task('default', gulp.series('jekyll', 'stylesheets', 'plugins', 'minify-js', 'serve'));
gulp.task('build', gulp.series('default', 'images'));
