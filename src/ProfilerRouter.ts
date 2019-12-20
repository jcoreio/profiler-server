import express from 'express'
import { Profiler, Profile } from './ProfilerInterface'
import emitted from 'p-event'

export default function ProfilerRouter(options: {
  profiler: Profiler
  maxDurationMillis?: number | null
}): express.Router {
  const { profiler } = options
  const maxDurationMillis = options.maxDurationMillis || 5 * 60000
  const router = express.Router()

  function durationMethod(
    start: (req: express.Request) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
    stop: () => Profile
  ): (req: express.Request, res: express.Response) => Promise<void> {
    let profileEndTime = NaN
    let isProfileInProgress = false

    return async (
      req: express.Request,
      res: express.Response
    ): Promise<void> => {
      const durationMillis = parseInt(req.query.durationMillis)
      if (!Number.isFinite(durationMillis)) {
        res
          .status(400)
          .send({ error: `durationMillis query parameter must be a number` })
        return
      }
      if (durationMillis > maxDurationMillis) {
        res
          .status(400)
          .send({ error: `durationMillis must be <= ${maxDurationMillis}` })
        return
      }
      if (isProfileInProgress) {
        // Send the "I'm a Teapot" HTTP code
        res.status(418).json({
          error: `A profile is already in progress. Please try again in about ${Math.ceil(
            (profileEndTime - Date.now()) / 1000
          )} seconds.`,
        })
        return
      }
      let profile
      try {
        isProfileInProgress = true
        profileEndTime = Date.now() + durationMillis
        start(req)
        await Promise.race([
          new Promise(resolve => setTimeout(resolve, durationMillis)),
          emitted(req, 'abort'),
        ])
        profile = stop()
      } catch (error) {
        res.status(500).json({ error: error.message })
        return
      } finally {
        isProfileInProgress = false
      }
      try {
        res.type('application/json; charset=utf-8').status(200)
        const finished = emitted(res, 'finish', { rejectionEvents: ['error'] })
        profile.export(res)
        await finished
      } finally {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        if (typeof (profile as any).delete === 'function')
          (profile as any).delete()
        /* eslint-enable @typescript-eslint/no-explicit-any */
      }
    }
  }

  router.get(
    '/cpu',
    durationMethod(
      () => profiler.startProfiling(),
      () => profiler.stopProfiling()
    )
  )

  router.get(
    '/heap',
    async (req: express.Request, res: express.Response): Promise<void> => {
      let snapshot
      try {
        snapshot = profiler.takeSnapshot()
      } catch (error) {
        res.status(500).json({ error: error.message })
        return
      }

      try {
        res.type('application/json; charset=utf-8').status(200)
        const finished = emitted(res, 'finish', { rejectionEvents: ['error'] })
        snapshot.export(res)
        await finished
      } finally {
        snapshot.delete()
      }
    }
  )

  router.get(
    '/sampleHeapProfiling',
    durationMethod(
      (req: express.Request) => {
        const interval = Number(req.query.interval)
        const depth = Number(req.query.depth)
        if (Number.isFinite(interval) && Number.isFinite(depth)) {
          profiler.startSamplingHeapProfiling(interval, depth)
        } else {
          profiler.startSamplingHeapProfiling()
        }
      },
      () => profiler.stopSamplingHeapProfiling()
    )
  )

  return router
}
