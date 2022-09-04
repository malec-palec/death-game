/* eslint-disable no-console */
import { exec } from "child_process";
import fs from "fs-extra";
import gulp from "gulp";
import size from "gulp-size";
import zip from "gulp-zip";

const zipFile = "game.zip";

const clearOut = () => fs.emptyDir("./out");

const zipOut = () =>
  gulp
    .src(["./dist/*", "!./dist/*.json"])
    .pipe(size({ showFiles: true }))
    .pipe(zip(zipFile))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest("./out"));

const shrink = (cb) => {
  // -i 5000
  exec(`cd tools && advzip ../out/${zipFile} -z -4`, function (err, stdout, stderr) {
    console.log(stdout);
    cb(err);
  });
};

const reportSize = (cb) => {
  const stats = fs.statSync(`out/${zipFile}`);
  const sizeKb = stats.size / 1024;
  const ratio = (stats.size / (13 * 1024)) * 100;
  console.log(`Size:	${sizeKb.toFixed(2)} KB
Ratio:	${ratio.toFixed(2)} %`);
  cb();
};

export default gulp.series(clearOut, zipOut, shrink, reportSize);
