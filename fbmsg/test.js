var crypto = require('crypto')
  , text = 'I love cupcakes'
  , key = 'abcdeg'
  , hash

hash = crypto.createHmac('sha1', key).update(text).digest('hex')
