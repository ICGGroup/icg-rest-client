// Generated by CoffeeScript 1.7.1
(function() {
  var http, url, _;

  url = require("url");

  http = require("http");

  _ = require("lodash");

  module.exports = function(apiBaseUrl, secToken) {
    var buildOptions, client, endsWith, getUrl, httpCall;
    endsWith = function(val, suffix) {
      if (val && suffix) {
        return val.indexOf(suffix, val.length - suffix.length) !== -1;
      }
    };
    getUrl = function(path) {
      if (endsWith(apiBaseUrl, "/")) {
        return apiBaseUrl + path;
      } else {
        return apiBaseUrl + "/" + path;
      }
    };
    httpCall = function(method, targetUrl, reqBody, headers, parse, callback) {
      var body, buffers, httpOpts, req, uri;
      uri = url.parse(targetUrl);
      httpOpts = {
        hostname: uri.hostname,
        port: uri.port || 80,
        path: uri.path,
        method: method,
        headers: headers
      };
      buffers = [];
      req = http.request(httpOpts, function(res) {
        res.on("data", function(chunk) {
          return buffers.push(chunk);
        });
        return res.on("end", function() {
          var e, err, response;
          response = {
            statusCode: res.statusCode,
            headers: headers,
            body: Buffer.concat(buffers)
          };
          if (res.statusCode >= 200 && res.statusCode <= 205) {
            if (parse) {
              err = null;
              try {
                return response.body = JSON.parse(response.body.toString());
              } catch (_error) {
                e = _error;
                return err = response.body.toString();
              } finally {
                callback(err, response);
              }
            } else {
              response.body = response.body.toString();
              return callback(null, response);
            }
          } else {
            response.body = response.body.toString();
            return callback(response);
          }
        });
      });
      req.on("error", function(e) {
        return callback(e);
      });
      if (reqBody && (method === "POST" || method === "PUT")) {
        if (!_.isString()) {
          body = JSON.stringify(reqBody);
        } else {
          body = reqBody;
        }
        req.write(body);
      }
      return req.end();
    };
    buildOptions = function(options) {
      var _base, _base1;
      options || (options = {});
      options.headers || (options.headers = {});
      (_base = options.headers)["Content-Type"] || (_base["Content-Type"] = "application/json");
      (_base1 = options.headers)["Accept"] || (_base1["Accept"] = "application/json");
      options.headers.secToken = secToken;
      if (!options.hasOwnProperty("parseJSON")) {
        options.parseJson = true;
      }
      return options;
    };
    client = {
      secToken: secToken,
      get: function(path, options, callback) {
        options = buildOptions(options);
        return httpCall("GET", getUrl(path), null, options.headers, options.parseJson, callback);
      },
      post: function(path, options, callback) {
        options = buildOptions(options);
        return httpCall("POST", getUrl(path), options.data, options.headers, options.parseJson, callback);
      },
      put: function(path, options, callback) {
        options = buildOptions(options);
        return httpCall("PUT", getUrl(path), options.data, options.headers, options.parseJson, callback);
      },
      "delete": function(path, options, callback) {
        options = buildOptions(options);
        return httpCall("DELETE", getUrl(path), null, options.headers, options.parseJson, callback);
      }
    };
    return client;
  };

}).call(this);
