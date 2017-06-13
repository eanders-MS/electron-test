var gulp = require('gulp');
var clean = require('gulp-clean');
var tsc = require('gulp-tsc');
var sass = require('gulp-sass');

gulp.task('clean', function () {
    return gulp.src('./app/', { read: false })
        .pipe(clean());
});

gulp.task('build-css', function () {
    return gulp.src('./src/style/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./app/client'));
});

gulp.task('build-app', function () {
    return gulp.src(['src/**/*.ts', 'src/**/*.tsx'])
        .pipe(tsc({
            module: 'commonjs',
            moduleResolution: 'node',
            target: 'es6',
            sourceMap: true,
            noImplicitAny: false,
            noImplicitThis: true,
            noEmitOnError: true,
            noImplicitReturns: true,
            noFallthroughCasesInSwitch: true,
            noUnusedLocals: true,
            outDir: 'app',
            additionalTscParameters: ['--jsx', 'react'],
            exclude: [
                "node_modules",
                "app",
                "dist"
            ]
        }))
        .pipe(gulp.dest('app/'));
});

gulp.task('build-html', function () {
    return gulp.src('./src/**/*.html')
        .pipe(gulp.dest('app/'));
});

gulp.task('build-site', ['clean'], function () {
    return gulp.start([
        'build-html',
        'build-css',
        'build-app']);
});
