'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.exec = undefined;
exports.default = exec;

var _child_process = require('child_process');

var isFunction = function isFunction(maybeFunction) {
  return typeof maybeFunction === 'function';
};

var expectedStderrForAction = {
  'cms.verify': /^verification successful/i,
  'genrsa': /^generating/i,
  'pkcs12': /^mac verified ok/i,
  'req.new': /^generating/i,
  'req.verify': /^verify ok/i,
  'rsa': /^writing rsa key/i,
  'smime.verify': /^verification successful/i,
  'x509.req': /^signature ok/i
};

function exec(action, maybeBuffer, maybeOptions, maybeCallback) {
  // Support option re-ordering
  var buffer = maybeBuffer;
  var options = maybeOptions;
  var callback = maybeCallback;
  if (!Buffer.isBuffer(buffer)) {
    callback = options;
    options = buffer;
    buffer = false;
  }
  if (isFunction(options)) {
    callback = options;
    options = {};
  }

  // Build initial params with passed action
  var params = action.split('.').map(function (value, key) {
    return !key ? value : '-' + value;
  });
  var lastParams = [];
  Object.keys(options).forEach(function (key) {
    if (options[key] === false) {
      lastParams.push(key);
    } else if (options[key] === true) {
      params.push('-' + key);
    } else {
      if (Array.isArray(options[key])) {
        options[key].forEach(function (value) {
          params.push('-' + key, value);
        });
      } else {
        params.push('-' + key, options[key]);
      }
    }
  });
  // Append last params
  params = params.concat(lastParams);

  // Actually spawn openssl command
  var openssl = (0, _child_process.spawn)('openssl', params);
  var outResult = [];
  var outLength = 0;
  var errResult = [];
  var errLength = 0;

  openssl.stdout.on('data', function (data) {
    outLength += data.length;
    outResult.push(data);
  });

  openssl.stderr.on('data', function (data) {
    errLength += data.length;
    errResult.push(data);
  });

  openssl.on('close', function (code) {
    var stdout = Buffer.concat(outResult, outLength);
    var stderr = Buffer.concat(errResult, errLength).toString('utf8');
    var expectedStderr = expectedStderrForAction[action];
    var err = null;

    if (code || stderr && expectedStderr && !stderr.match(expectedStderr)) {
      err = new Error(stderr);
      err.code = code;
    }

    if (isFunction(callback)) {
      callback.apply(null, [err, stdout]);
    }
  });

  if (buffer) {
    openssl.stdin.write(buffer);
  }

  openssl.stdin.end();

  return openssl;
}

exports.exec = exec;
//# sourceMappingURL=index.js.map