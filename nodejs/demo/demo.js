var STS = require('../sdk/sts');

// 配置参数
var config = {
    secretId: process.env.GROUP_SECRET_ID,   // 固定密钥
    secretKey: process.env.GROUP_SECRET_KEY,  // 固定密钥
    proxy: '',
    host: 'sts.tencentcloudapi.com', // 域名，非必须，默认为 sts.tencentcloudapi.com
    endpoint: 'sts.internal.tencentcloudapi.com', // 域名，非必须，与host二选一，默认为 sts.tencentcloudapi.com
    durationSeconds: 1800,  // 密钥有效期
    // 放行判断相关参数
    bucket: 'test-bucket-1253653367', // 换成你的 bucket
    region: 'ap-guangzhou', // 换成 bucket 所在地区
    allowPrefix: 'exampleobject' // 这里改成允许的路径前缀，可以根据自己网站的用户登录态判断允许上传的具体路径，例子： a.jpg 或者 a/* 或者 * (使用通配符*存在重大安全风险, 请谨慎评估使用)
};


var shortBucketName = config.bucket.substr(0 , config.bucket.lastIndexOf('-'));
var appId = config.bucket.substr(1 + config.bucket.lastIndexOf('-'));
var policy = {
    'version': '2.0',
    'statement': [{
        'action': [
            // 简单上传
            'name/cos:PutObject',
            'name/cos:PostObject',
            // 分片上传
            'name/cos:InitiateMultipartUpload',
            'name/cos:ListMultipartUploads',
            'name/cos:ListParts',
            'name/cos:UploadPart',
            'name/cos:CompleteMultipartUpload',
        ],
        'effect': 'allow',
        'principal': {'qcs': ['*']},
        'resource': [
            'qcs::cos:' + config.region + ':uid/' + appId + ':prefix//' + appId + '/' + shortBucketName + '/' + config.allowPrefix,
        ],
    }],
};

// getCredential
// 简单上传和分片，需要以下的权限，其他权限列表请看 https://cloud.tencent.com/document/product/436/31923
(function () {
    STS.getCredential({
        secretId: config.secretId,
        secretKey: config.secretKey,
        proxy: config.proxy,
        durationSeconds: config.durationSeconds,
        region: config.region,
        endpoint: config.endpoint,
        policy: policy,
    }, function (err, credential) {
        console.log('getCredential:');
        console.log(JSON.stringify(policy, null, '    '));
        console.log(err || credential);
    });
})();

// getRoleCredential
// 简单上传和分片，需要以下的权限，其他权限列表请看 https://cloud.tencent.com/document/product/436/31923
(function () {
  STS.getRoleCredential({
      secretId: config.secretId,
      secretKey: config.secretKey,
      proxy: config.proxy,
      durationSeconds: config.durationSeconds,
      region: config.region,
      endpoint: config.endpoint,
      policy: policy,
      roleArn: 'qcs::cam::uin/12345678:roleName/testRoleName', // 文档指引：https://cloud.tencent.com/document/product/1312/48197
  }, function (err, credential) {
      console.log('getRoleCredential:');
      console.log(JSON.stringify(policy, null, '    '));
      console.log(err || credential);
  });
})();


// getPolicy
// 获取临时密钥
(function () {
    var scope = [{
        action: 'name/cos:PutObject',
        bucket: config.bucket,
        region: config.region,
        prefix: 'exampleobject',
    }];
    var policy = STS.getPolicy(scope);
    STS.getCredential({
        secretId: config.secretId,
        secretKey: config.secretKey,
        proxy: config.proxy,
        policy: policy,
        durationSeconds: config.durationSeconds,
    }, function (err, credential) {
        console.log('getPolicy,getCredential:');
        console.log(JSON.stringify(policy, null, '    '));
        console.log(err || credential);
    });
})();
