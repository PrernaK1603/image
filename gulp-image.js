var gulp = require("gulp");
var spritesmith = require("gulp.spritesmith");
var imagemin = require("gulp-imagemin");
var fs = require("fs");
var json_img = JSON.parse(fs.readFileSync("./config/config.json"));

/*function minify_image(done) {
    gulp
    .src("src/assets/image/*.png")
    .pipe(imagemin())
    .pipe(gulp.dest("temp/assets/image"));
    done();
}

function image_sprite(done) {
  var spriteData = gulp.src("src/assets/image/*.*").pipe(
    spritesmith({
      imgName: "sprite.png",
      cssName: "sprite.scss"
    })
  );
  spriteData.img.pipe(gulp.dest("temp/src/image"));
  spriteData.css.pipe(gulp.dest("temp/src/image"));
  done();
}*/

/*function image_sprite(done) {
  for (var i = 0; i < json_img.images.length; i++) {
    for (var j = 0; j < json_img.images[i].src_img.length; j++) {
      const path=json_img.images[i].src_dir + json_img.images[i].src_img[j]
      var spriteData = gulp.src(path).pipe(
        spritesmith({
          imgName: json_img.images[i].temp_img,
          cssName: json_img.images[i].temp_scss
        })
      );
      spriteData.img.pipe(gulp.dest(json_img.images[i].temp_img_dir));
      spriteData.css.pipe(gulp.dest(json_img.images[i].temp_scss_dir));
      done();
    }
  }
}

function minify_image(done) {
  for (var i = 0; i < json_img.images.length; i++) {
    for (var j = 0; j < json_img.images[i].src_img.length; j++) {
      const path=json_img.images[i].src_dir + json_img.images[i].src_img[j]
      gulp
    .src(path)
    .pipe(imagemin())
    .pipe(gulp.dest(json_img.images[i].temp_img_dir));
      done();
    }
  }
}*/

/* Change the directory after optimize the image*/

function minify_image(curr_task, temp) {
  for (var k = 0; k < curr_task.src_img.length; k++) {
    //a = temp || src_dir;
    var curr_path = curr_task.src_dir || temp;
    //var curr_path= temp || curr_task.src_dir;
    console.log(curr_path);
    var path = [
      {
        dir: curr_path,
        file_filter: curr_task.src_img[k]
      }
    ];
    gulp
      .src(path[0].dir + path[0].file_filter)
      .pipe(imagemin())
      .pipe(gulp.dest(curr_task.temp_img_dir));
    temp = curr_task.temp_img_dir;
    console.log(path);
  }
  return path;
}

function image_sprite(curr_task, temp) {
  for (var k = 0; k < curr_task.src_img.length; k++) {
    //var curr_path = curr_task.src_dir || temp;
    var curr_path=temp || curr_task.src_dir;
    console.log(curr_path);
    var path = [
      {
        dir: curr_path,
        file_filter: curr_task.src_img[k]
      },
      {
        dir: curr_task.temp_img_dir,
        file_filter: curr_task.temp_img
      },
      {
        dir: curr_task.temp_scss_dir,
        file_filter: curr_task.temp_scss
      }
    ];
    var spriteData = gulp.src(path[0].dir + path[0].file_filter).pipe(
      spritesmith({
        imgName: curr_task.temp_img,
        cssName: curr_task.temp_scss
      })
    );
    spriteData.img.pipe(gulp.dest(curr_task.temp_img_dir));
    spriteData.css.pipe(gulp.dest(curr_task.temp_scss_dir));
    temp = curr_task.temp_img_dir;
    console.log(path);
  }
  return path;
}

/* Distribution Function*/

function dist(d, curr_task) {
  for (var k = 0; k < d.length; d++) {
    console.log(d[k]);
    gulp.src(d[k].dir + d[k].file_filter).pipe(gulp.dest(curr_task.dist_img));
  }
}

/*Call both functions i.e minify_image and image_sprite*/

function loopTasks(done) {
  for (var i = 0; i < json_img.images.length; i++) {
    var store_obj = json_img.images[i].tasks;
    var curr_task = json_img.images[i];
    var temp = "";
    if (store_obj == undefined) {
      console.log("Entered an incorrect task, Please enter a correct task");
    } else {
      for (var j = 0; j < store_obj.length; j++) {
        var strFunc = store_obj[j];
        if (strFunc == "minify_image") {
          var d = minify_image(curr_task, temp);
          console.log(temp);
          console.log(d);
        } else if (strFunc == "image_sprite") {
          console.log(temp);
          var d = image_sprite(curr_task, temp);
          console.log(d);
        }
      }
      fs.access("./temp/assets/image/", function(error) {
        if (error) {
          console.log("Directory does not exist.");
        } else {
          dist(d, curr_task);
        }
      });
    }
    done();
  }
}

// const imageTasks = gulp.series(minify_image,image_sprite);

const imageTasks = gulp.series(loopTasks);
exports.imageTasks = imageTasks;

//gulp.task("sprites", image_sprite);

//gulp.task("optimize", minify_image);
