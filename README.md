# @jcoreio/profiler-server

[![CircleCI](https://circleci.com/gh/jcoreio/profiler-server.svg?style=svg)](https://circleci.com/gh/jcoreio/profiler-server)
[![Coverage Status](https://codecov.io/gh/jcoreio/profiler-server/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/profiler-server)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/%40jcoreio%2Fprofiler-server.svg)](https://badge.fury.io/js/%40jcoreio%2Fprofiler-server)

REST server for running v8-profiler and downloading snapshots

# API

## `ProfilerRouter({ profiler: Profiler })`

```js
import { ProfilerRouter } from '@jcoreio/profiler-server'
```

Creates an [ExpressJS Router](https://devdocs.io/express/index#express.router) that handles
the following routes:

### `GET /cpu?durationMillis=<integer>`

Profiles the CPU for `durationMillis` milliseconds, and sends the CPU profile in the response.
**You must set the timeout of the client request to more than `durationMillis`** or the request
will time out.

If a CPU profile is already in progress, responds with 418.

### `GET /heap`

Takes a heap snapshot and sends it in the response.

### Example

```js
import { ProfilerRouter } from '@jcoreio/profiler-server'
import profiler from 'v8-profiler-next'
import express from 'express'
const app = express()
app.use(ProfilerRouter({ profiler }))
```