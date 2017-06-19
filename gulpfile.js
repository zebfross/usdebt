'use strict';

var exec = require('child_process').exec;
var gulp = require('gulp');
var mocha = require('gulp-mocha');

/**
 * Execute all tests.
 */
gulp.task('run-tests', function () {
  return gulp.src('scripts/test/test.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

var buildScript = 'build.bat';
gulp.task('package', function (cb) {
  exec(buildScript, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});