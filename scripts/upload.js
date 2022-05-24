var path = require("path");
var ch_process = require("child_process");
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

var colors = require("colors");
colors.setTheme({
    good: 'green',
    error: 'red'
});

// const paths = require('../config/paths');

const TRAVIS_TAG = process.env.TRAVIS_TAG;
const TRAVIS_PW = process.env.EASEMOB_NEXUS_PASSWORD;
console.log(colors.good(TRAVIS_TAG));

var cmdTpl = "curl -v " +
    "-F r={#mode} " +
    "-F hasPom=false " +
    "-F e=zip " +
    "-F g={#package} " +
    "-F a={#repo} " +
    "-F v={#ver} " +
    "-F p=zip " +
    "-F file=@{#target} " +
    "-u ci-deploy:{#pw} http://hk.nexus.op.easemob.com/nexus/service/local/artifact/maven/content\n";

var uploadCmd = cmdTpl
    .replace(/\{#mode\}/g, "releases")
    .replace(/\{#package\}/g, "com.easemob.kefu.fe.rs")
    .replace(/\{#repo\}/g, "mfkf-vec-webim")
    .replace(/\{#ver\}/g, TRAVIS_TAG)
    .replace(/\{#target\}/g, path.join(resolveApp('.'), "/build.zip"))
    .replace(/\{#pw\}/g, TRAVIS_PW);

var resultInfo = ch_process.execSync(uploadCmd).toString();
try {
    // 上传成功则返回 json
    JSON.parse(resultInfo);
    console.log(colors.good(resultInfo));
}
catch (e) {
    console.log(colors.error(resultInfo));
    process.exit(1);
}
