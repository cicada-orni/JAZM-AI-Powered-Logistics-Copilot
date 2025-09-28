import { runWebhookJobWorker } from '../src/jobs/runner'

async function main() {
  const controller = new AbortController()
  const logger = console

  const shutdown = (signal: NodeJS.Signals) => {
    logger.info('[worker] received shutdown signal', { signal })
    controller.abort()
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  try {
    await runWebhookJobWorker({ logger, signal: controller.signal })
  } finally {
    process.off('SIGINT', shutdown)
    process.off('SIGTERM', shutdown)
  }
}

main().catch((error) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error)
  console.error('[worker] fatal error', { message })
  process.exit(1)
})
