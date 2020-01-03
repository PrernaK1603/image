var gulp = require("gulp");
var htmlmin = require("gulp-htmlmin");
var path = require('path');
/*var requireDir = require("require-dir");
requireDir("./gulp-task");*/

var spritesmith = require("gulp.spritesmith");

var fs = require("fs");
var template = require("gulp-template");
var replaceQuotes = require("gulp-replace-quotes");
var rename = require("gulp-rename");
var querySelector = require("gulp-query-selector");

var CleanCSS = require("gulp-clean-css");

var gulp_css = require("./gulp-css.js");
var gulp_image = require("./gulp-image.js");
var gulp_js = require("./gulp-js.js");
var gulp_json = require("./gulp-json.js");

var inject = require("gulp-inject");

var concat = require("gulp-concat");
/*const jsdom = require("jsdom");
const { JSDOM } = jsdom;*/

var json = JSON.parse(fs.readFileSync("./config/config.json"));
var cheerio = require("gulp-cheerio");

/*gulp.task(
  "task1",
  gulp.parallel(
    "sprites",
    "optimize",
    "scss_css",
    "minify_css",
    "concate_css",
    "minify_js",
    "minify_json",
    "concate_js",
    "minify-html"
  )
);*/

//gulp.task("message", messageFn);

//gulp.task("headerComment", comment_jsFn);

//gulp.task("default", gulp.parallel( "task1"));

//gulp.task("default",gulp_css_req);

//https://api.jquery.com/html/#html2

//https://github.com/dlmanning/gulp-sass/issues/512

//gulp.task("default",defaultTask);

/*CREATE FINAL JS FILE*/
function js_createFn() {
  var body = fs.readFileSync(json.read_file.read_html).toString();
  var js = fs.readFileSync(json.read_file.read_js).toString();
  var css = fs.readFileSync(json.read_file.read_css).toString();

  return gulp
    .src(json.create_js.js_src)
    .pipe(template({ head: css, body: body, javascript: js }))
    .pipe(rename(json.create_js.rename))
    .pipe(gulp.dest(json.create_js.js_dest));
}

function html_contentFn() {
  return gulp
    .src(json.html_content.html_src)
    .pipe(querySelector(json.html_content.querySelect))
    .pipe(replaceQuotes())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename(json.html_content.rename))
    .pipe(gulp.dest(json.html_content.html_dest));
}

function cssFn() {
  return gulp
    .src(json.scss_css.append_css_src)
    .pipe(CleanCSS({ compatibility: "ie8" }))
    .pipe(rename(json.scss_css.rename))
    .pipe(gulp.dest(json.scss_css.css_dest));
}

function images_sprite(done){
  var spriteData = gulp.src(["src/assets/image/feature-check.png","src/assets/image/minus.png"]).pipe(
    spritesmith({
      imgName: "sprite.png",
      cssName: "sprite.scss"
    })
  );
  spriteData.img.pipe(gulp.dest("temp/assets/image"));
  spriteData.css.pipe(gulp.dest("temp/assets/image"));
  done();
}

gulp.task("image",images_sprite);

gulp.task("main", js_createFn);

gulp.task("html", html_contentFn);

gulp.task("css", cssFn);

gulp.task(
  "final",
  gulp.parallel(
    //gulp_css.cssTasks,
    gulp_image.imageTasks,
    //gulp_css.AllTasks
    //gulp_js.jsTasks,
    //gulp_json.jsonTasks
  )
);

var dom = require("jsdom");
//var JSDOM = dom.JSDOM;
const { JSDOM } = dom;
const dom1=new JSDOM();


var output = "src/index.html";
//var htmlTempFile = "src";
var HtmlInputArray = [
  {
    path: "src/components/header/header.html",
    extractFrom: "#header",
    css_path:"../src/components/styles/header.css"
  },
  {
    path: "src/components/body/body.html",
    extractFrom: "#image",
    css_path:"../src/components/styles/body.css"
  },
  {
    path: "src/components/footer/footer.html",
    extractFrom: "#footer",
    css_path:"../src/components/styles/footer.css"
  }
];
gulp.task("copy-html", function(done) {
  var HTMLContentList = [];
  //var HTMLSubContentList = [];
  for (var i = 0; i < HtmlInputArray.length; i++) {
    dom.JSDOM.fromFile(HtmlInputArray[i].path).then(
      function(config, htmlContentList, d) {
        htmlContentList.push(
          d.window.document.querySelector(config.extractFrom).innerHTML
        );
      }.bind(undefined, HtmlInputArray[i], HTMLContentList)
    );
  }
  dom.JSDOM.fromFile(output).then(
    function(htmlContentList, d) {
      d.window.document.querySelector("body").innerHTML += htmlContentList.join(
        "\n"
      );
      saveOutput(d.serialize(d.window.document.documentElement.innerHTML));
    }.bind(undefined, HTMLContentList)
  ).then(done);
});

function saveOutput(data) {
  fs.writeFile(output, data, function(error) {
    if (error) {
      throw error;
    }
    console.log("Copied portion to output successfully.");
  });
}

gulp.task("include-css-js", function(done) {
  return gulp
    .src("src/index.html")
    .pipe(
      cheerio(function($) {
        $("head").append(
          '<script src="../src/components/header/header.js"></script>'
        );
        $("head").append(
          '<link rel="stylesheet" href="../src/components/body/body.css">'
        );
        $("head").append(
          '<link rel="stylesheet" href="../src/components/header/header.css">'
        );
        $("head").append(
          '<link rel="stylesheet" href="../src/components/footer/footer.css">'
        );
      })
    )
    .pipe(gulp.dest("dest")) 
});

// gulp.task(
//   "default",
//   gulp.series("final", "html", "css", "main","copy-html","include-css-js")
// );

gulp.task('html', function() {
  return gulp.src([
      'src/components/header/header.html',
      'src/components/body/body.html', 
      'src/components/footer/footer.html'
  ])
  .pipe(concat('index.html'))
  .pipe(gulp.dest('result'));
  });
  

   /*gulp.task(
   "default",
  gulp.series("final", "copy-html","include-css-js")
);*/

//https://riptutorial.com/node-js/example/7706/checking-if-a-file-or-a-directory-exists

gulp.task("default",gulp.series("final"));
