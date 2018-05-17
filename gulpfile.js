var gulp = require('gulp'); //引入plugin插件，引入后可以用&直接调用以gulp开头的插件，而不需要提前require声明
var $ = require('gulp-load-plugins')();//并且在方法后加上双扣号，表示立即调用
var open = require('open');

var app = {
    srcPath: 'src/',   //源代码路径
    devPath: 'build/', //整合后的路径，开发路径
    prdPath: 'dist/'   //生产环境路径
};

gulp.task('lib', function(){
    gulp.src('bower_components/**/*')
        .pipe(gulp.dest(app.devPath + 'vender'))
        .pipe(gulp.dest(app.prdPath + 'vender'));
});

/*
* "src/view"  视图模板
* */
gulp.task('html',function(){
    gulp.src(app.srcPath + '/**/*.html')
        .pipe(gulp.dest(app.devPath))
        .pipe(gulp.dest(app.prdPath));
});

/*
* "src/data"下的json文件存假数据
* */
gulp.task('json',function(){
    gulp.src(app.srcPath + 'data/**/*.json')
        .pipe(gulp.dest(app.devPath + 'data'))
        .pipe(gulp.dest(app.prdPath + 'data'));
});

/*
* "src/style"  样式文件
* */
gulp.task('css', function(){
    gulp.src(app.srcPath + 'style/index.less')
        .pipe($.less())//因为有gulp-load-plugins插件，可以直接用$.less调用gulp-less插件
        .pipe(gulp.dest(app.devPath + 'css'))
        .pipe($.cssmin())//因为有gulp-load-plugins插件，可以直接用$.less调用gulp-cssmin插件
        .pipe(gulp.dest(app.prdPath + 'css'))//传入到线上路径之前先压缩css
});

/*
* "src/script"  js文件
* */
gulp.task('js', function(){
    gulp.src(app.srcPath + 'script/**/*.js')
        .pipe($.concat('index.js'))//通过gulp-concat插件将所有js文件合并成一个index.js
        .pipe(gulp.dest(app.devPath + 'js'))
        .pipe($.uglify())//流入线上环境路径之前，压缩js代码
        .pipe(gulp.dest(app.prdPath + 'js'));
});

/*
* "src/image"  图片文件
* */
gulp.task('image', function(){
    gulp.src(app.srcPath + 'image/**/*')
        .pipe(gulp.dest(app.devPath + 'image'))
        .pipe($.imagemin())//流入线上环境路径之前，压缩image图片
        .pipe(gulp.dest(app.prdPath + 'image'));
});

/*
* 每次发布的时候，可能需要把之前目录内的内容清除，避免旧的文件对新的内容有所影响。
* 需要在每次发布前删除dist和build目录
*
* */
gulp.task('clean', function(){
    gulp.src([app.devPath, app.prdPath])  //同时清除编码环境和线上环境的目录内容
        .pipe($.clean());
});

/*
* 这样在每次构建的时候，只需要执行build总任务就可以，会把build任务数组内的任务执行一遍
* */
gulp.task('build',['image','js','css','json','lib','html']);

/*
* 目的：一个serve任务启动服务，并监听端口，在文件内容发生变化的时候，自动刷新浏览器。
* 任务的总入口 通过gulp serve（gulp）指令调用，会调用build任务
* */
gulp.task('serve', ['build'], function() {//serve任务中引入build任务
    $.connect.server({  //启动一个服务器
        root: [app.devPath], //服务器从哪个路径开始读取，默认从开发路径读取
        livereload: true, //每当写完之后自动刷新浏览器，只支持高版本浏览器
        port: 3000 //服务器端口号
    });

    open('http://localhost:3000'); //服务起来后，自动打开页面

    //watch作用，当监控的内容发生变化，修改原文件的时候，自动执行构建任务
    gulp.watch('bower_components/**/*', ['lib']);
    gulp.watch(app.srcPath + '**/*.html', ['html']);
    gulp.watch(app.srcPath + 'data/**/*.json', ['json']);
    gulp.watch(app.srcPath + 'style/**/*.less', ['less']);
    gulp.watch(app.srcPath + 'script/**/*.js', ['js']);
    gulp.watch(app.srcPath + 'image/**/*', ['image']);
});
//为实现构建完成后，刷新浏览器，进行实时预览，
// 需要在每个任务最后添加.pipe($.connect.reload());
gulp.task('default', ['serve']);
//控制台使用gulp命令，就会调用default任务
//这里设定的default任务是serve，即gulp等同于gulp serve。