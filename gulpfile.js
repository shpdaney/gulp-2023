const fs = require('fs');
const gulp = require("gulp");
const clean = require('gulp-clean');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');

const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require("gulp-sourcemaps");

const newer = require('gulp-newer');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');

const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

const browserSync = require('browser-sync').create();


// HTML
function html() {
    return gulp.src('src/index.html')
        .pipe(htmlmin({
            removeComments: true,
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.stream());
}
exports.html = html;


// Styles
function styles() {
	return gulp.src('src/styles/index.{css,scss,sass}')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([
            require('postcss-import'),
            require('postcss-media-minmax'),
            require('autoprefixer'),
            require('postcss-csso')
        ]))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
}
exports.styles = styles;


// Scripts
function scripts () {
    return gulp.src('src/scripts/*.js')
        // .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('index.min.js'))
        .pipe(uglify())
        // .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(browserSync.stream());

}
exports.scripts = scripts;


// Images
function images () {
    return gulp.src([
        'src/images/*.{png,jpg,jpeg}'
    ])
        .pipe(newer('dist/images'))
        .pipe(webp())

        .pipe(gulp.src('src/images/*.{png,jpg,jpeg}'))
        .pipe(newer('dist/images'))
        .pipe(imagemin())

        .pipe(gulp.src('src/images/*.svg'))
        .pipe(newer('dist/images'))

        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.stream());
}
exports.images = images;


// Fonts
function fonts () {
  return gulp.src('src/fonts/**/*.{ttf,otf}')
      .pipe(ttf2woff({
        ignoreExt: true,
      }))
      .pipe(gulp.dest('dist/fonts'))

      .pipe(gulp.src('src/fonts/**/*.{ttf,otf}'))
      .pipe(ttf2woff2({
        ignoreExt: true,
      }))

      .pipe(gulp.dest('dist/fonts'))
}
exports.fonts = fonts;


// Watch
function watch () {
    gulp.watch(['src/*.html'], html)
    gulp.watch(['src/styles/**/*.*'], styles)
    gulp.watch(['src/scripts/*.js'], scripts)
    gulp.watch(['src/images/**/*.*'], images)
    gulp.watch(['src/**/*.html']).on('change', browserSync.reload)
}
exports.watch = watch;


// Clean
function cleanDist() {
    return gulp.src('dist', {read: false})
        .pipe(clean());
}
exports.cleanDist = cleanDist;


// Local server
function browserStart() {
    browserSync.init({
        notify: false,
        server: {
            baseDir: 'dist/'
        }
    });
}
exports.browserStart = browserStart;


// Default
exports.default = gulp.series(
    gulp.parallel(
        html,
        styles,
        scripts
    ),
    gulp.parallel(
        images,
        fonts
    ),
    gulp.parallel(
        watch,
        browserStart
    )
);
