import { serve } from '@hono/node-server';
import { app } from './app';
import { runIngestionPipeline } from './sync';
import { runEnrichmentPipeline } from './enrich';

// Detect if running in standard local Node.js environment
const isNodeEnv = typeof process !== 'undefined' && process.env && !process.env.CLOUDFLARE_WORKER;

// ============================================================================
// 1. LOCAL NODE.JS RUNTIME
// ============================================================================
if (isNodeEnv) {
  const PORT = parseInt(process.env.PORT || '4000', 10);

  console.log(`\n🚀 Local Development Server running on http://localhost:${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/health`);
  console.log(`👉 Jobs API:     http://localhost:${PORT}/api/jobs\n`);

  serve({
    fetch: app.fetch,
    port: PORT,
  });
}

// ============================================================================
// 2. CLOUDFLARE WORKERS RUNTIME
// ============================================================================
export default {
  // Receives incoming HTTP requests on Cloudflare Edge network
  fetch: app.fetch,

  // Handles automated background cron jobs on Cloudflare
  async scheduled(event: any, env: any, ctx: any) {
    console.log('[Cloudflare Cron Trigger] Scheduled job event fired:', event.cron);

    ctx.waitUntil(
      (async () => {
        try {
          console.log('🔄 Running scheduled ATS sync pipeline...');
          await runIngestionPipeline();

          console.log('⚡ Running scheduled enrichment pipeline...');
          await runEnrichmentPipeline();

          console.log('✅ Scheduled automated pipeline run complete.');
        } catch (error) {
          console.error('❌ Scheduled cron execution failed:', error);
        }
      })()
    );
  },
};