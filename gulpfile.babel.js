import gulp from "gulp";
import gpug from "gulp-pug";
import { deleteSync } from "del";
import gsass from "gulp-sass";
import sass from "sass";
import webserver from "gulp-webserver";
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import browserify from "browserify";
import sourcemaps from "gulp-sourcemaps";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import ghPages from "gulp-gh-pages";
import GulpImage from "gulp-image";

const scss = gsass(sass);

const routes = {
  pug: {
    src: "src/*.pug",
    dest: "build/",
    watch: "src/**/*.pug",
  },
  scss: {
    src: "src/scss/style.scss",
    dest: "build/css",
    watch: "src/scss/**/*.scss",
  },
  js: {
    src: "src/js/app.js",
    dest: "build/js",
    watch: "src/js/**/*.js",
  },
  img: {
    src: "src/resources/images/*",
    dest: "build/resources/images",
    watch: "src/resources/images/*",
  },
};

const clean = async () => await deleteSync(["build"]);

const buildPug = () =>
  gulp.src(routes.pug.src).pipe(gpug()).pipe(gulp.dest(routes.pug.dest));

const buildScss = () =>
  gulp
    .src(routes.scss.src)
    .pipe(scss().on("error", scss.logError))
    .pipe(
      autoprefixer({
        flexbox: true,
        grid: "autoplace",
      })
    )
    .pipe(csso())
    .pipe(gulp.dest(routes.scss.dest));

const buildJs = () =>
  browserify(routes.js.src)
    .transform("babelify", { presets: ["@babel/preset-env"] })
    .bundle()
    .on("error", function (err) {
      console.error(err);
      this.emit("end");
    })
    .pipe(source("app.js"))
    .pipe(buffer())
    // .pipe(sourcemaps.init({ loadMaps: true }))
    // .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(routes.js.dest));

const buildImg = () =>
  gulp.src(routes.img.src).pipe(GulpImage()).pipe(gulp.dest(routes.img.dest));

const watch = () => {
  gulp.watch(routes.pug.watch, buildPug);
  gulp.watch(routes.scss.watch, buildScss);
  gulp.watch(routes.js.watch, buildJs);
};

const gitDeploy = () => gulp.src("./build/**/*").pipe(ghPages());
const cleanPublish = async () => await deleteSync([".publish"]);

const webServer = () => gulp.src("build").pipe(webserver({ livereload: true }));

const prepare = gulp.series([clean]);
export const build = gulp.series([
  prepare,
  buildPug,
  buildScss,
  buildJs,
  buildImg,
]);
const post = gulp.series([webServer, watch]);

export const dev = gulp.series([prepare, build, post]);
export const deploy = gulp.series([prepare, build, gitDeploy, cleanPublish]);
