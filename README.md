# STAYFUN-FRONTEND-PROXY

## Specs

- Node v12.18.3
- Webpack 4

## Build Setup

### Production

```bash
# install dependencies
$ npm install
# build for production and launch server
$ npm run build:prod
$ npm run start
```

### Development

```bash
# install dependencies
$ npm install
# build with Webpack watch
$ npm run build
# serve with hot reload at http://localhost:8081
$ npm run dev
```

## Available Endpoints

### POST /api

Request Body

```json
{
  "endpoint": "/stayfun/api/endpoint",
  "method": "get",
  "token": "MAYO Acess Token",
  "data": {
    // request body
  }
}
```

Response Body

```json
{
  "syscode": "number | string",
  "sysmsg": "string",
  "data": {
    // response body
  }
}
```

### POST /auth

#### (Without STAYFUN Token)

Request Body

```json
{
  "endpoint": "/stayfun/api/endpoint",
  "method": "get",
  "data": {
    // request body
  }
}
```

Response Body

```json
{
  "syscode": "number | string",
  "sysmsg": "string",
  "data": {
    // response body
  }
}
```
