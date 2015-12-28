'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var rimraf = require('rimraf');
var browserSync = require('browser-sync');
var params = $.util.env;

var config = {
    src: {
        base: 'src',
        scripts: 'src/scripts',
        styles: 'src/styles'
    },
    dist: {
        base: 'dist',
    },
    demo: {
        base: 'dist/demo',
        scripts: 'dist/demo/scripts',
        styles: 'dist/demo/styles'
    },
    autoprefixer: ['last 2 versions', 'Explorer >= 8', 'Firefox >= 25']
};

gulp.task('styles', function () {

    var filter = $.filter(['initialize.*','!*.map']);

    return $.rubySass(config.src.styles + '/*.scss', {
            precision: 10,
            sourcemap: false,
            style: params.production ? 'compressed' : 'expanded',
            loadPath: ['node_modules']
        })
        .on('error', function(error) {
            console.log(error);
        })
        .pipe($.plumber())
        .pipe($.autoprefixer(config.autoprefixer))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(config.demo.styles))
        .pipe(filter)
        .pipe(gulp.dest(config.dist.base))
        .pipe($.cssmin())
        .pipe($.rename({suffix: '.min'}))
        .pipe(gulp.dest(config.dist.base))
        .pipe($.size({title: 'styles'}));
});

gulp.task('copy', function () {
    return gulp.src(config.src.styles + '/_initialize.scss')
        .pipe(gulp.dest(config.dist.base))
        .pipe($.size({title: 'copy'}));
});

gulp.task('html', function () {
    return gulp.src([config.src.base + '/**/*.html'])
        .pipe(gulp.dest(config.demo.base))
        .pipe($.size({title: 'html'}));
});

gulp.task('clean', function (cb) {
    rimraf(config.dist.base, cb);
});

gulp.task('watch', ['build'], function () {
    browserSync.init({
        server: {
            baseDir: './' + config.demo.base
        }
    });

    gulp.watch([config.src.images + '/**/*'], ['images']);
    gulp.watch([config.src.styles + '/**/*.scss'], ['styles']);
    gulp.watch([config.src.scripts + '/**/*.js'], ['scripts']);
    gulp.watch([config.src.base + '/**/*.html'], ['html']);

    browserSync.watch([config.demo.base + '/**/*', config.dist.base + '/**/*']).on('change', browserSync.reload);
});

gulp.task('build', ['styles', 'html', 'copy']);

gulp.task('deploy', ['build'], function() {
    params.message = params.m || params.message;

    var options = {};
    options.message = params.message || 'Update ' + new Date();

    return gulp.src(config.demo.base + '/**/*')
        .pipe($.ghPages(options));
});

gulp.task('default', ['build']);
