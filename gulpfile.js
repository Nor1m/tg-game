const gulp = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');

const paths = {
    scripts: {
        src: 'front/src/js/**/*.js',
        dest: 'front/dist/js/'
    },
    styles: {
        src: 'front/src/css/**/*.css',
        dest: 'front/dist/css/'
    }
};

function minifyJs() {
    return gulp.src(paths.scripts.src)
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(paths.scripts.dest));
}

function minifyCss() {
    return gulp.src(paths.styles.src)
        .pipe(cleanCSS())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(paths.styles.dest));
}

const build = gulp.series(gulp.parallel(minifyJs, minifyCss));

exports.minifyJs = minifyJs;
exports.minifyCss = minifyCss;
exports.default = build;
