import { Stream, Transform } from 'stream'

export interface Profiler {
  startProfiling(recsamples?: boolean): void
  startProfiling(name?: string, recsamples?: boolean): void
  stopProfiling(name?: string): Profile
  deleteAllProfiles(): void
  startSamplingHeapProfiling(): void
  startSamplingHeapProfiling(interval: number, depth: number): void
  stopSamplingHeapProfiling(): Profile
  startTrackingHeapObjects(): void
  stopTrackingHeapObjects(): void
  takeSnapshot(control?: Function): Profile
  takeSnapshot(name?: string, control?: Function): Profile
}

export interface Profile {
  /**
   * Exports data of the profile.
   * @param dataReceiver Can be a stream or callback. If not defined or a stream, returns a new stream.
   */
  export(dataReceiver?: Stream): Transform
  export(dataReceiver: DataReceiver): void
}

/**
 * @param error Error if the CpuProfiler encountered an error
 * @param result Result as stringified JSON object
 */
type DataReceiver = (
  error: Error | undefined,
  result: string | undefined
) => void
