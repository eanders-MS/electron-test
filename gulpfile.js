var gulp = require('gulp');

gulp.task('clean', function () {
    var clean = require('gulp-clean');
    return gulp.src('./app/', { read: false })
        .pipe(clean());
});

gulp.task('build-css', function () {
    var sass = require('gulp-sass');
    return gulp.src('./src/style/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./app/client'));
});

gulp.task('build-app', function () {
    var tsc = require('gulp-tsc');
    var tsconfig = require('./tsconfig.json');
    return gulp.src(['src/**/*.ts', 'src/**/*.tsx'])
        .pipe(tsc(tsconfig.compilerOptions))
        .pipe(gulp.dest('app/'));
});

gulp.task('build-html', function () {
    return gulp.src('./src/**/*.html')
        .pipe(gulp.dest('app/'));
});

gulp.task('build', ['clean'], function () {
    return gulp.start([
        'build-html',
        'build-css',
        'build-app']);
});
