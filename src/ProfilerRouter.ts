import express from 'express'
import { Profiler } from './ProfilerInterface'
import emitted from 'p-event'

export default function ProfilerRouter({
  profiler,
}: {
  profiler: Profiler
}): express.Router {
  const router = express.Router()

  let cpuProfileEndTime = NaN
  let isCPUProfileInProgress = false

  router.get(
    '/cpu',
    async (req: express.Request, res: express.Response): Promise<void> => {
      const durationMillis = parseInt(req.query.durationMillis)
      if (!Number.isFinite(durationMillis)) {
        res.status(400).send(`durationMillis query parameter must be a number`)
      }
      if (isCPUProfileInProgress) {
        // Send the "I'm a Teapot" HTTP code
        res.status(418).json({
          error: `A CPU profile is already in progress. Please try again in about ${Math.ceil(
            (cpuProfileEndTime - Date.now()) / 1000
          )} seconds.`,
        })
        return
      }
      let profile
      try {
        isCPUProfileInProgress = true
        cpuProfileEndTime = Date.now() + durationMillis
        profiler.startProfiling()
        await Promise.race([
          new Promise(resolve => setTimeout(resolve, durationMillis)),
          emitted(req, 'abort'),
        ])
        profile = profiler.stopProfiling()
      } catch (error) {
        res.status(500).json({ error: error.message })
        return
      } finally {
        isCPUProfileInProgress = false
      }
      try {
        res.type('application/json; charset=utf-8').status(200)
        const finished = emitted(res, 'finish', { rejectionEvents: ['error'] })
        profile.export(res)
        await finished
      } finally {
        profile.delete()
      }
    }
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

  return router
}
