var gulp = require('gulp');
var stream = require('stream');

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

function sanitizeFilenameForWeb(filename) {
    return filename.toLowerCase().replace(/\s/g, '-');
}

function replaceEnvironmentVar(str, name, required) {
    if (required && !process.env[name])
        throw new Error(`Required environment variable missing: ${name}`);
    return str.replace(new RegExp('\\${' + name + '}', 'g'), process.env[name]);
}

function replaceEnvironmentVars(obj) {
    let str = JSON.stringify(obj);
    str = replaceEnvironmentVar(str, "ELECTRON_CACHE", false);
    str = replaceEnvironmentVar(str, "ELECTRON_MIRROR", true);
    return JSON.parse(str);
}

gulp.task('package:windows', function() {
    var rename = require('gulp-rename');
    var builder = require('electron-builder');
    var config = Object.assign({},
        replaceEnvironmentVars(require('./build/build-common.json')),
        require('./build/build-windows.json'));
    return builder.build({
        targets: builder.Platform.WINDOWS.createTarget("nsis", builder.Arch.ia32, builder.Arch.x64),
        config
    }).then((filenames) => {
        gulp.src(filenames)
            .pipe(rename(function (path) {
                path.basename = sanitizeFilenameForWeb(path.basename);
            }))
            .pipe(gulp.dest('.'));
    });
});

gulp.task('package:mac', function() {
    var rename = require('gulp-rename');
    var builder = require('electron-builder');
    var config = Object.assign({},
        replaceEnvironmentVars(require('./build/build-common.json')),
        require('./build/build-mac.json'));
    return builder.build({
        targets: builder.Platform.MAC.createTarget(["dmg", "zip"]),
        config
    }).then((filenames) => {
        gulp.src(filenames)
            .pipe(rename(function (path) {
                path.basename = sanitizeFilenameForWeb(path.basename);
            }))
            .pipe(gulp.dest('./dist'));
    });
});

gulp.task('package:linux', function() {
    var rename = require('gulp-rename');
    var builder = require('electron-builder');
    var config = Object.assign({},
        replaceEnvironmentVars(require('./build/build-common.json')),
        require('./build/build-linux.json'));
    return builder.build({
        targets: builder.Platform.LINUX.createTarget("deb", "rpm"),
        config
    }).then((filenames) => {
        gulp.src(filenames)
            .pipe(rename(function (path) {
                path.basename = sanitizeFilenameForWeb(path.basename);
            }))
            .pipe(gulp.dest('.'));
    });
});
