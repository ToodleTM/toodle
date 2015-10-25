var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var merge = require('merge-stream');

gulp.task('sprite', function() {
    var spriteData =  gulp.src(['../app/images/*.*', '../app/images/people/*.*', '../app/images/social/*.*']).pipe(spritesmith({
            imgName: 'sprites.png',
            cssName: 'sprites.scss',
        }));
    var imgPipe = spriteData.img.pipe(gulp.dest('./'));
    var sassPipe = spriteData.css.pipe(gulp.dest('./'));
    return merge(imgPipe, sassPipe);
});
