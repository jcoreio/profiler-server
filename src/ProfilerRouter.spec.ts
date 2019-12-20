/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, beforeEach } from 'mocha'
import { expect } from 'chai'
import express from 'express'
import profiler from 'v8-profiler-next'
import ProfilerRouter from './ProfilerRouter'
import request from 'supertest'

describe('ProfilerRouter', function() {
  this.timeout(5000)
  let app
  beforeEach(() => {
    app = express()
    app.use(ProfilerRouter({ profiler: profiler as any }))
  })
  describe('/cpu', function() {
    it('works', async function(): Promise<void> {
      const content = await request(app)
        .get('/cpu?durationMillis=1000')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
      expect(content.body.typeId).to.equal('CPU')
    })
    it('errors if durationMillis is missing', async function(): Promise<void> {
      const content = await request(app)
        .get('/cpu')
        .expect(400)
      expect(content.body.error).to.match(/durationMillis.*must be a number/)
    })
    it('errors if durationMillis is invalid', async function(): Promise<void> {
      const content = await request(app)
        .get('/cpu?durationMillis=a')
        .expect(400)
      expect(content.body.error).to.match(/durationMillis.*must be a number/)
    })
    it('errors if durationMillis is above limit', async function(): Promise<
      void
    > {
      const content = await request(app)
        .get('/cpu?durationMillis=900000')
        .expect(400)
      expect(content.body.error).to.match(/durationMillis.*must be <= 300000/)
    })
    it('errors if a profile is in progress', async function(): Promise<void> {
      request(app)
        .get('/cpu?durationMillis=2000')
        .then(x => x)
      const {
        body: { error },
      } = await request(app)
        .get('/cpu?durationMillis=1000')
        .expect('Content-Type', /json/)
        .expect(418)
      expect(error).to.match(/in progress/)
    })
  })
  describe('/heap', function() {
    it('works', async function(): Promise<void> {
      const content = await request(app)
        .get('/heap')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
      expect(content.body.snapshot).to.be.an.instanceOf(Object)
    })
  })
  describe('/sampleHeapProfiling', function() {
    it('works', async function(): Promise<void> {
      const content = await request(app)
        .get('/sampleHeapProfiling?durationMillis=2000')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200)
      expect(content.body.head).to.be.an.instanceOf(Object)
    })
  })
})
