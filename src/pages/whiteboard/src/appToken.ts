export const netlessToken = {
    sdkToken: "NETLESSSDK_YWs9WWRYMkxwNVdVX3lGSkJtVCZub25jZT1hYTc5NDU2MC1hZmY3LTExZWMtYjkxMC05NzczOTQ1OGNkY2Umcm9sZT0wJnNpZz0yM2I1OGExN2Y0OGM5OGVmZDliNTI1ZjcyODAyNGIzZTk1ODRkZGNlNDQ2NGZlNmNiZGVjY2E3ZmI2MGEzYzBm",
    appIdentifier: "h3ALIJUdEey3mDPnXITKOA/IUFMjMmzCMlICQ",
    // APPIDENTIFIER=h3ALIJUdEey3mDPnXITKOA/IUFMjMmzCMlICQ
// SDKTOKEN=NETLESSSDK_YWs9WWRYMkxwNVdVX3lGSkJtVCZub25jZT1hYTc5NDU2MC1hZmY3LTExZWMtYjkxMC05NzczOTQ1OGNkY2Umcm9sZT0wJnNpZz0yM2I1OGExN2Y0OGM5OGVmZDliNTI1ZjcyODAyNGIzZTk1ODRkZGNlNDQ2NGZlNmNiZGVjY2E3ZmI2MGEzYzBm
};

export type OSSConfigObjType = {
    accessKeyId: string;
    accessKeySecret: string;
    region: string;
    bucket: string;
    folder: string;
    prefix: string;
    // stsToken: string;
};

export const ossConfigObj: OSSConfigObjType = {
    // accessKeyId: process.env.AK!,
    // accessKeySecret: process.env.SK!,
    // region: process.env.OSSREGION!,
    // bucket: process.env.BUCKET!,
    // folder: process.env.FOLDER!,
    // prefix: process.env.PREFIX!,
    accessKeyId: "true",
    accessKeySecret: "true",
    region: "true",
    bucket: "true",
    folder: "true",
    prefix: "true",
    // accessKeyId: "true",
    // accessKeySecret: "true",
    // region: "true",
    // bucket: "true",
    // folder: "true",
    // prefix: "true",
};

export type H5OSSCOnfigObjType = {
    h5AccessKeyId: string;
    h5AccessKeySecret: string;
    h5Region: string;
    h5Bucket: string;
    h5Folder: string;
    h5SiteFolder: string;
    h5Prefix: string;
};

export const h5OssConfigObj = {
    h5AccessKeyId: process.env.H5AK!,
    h5AccessKeySecret: process.env.H5SK!,
    h5Region: process.env.H5REGION!,
    h5Bucket: process.env.H5BUCKET!,
    h5Folder: process.env.H5FOLDER!,
    h5SiteFolder: process.env.H5SITEFOLDER!,
    h5Prefix: process.env.H5PREFIX!,
    h5PrefixUs: "https://demo-h5-us.netless.group/",
};

export const h5DemoUrl = "https://demo-h5.netless.group/docs/";
export const h5DemoUrl2 = "https://demo-edu.cocos.com/agora-demo/index.html";
export const h5DemoUrl3 = "https://demo-h5.netless.group/dist2020/";
export const supplierUrl =
    "https://static.pre.wzomo.com/web/netless/index.html#/lesson1/page7?debug=1&role=teacher&origin=dev";
