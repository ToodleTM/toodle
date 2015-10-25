'use strict';
var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var merge = require('merge-stream');

var app_root = '../'+process.env['SPRITE_ROOT'];
var app_temp = '../'+process.env['SPRITE_TMP'];

gulp.task('sprite', function() {
    var spriteData =  gulp.src([app_root+'/images/*.*', app_root +'/images/people/*.*', app_root +'/images/social/*.*']).pipe(spritesmith({
            imgName: 'sprites.png',
            cssName: 'sprites.scss'
        }));
    var imgPipe = spriteData.img.pipe(gulp.dest(app_temp));
    var sassPipe = spriteData.css.pipe(gulp.dest(app_temp));
    return merge(imgPipe, sassPipe);
});