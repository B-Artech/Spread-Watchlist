const {src, dest, series, parallel, watch} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano')
const autoprefixer = require('gulp-autoprefixer')
const rename = require('gulp-rename')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
const kit = require('gulp-kit')
const sourcemaps = require('gulp-sourcemaps')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

const path = {
    html: './html/**/*.kit',
    sass: './src/sass/**/*.scss',
    js: './src/js/**/*.js',
    img: './src/img/*',
    sassDest: './dist/css',
    jsDist: './dist/js',
    imgDist: './dist/img',
}

function sassCompiler(done) {
    src(path.sass)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write())
    .pipe(dest(path.sassDest));
    done()
}

function javascript(done) {
    src(path.js)
    .pipe(sourcemaps.init())
    .pipe(babel({presets: ['@babel/env']}))
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write())
    .pipe(dest(path.jsDist));
    done()
}

function convertImages(done) {
    src(path.img)
    .pipe(imagemin())
    .pipe(dest(path.imgDist));
    done()
}

function handleKit(done) {
    src(path.html)
    .pipe(kit())
    .pipe(dest('./'));
    done()
}

function startBrowser(done) {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    done()
}

function watchForChanges(done) {
    watch('./*html').on("change", reload);
    watch([path.html, path.sass, path.js], parallel(handleKit, sassCompiler, javascript)).on("change", reload);
    watch(path.img, convertImages).on("change", reload);
    done()
}

const mainFunctions = parallel(handleKit, sassCompiler, javascript, convertImages)
exports.default = series(mainFunctions, startBrowser, watchForChanges)