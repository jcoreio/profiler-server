/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, after } from 'mocha'
import { expect } from 'chai'
import ProfilerManager from './ProfilerManager'
import profiler from 'v8-profiler-next'
import path from 'path'
import fs from 'fs-extra'

const file = path.resolve(__dirname, '..', 'test', 'temp.snapshot')

describe('ProfilerManager', function() {
  describe('profileCPU', function() {
    it('works', async function() {
      this.timeout(5000)
      const manager = new ProfilerManager(profiler as any)
      await manager.profileCPU({ file, time: 1 })
      expect((await fs.stat(file)).size).to.be.above(0)
    })
    it('throws if a profile is in progress', async function() {
      this.timeout(5000)
      const manager = new ProfilerManager(profiler as any)
      const promise = manager.profileCPU({ file, time: 1 })
      try {
        expect(manager.profileCPU({ file, time: 1 })).to.be.rejected
      } finally {
        await promise
      }
    })
  })
  describe('takeSnapshot', function() {
    it('works', async function() {
      this.timeout(5000)
      const manager = new ProfilerManager(profiler as any)
      await manager.takeHeapSnapshot({ file })
      expect((await fs.stat(file)).size).to.be.above(0)
    })
    it('throws if a snapshot is in progress', async function() {
      this.timeout(5000)
      const manager = new ProfilerManager(profiler as any)
      const promise = manager.takeHeapSnapshot({ file })
      try {
        expect(manager.takeHeapSnapshot({ file })).to.be.rejected
      } finally {
        await promise
      }
    })
  })
  after(async function() {
    await fs.unlink(file)
  })
})
