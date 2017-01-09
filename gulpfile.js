var gulp         = require('gulp'),
		sass         = require('gulp-sass'),
		autoprefixer = require('gulp-autoprefixer'),
		cleanCSS    = require('gulp-clean-css'),
		rename       = require('gulp-rename'),
		browserSync  = require('browser-sync').create(),
		concat       = require('gulp-concat'),
		htmlbeautify = require('gulp-html-beautify'),
		changed      = require('gulp-changed'),
		jade         = require('gulp-jade'),
		spritesmith = require('gulp.spritesmith'),
		uglify       = require('gulp-uglify');


gulp.task('sprite', function() {
    var spriteData = 
        gulp.src('./app/img/sprite/*.*') // путь, откуда берем картинки для спрайта
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: 'sprite.sass',
                cssFormat: 'sass',
                algorithm: 'left-right',
                cssVarMap: function(sprite) {
                    sprite.name = 'icon-' + sprite.name
                }
            }));

    spriteData.img.pipe(gulp.dest('./app/img/')); // путь, куда сохраняем картинку
    spriteData.css.pipe(gulp.dest('./sass/')); // путь, куда сохраняем стили
});

gulp.task('browser-sync', ['styles', 'scripts', 'jade'], function() {
		browserSync.init({
				server: {
						baseDir: "./app"
				},
				notify: false
		});
});


gulp.task('jade', function() {
	var options = {
    indentSize: 2,
    indent_with_tabs: true
  };
    return gulp.src('./jade/**/*.jade')
    		.pipe(changed('/app/', {extension: '.html'}))
        .pipe(jade())
        .pipe(htmlbeautify(options)) 
        .pipe(gulp.dest('./app'));
});

gulp.task('styles', function () {
	return gulp.src('sass/*.sass')
	.pipe(changed('/app/css', {extension: '.css'}))
	.pipe(sass({
		includePaths: require('node-bourbon').includePaths
	}).on('error', sass.logError))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer({browsers: ['last 25 versions'], cascade: false}))
	// .pipe(cleanCSS())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.stream());
});

gulp.task('scripts', function() {
	return gulp.src([
		'./libs/jquery/jquery-1.11.2.min.js',
		'./libs/magnificPopup/jquery.magnific-popup.min.js',
		'./libs/inputmask/jquery.maskedinput.min.js',
		'./libs/owlcarousel/owl.carousel.min.js'
		])
		.pipe(changed('/app/js', {extension: '.js'}))
		.pipe(concat('libs.js'))
		.pipe(uglify()) //Minify libs.js
		.pipe(gulp.dest('./app/js/'));
});

// gulp.task('htmlbeautify', function() {
//   var options = {
//     indentSize: 2,
//     indent_with_tabs: true
//   };
//   gulp.src('./app/*.html')
//     .pipe(htmlbeautify(options))
//     .pipe(gulp.dest('./app/'))
// });

gulp.task('watch', function () {
	gulp.watch('sass/*.sass', ['styles']);
	gulp.watch('jade/*.jade', ['jade']);
	gulp.watch('app/libs/**/*.js', ['scripts']);
	gulp.watch('app/js/*.js').on("change", browserSync.reload);
	gulp.watch('app/*.html').on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync', 'watch']);
