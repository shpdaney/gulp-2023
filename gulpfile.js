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


// Paths
const srcFolder = './src'
const distFolder = './dist'
const buildFolder = './build'
const path = {
  src: { // Пути откуда брать исходники
    html: 'src/',
    js: 'src/scripts/',
    style: 'src/styles/',
    img: 'src/images/',
    fonts: 'src/fonts/'
  },
  dist: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: 'dist/',
    js: 'dist/scripts/',
    css: 'dist/css/',
    img: 'dist/images/',
    fonts: 'dist/fonts/'
  },
  build: { //Тут мы укажем куда складывать готовые после сборки файлы
    html: 'build/',
    js: 'build/scripts/',
    css: 'build/css/',
    img: 'build/image/',
    fonts: 'build/fonts/'
  },
};


// HTML
function html() {
  return gulp.src(path.src.html + '*.html')
    .pipe(gulp.dest(path.dist.html))
    .pipe(browserSync.stream());
}
exports.html = html;

function buildHTML() {
  return gulp.src(path.dist.html + '*.html')
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(path.build.html))
}
exports.buildHTML = buildHTML;


// Styles
function styles() {
	return gulp.src(path.src.style + 'index.{css,scss,sass}')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
        require('postcss-import'),
        require('postcss-media-minmax'),
        require('autoprefixer'),
    ]))
    .pipe(gulp.dest(path.dist.css))
    .pipe(browserSync.stream());
}
exports.styles = styles;

// Build Styles
function buildStyles() {
	return gulp.src(path.dist.css + 'index.css')
    .pipe(postcss([
        require('postcss-csso')
    ]))
    .pipe(gulp.dest(path.build.css))
}
exports.buildStyles = buildStyles;


// Scripts
function scripts () {
  return gulp.src(path.src.js + '*.js')
    // .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['@babel/preset-env']
    }))
    .pipe(concat('index.js'))
    // .pipe(uglify())
    // .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest(path.dist.js))
    .pipe(browserSync.stream());
}
exports.scripts = scripts;

// Build Scripts
function buildScripts () {
  return gulp.src(path.dist.js + '*.js')
    .pipe(uglify())
    .pipe(gulp.dest(path.build.js))
}
exports.buildScripts = buildScripts;


// Images
function images () {
  return gulp.src([
    path.src.img + '*.{png,jpg,jpeg}'
])
    .pipe(newer(path.dist.img))
    .pipe(webp())

    .pipe(gulp.src(path.src.img + '*.{png,jpg,jpeg}'))
    .pipe(newer(path.dist.img))
    .pipe(imagemin())

    .pipe(gulp.src(path.src.img + '*.svg'))
    .pipe(newer(path.dist.img))

    .pipe(gulp.dest(path.dist.img))
    .pipe(browserSync.stream());
}
exports.images = images;


// Fonts
function fonts () {
  return gulp.src(path.src.fonts + '**/*.{ttf,otf}')
    .pipe(newer(path.dist.fonts))
    .pipe(ttf2woff({
      ignoreExt: true,
    }))
    .pipe(gulp.dest(path.dist.fonts))

    .pipe(gulp.src(path.src.fonts + '**/*.{ttf,otf}'))
    .pipe(newer(path.dist.fonts))
    .pipe(ttf2woff2({
      ignoreExt: true,
    }))
    .pipe(gulp.dest(path.dist.fonts))
}
exports.fonts = fonts;

// Build Copy
function buildCopy() {
  return gulp.src([
    path.dist.fonts + '**/*.*',
    path.dist.img + '**/*.*'
  ], {
    base: distFolder
  })
  .pipe(gulp.dest(buildFolder))
}
exports.buildCopy = buildCopy;


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
function cleanFolders() {
  return gulp.src([
    distFolder,
    buildFolder
    ], {
      read: false
    })
    .pipe(clean())
}
exports.cleanFolders = cleanFolders;


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


// Build
exports.build = gulp.series(
  buildHTML,
  buildStyles,
  buildScripts,
  buildCopy
)

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
