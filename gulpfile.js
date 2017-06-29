var gulp = require('gulp');
var stream = require('stream');
var pjson = require('./package.json');

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
    console.info(`Building ${pjson.name} v${pjson.version}`);
    return gulp.start([
        'build-html',
        'build-css',
        'build-app']);
});

function setReleaseFilename(filename, options = {}) {
    options = Object.assign({}, {
        lowerCase: true,
        replaceWhitespace: true,
        replaceName: false,
        srcName: null,
        dstName: null
    },
    options);
    if (options.replaceName && options.srcName && options.dstName) {
        filename = filename.replace(options.srcName, options.dstName);
    }
    if (options.lowerCase) {
        filename = filename.toLowerCase();
    }
    if (options.replaceWhitespace) {
        filename = filename.replace(/\s/g, '-');
    }
    return filename;
}

function replaceEnvironmentVar(str, name, defaultValue = undefined) {
    if (process.env[name] === undefined && defaultValue === undefined)
        throw new Error(`Required environment variable missing: ${name}`);
    let value = (process.env[name] === undefined) ? defaultValue : process.env[name]
    return str.replace(new RegExp('\\${' + name + '}', 'g'), value);
}

function replaceBuildEnvironmentVars(obj) {
    let str = JSON.stringify(obj);
    str = replaceEnvironmentVar(str, "ELECTRON_MIRROR");
    return JSON.parse(str);
}

function replacePublishEnvironmentVars(obj) {
    let str = JSON.stringify(obj);
    str = replaceEnvironmentVar(str, "GH_TOKEN");
    return JSON.parse(str);
}

gulp.task('package:windows', function() {
    var rename = require('gulp-rename');
    var builder = require('electron-builder');
    var config = Object.assign({},
        replaceBuildEnvironmentVars(require('./build/build-common.json')),
        require('./build/build-windows.json'));
    return builder.build({
        targets: builder.Platform.WINDOWS.createTarget(["nsis", "zip"], builder.Arch.ia32, builder.Arch.x64),
        config
    }).then((filenames) => {
        gulp.src(filenames)
            .pipe(rename(function (path) {
                path.basename = setReleaseFilename(path.basename);
            }))
            .pipe(gulp.dest('./dist'));
    });
});

gulp.task('package:squirrel.windows', function() {
    var rename = require('gulp-rename');
    var builder = require('electron-builder');
    var config = Object.assign({},
        replaceBuildEnvironmentVars(require('./build/build-common.json')),
        require('./build/build-squirrel.windows.json'));
    return builder.build({
        targets: builder.Platform.WINDOWS.createTarget(["squirrel"], builder.Arch.x64),
        config
    }).then((filenames) => {
        gulp.src(filenames)
            .pipe(rename(function (path) {
                path.basename = setReleaseFilename(path.basename, {
                    lowerCase: false,
                    replaceName: true,
                    srcName: config.productName,
                    dstName: config.squirrelWindows.name
                });
            }))
            .pipe(gulp.dest('./dist'));
    });
});

gulp.task('package:mac', function() {
    var rename = require('gulp-rename');
    var builder = require('electron-builder');
    var config = Object.assign({},
        replaceBuildEnvironmentVars(require('./build/build-common.json')),
        require('./build/build-mac.json'));
    return builder.build({
        targets: builder.Platform.MAC.createTarget(["dmg", "zip"]),
        config
    }).then((filenames) => {
        gulp.src(filenames)
            .pipe(rename(function (path) {
                path.basename = setReleaseFilename(path.basename);
            }))
            .pipe(gulp.dest('./dist'));
    });
});

gulp.task('package:linux', function() {
    var rename = require('gulp-rename');
    var builder = require('electron-builder');
    var config = Object.assign({},
        replaceBuildEnvironmentVars(require('./build/build-common.json')),
        require('./build/build-linux.json'));
    return builder.build({
        targets: builder.Platform.LINUX.createTarget(["deb", "AppImage"], builder.Arch.ia32, builder.Arch.x64),
        config
    }).then((filenames) => {
        gulp.src(filenames)
            .pipe(rename(function (path) {
                path.basename = setReleaseFilename(path.basename);
            }))
            .pipe(gulp.dest('./dist'));
    });
});

function publishFiles(filelist) {
    var CancellationToken = require('electron-builder-http/out/CancellationToken').CancellationToken;
    var GitHubPublisher = require('electron-publish/out/gitHubPublisher').GitHubPublisher;
    var MultiProgress = require('electron-publish/out/multiProgress').MultiProgress;
    var publishConfig = replacePublishEnvironmentVars(require('./build/build-publish.json'));

    const context = {
        cancellationToken: new CancellationToken(),
        progress: new MultiProgress()
    };
    const publisher = new GitHubPublisher(
        context,
        publishConfig,
        pjson.version, {
            publish: "always",
            draft: true,
            prerelease: true
        });
    const errorlist = [];

    const uploads = filelist.map(file => {
        return publisher.upload(file)
            .catch((err) => {
                errorlist.push(err.response ? `Failed to upload ${file}, http status code ${err.response.statusCode}` : err);
                return Promise.resolve();
            });
    });

    return Promise.all(uploads)
    .then(() => errorlist.forEach((err) => console.error(err)));
}

gulp.task('publish:windows', function () {
    const filelist = [];
    filelist.push('./dist/latest.yml');
    filelist.push(`./dist/${pjson.name}-setup-${pjson.version}.exe`);
    filelist.push(`./dist/${pjson.name}-${pjson.version}-win.zip`);
    filelist.push(`./dist/${pjson.name}-${pjson.version}-ia32-win.zip`);

    return publishFiles(filelist);
});

gulp.task('publish:squirrel.windows', function () {
    var name = require('./build/build-squirrel.windows.json').squirrelWindows.name;

    const filelist = [];
    filelist.push('./dist/RELEASES');
    //filelist.push(`./dist/${name}-Setup-${pjson.version}.exe`);
    filelist.push(`./dist/${name}-${pjson.version}-full.nupkg`);

    return publishFiles(filelist);
});

gulp.task('publish:mac', function () {
    const filelist = [];

    return publishFiles(filelist);
});

gulp.task('publish:linux', function () {
    const filelist = [];

    return publishFiles(filelist);
});
