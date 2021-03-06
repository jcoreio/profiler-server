import { Stream, Transform } from 'stream'

export interface Profiler {
  /**
   * Starts the profiler with a new profile.
   * @param name Name for the profile. "undefined" if not defined.
   * @param recsamples Is true by default.
   */
  startProfiling(recsamples?: boolean): void
  startProfiling(name?: string, recsamples?: boolean): void
  /**
   * Stops the profiler for a specific profile.
   * @param name Name of the profile. "undefined" if not defined.
   */
  stopProfiling(name?: string): DeletableProfile
  deleteAllProfiles(): void
  startSamplingHeapProfiling(): void
  startSamplingHeapProfiling(interval: number, depth: number): void
  stopSamplingHeapProfiling(): Profile
  startTrackingHeapObjects(): void
  stopTrackingHeapObjects(): void
  takeSnapshot(control?: Function): DeletableProfile
  takeSnapshot(name?: string, control?: Function): DeletableProfile
}

export interface Profile {
  /**
   * Exports data of the profile.
   * @param dataReceiver Can be a stream or callback. If not defined or a stream, returns a new stream.
   */
  export(dataReceiver?: Stream): Transform
  export(dataReceiver: DataReceiver): void
}

export interface DeletableProfile extends Profile {
  delete(): void
}

/**
 * @param error Error if the CpuProfiler encountered an error
 * @param result Result as stringified JSON object
 */
type DataReceiver = (
  error: Error | undefined,
  result: string | undefined
) => void
