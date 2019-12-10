import { Profiler, Profile } from './ProfilerInterface'
import fs from 'fs-extra'
import path from 'path'
import emitted from 'p-event'

const CPU_PROFILE_ID = 'CPU_PROFILE'

async function exportSnapshot(profile: Profile, file: string): Promise<void> {
  await fs.mkdirs(path.dirname(file))
  const out = fs.createWriteStream(file, 'utf8')
  const finished = emitted(out, 'finish', { rejectionEvents: ['error'] })
  profile.export(out)
  await finished
}

export default class ProfilerManager {
  private readonly profiler: Profiler
  private isCPUProfileInProgress = false
  private isHeapSnapshotInProgress = false

  constructor(profiler: Profiler) {
    this.profiler = profiler
  }

  async profileCPU({
    time,
    file,
  }: {
    time: number
    file: string
  }): Promise<void> {
    if (this.isCPUProfileInProgress)
      throw Error('CPU profile is already in progress')
    try {
      this.isCPUProfileInProgress = true
      this.profiler.startProfiling(CPU_PROFILE_ID)
      console.log(`started profiling, will write profile to ${file}`) // eslint-disable-line no-console
      await new Promise(resolve => setTimeout(resolve, time * 1000))
      console.log('stopping profiling') // eslint-disable-line no-console
      const profile = this.profiler.stopProfiling(CPU_PROFILE_ID)
      console.log(`exporting cpu profile to ${file}`) // eslint-disable-line no-console
      await exportSnapshot(profile, file)
      console.log(`wrote cpu profile to ${file}`) // eslint-disable-line no-console
    } finally {
      this.isCPUProfileInProgress = false
    }
  }

  async takeHeapSnapshot({ file }: { file: string }): Promise<void> {
    if (this.isHeapSnapshotInProgress)
      throw Error('heap snapshot is already in progress')
    try {
      this.isHeapSnapshotInProgress = true
      console.log(`taking heap snapshot, will write to ${file}`) // eslint-disable-line no-console
      const snapshot = this.profiler.takeSnapshot()
      console.log(`exporting heap snapshot to ${file}`) // eslint-disable-line no-console
      await exportSnapshot(snapshot, file)
      console.log(`wrote heap snapshot to ${file}`) // eslint-disable-line no-console
    } finally {
      this.isHeapSnapshotInProgress = false
    }
  }
}
