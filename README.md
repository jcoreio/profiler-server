# @jcoreio/profiler-server

[![CircleCI](https://circleci.com/gh/jcoreio/profiler-server.svg?style=svg)](https://circleci.com/gh/jcoreio/profiler-server)
[![Coverage Status](https://codecov.io/gh/jcoreio/profiler-server/branch/master/graph/badge.svg)](https://codecov.io/gh/jcoreio/profiler-server)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm version](https://badge.fury.io/js/%40jcoreio%2Fprofiler-server.svg)](https://badge.fury.io/js/%40jcoreio%2Fprofiler-server)

REST server for running v8-profiler and downloading snapshots

# API

## `ProfilerRouter({ profiler: Profiler, maxDurationMillis?: number | null })`

```js
import { ProfilerRouter } from '@jcoreio/profiler-server'
```

Creates an [ExpressJS Router](https://devdocs.io/express/index#express.router) that handles
the following routes:

### Options

- `profiler: Profiler` (**required**) - the profiler to use, for example `require('v8-profiler-next')`
- `maxDurationMillis: number` (_optional_, default: 5 minutes) - the maximum cpu profile duration to allow

### Example

```js
import { ProfilerRouter } from '@jcoreio/profiler-server'
import profiler from 'v8-profiler-next'
import express from 'express'
const app = express()
app.use(ProfilerRouter({ profiler }))
```

### `GET /cpu?durationMillis=<integer>`

Profiles the CPU for `durationMillis` milliseconds, and sends the CPU profile in the response.
**You must set the timeout of the client request to more than `durationMillis`** or the request
will time out.

If a CPU profile is already in progress, responds with 418.

### `GET /heap`

Takes a heap snapshot and sends it in the response.

### `GET /sampleHeapProfiling?durationMillis=<integer>`

Profiles heap sampling for `durationMillis` milliseconds, and sends the profile in the response.
**You must set the timeout of the client request to more than `durationMillis`** or the request
will time out.

If a heap sampling profile is already in progress, responds with 418.

#### Query parameters

- `durationMillis` (**required**) the amount of time to profile in milliseconds
- `interval` (**optional**) the sampling interval, in milliseconds (has no effect unless `depth` is also given)
- `depth` (**optional**) the sampling depth (has no effect unless `interval` is also given)

### `GET /gc`

Runs the garbage collector.
