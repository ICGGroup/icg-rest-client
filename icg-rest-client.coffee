url = require("url")
http = require("http")
_ = require("lodash")

module.exports = (apiBaseUrl, secToken)->

  endsWith = (val, suffix)->
    if val and suffix
      val.indexOf(suffix, val.length - suffix.length) isnt -1;

  getUrl = (path)->
    if endsWith(apiBaseUrl, "/")
      apiBaseUrl + path
    else
      apiBaseUrl + "/" + path

  httpCall = (method, targetUrl, reqBody, headers, parse, callback)->
    uri = url.parse(targetUrl)
    httpOpts =
      hostname: uri.hostname
      port: uri.port || 80
      path: uri.path
      method: method
      headers: headers

    buffers = []
    req = http.request httpOpts, (res) ->
      res.on "data", (chunk) ->
        buffers.push(chunk)

      res.on "end", () ->
        response =
          statusCode: res.statusCode
          headers: headers
          body: Buffer.concat(buffers)

        if res.statusCode >= 200 and res.statusCode <= 205
          if parse
            err = null
            try
              response.body = JSON.parse(response.body.toString())
            catch e
              err = response.body.toString()
            finally
              callback err, response
          else
            response.body = response.body.toString()
            callback null, response

        else
          response.body = response.body.toString()
          callback response

    req.on "error", (e) ->
      callback(e)

    if reqBody and (method is "POST" or method is "PUT")
      if not _.isString()
        body = JSON.stringify(reqBody)
      else
        body = reqBody
      req.write(body)

    req.end()

  buildOptions = (options)->
    options ||= {}
    options.headers ||= {}
    options.headers["Content-Type"] ||= "application/json"
    options.headers["Accept"] ||= "application/json"
    options.headers.secToken = secToken
    if not options.hasOwnProperty("parseJSON")
      options.parseJson = true
    options

  client =
    secToken: secToken
    get: (path, options, callback)->
      options = buildOptions(options)
      httpCall "GET", getUrl(path), null, options.headers, options.parseJson, callback

    post: (path, options, callback)->
      options = buildOptions(options)
      httpCall "POST", getUrl(path), options.data, options.headers, options.parseJson, callback

    put: (path, options, callback)->
      options = buildOptions(options)
      httpCall "PUT", getUrl(path), options.data, options.headers, options.parseJson, callback

    delete: (path, options, callback)->
      options = buildOptions(options)
      httpCall "DELETE", getUrl(path), null, options.headers, options.parseJson, callback


  client
