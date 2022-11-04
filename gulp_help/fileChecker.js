import through from "through2";
import browserify from "browserify";

export default () => {
  return through.obj((file, enc, cb) => {
    const filename = file.path;
    let compiled;

    browserify(filename)
      .transform("babelify", { presets: ["@babel/preset-env"] })
      .bundle()
      .on("error", (err) => {
        console.error(err);
        newErr = err;
        this.emit("end");
      })
      .on("data", (chunck) => {
        if (compiled === undefined) {
          compiled = chunck;
        } else {
          compiled = Buffer.concat([compiled, chunck]);
        }
      })
      .on("end", () => {
        file.contents = compiled;
        return cb(null, file);
      });
  });
};
