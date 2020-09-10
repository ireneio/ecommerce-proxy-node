const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const axios = require('axios')
const fs = require('fs')
const FormData = require('form-data')
const multer = require('multer')

require('dotenv').config()
require('./cron').removeUploads()

const app = express()

// Constants
const BASE_URL = process.env.BASE_URL
const API_KEY = process.env.API_KEY
const CORS_URL = process.env.FE_URL

console.log('API KEY: ', API_KEY)
console.log('BASE URL: ', BASE_URL)
console.log('CORS URL: ', CORS_URL)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.disable('x-powered-by')

// Allow CORS
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', CORS_URL)
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, PUT, DELETE, OPTIONS'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, Content-Type, X-Auth-Token'
  )
  next()
})

// forward request
app.post('/auth', async function (req, res) {
  const { endpoint, data, method } = req.body

  const axiosConfig = {
    url: BASE_URL + endpoint,
    headers: { AuthorizedKey: API_KEY },
    method,
    data
  }
  try {
    const result = await axios.request(axiosConfig)

    console.log(`\nResponse From Endpoint: ${endpoint}\nResponse Body`)
    console.log(result.data)

    res.json(result.data)
  } catch (e) {
    console.log('Error ', e)
    res.status(500).send({ status: 500, statusText: e })
  }
})

const upload = multer({ dest: 'uploads/' })

app.post('/api', upload.array('files', 100), async function (req, res) {
  const { endpoint, token, method } = req.body
  if (!token) {
    res.status(403).send({ status: 403, statusText: 'Token Error' })
  }

  console.log('--------------------------------------------------------')
  console.log(`Request to Endpoint: /api: `)
  console.log('--------------------------------------------------------')
  console.log(`Request Body: `)
  console.log('--------------------------------------------------------')
  console.log(req.body)
  console.log('--------------------------------------------------------')

  if (req.files !== undefined) {
    console.log('--------------------------------------------------------')
    console.log(`Request Files: `)
    console.log('--------------------------------------------------------')
    console.log(req.files)
    console.log('--------------------------------------------------------')
  }

  const axiosConfig = {
    url: BASE_URL + endpoint,
    headers: {
      AccessToken: token,
      AuthorizedKey: API_KEY,
      'Accept-Language': 'zh-tw',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip'
    },
    method
  }
  try {
    if (method === 'post' || method === 'patch' || method === 'put') {
      if (req.files !== undefined) {
        const formData = new FormData()
        Object.keys(req.body).forEach((key) => {
          if (
            key !== 'endpoint' &&
            key !== 'key' &&
            key !== 'data' &&
            key !== 'method' &&
            key !== 'token' &&
            key !== 'files'
          ) {
            formData.append(key, Number(req.body[key]))
          }
        })
        Array.from(req.files).forEach((file) => {
          const stream = fs.createReadStream(`./uploads/${file.filename}`)
          formData.append('files', stream, {
            filename: file.originalname,
            contentType: file.mimetype,
            knownLength: file.size
          })
        })

        const requestObj = formData
        axiosConfig.headers['Content-Type'] = formData.getHeaders()[
          'content-type'
        ]
        axiosConfig.data = requestObj
      } else {
        axiosConfig.data = req.body.data
      }
    }
  } catch (e) {
    console.log(e)
  }

  try {
    console.log('--------------------------------------------------------')
    console.log(
      `Request Header sent to ${endpoint}: \n--------------------------------------------------------`
    )
    console.log(
      Object.keys(axiosConfig.headers).forEach((key) =>
        console.log('\x1b[1m', `${key}: ${axiosConfig.headers[key]}`)
      )
    )
    console.log('--------------------------------------------------------\n')
    console.log('\x1b[0m')

    const result = await axios.request(axiosConfig)

    console.log('--------------------------------------------------------')
    console.info(
      `Response From Endpoint: ${endpoint}\n--------------------------------------------------------\nResponse Body:\n--------------------------------------------------------`
    )

    console.log('\x1b[1m', result.data)

    // reset console color
    console.log('\x1b[0m')

    console.log('--------------------------------------------------------\n')

    res.json(result.data)
  } catch (e) {
    console.log('Error ', e)

    res.status(500).send({ status: 500, statusText: e.message })
  }
})

app.get('*', function (req, res) {
  res.sendStatus(403)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
