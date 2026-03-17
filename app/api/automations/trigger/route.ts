import { NextRequest, NextResponse } from 'next/server';
import { processAutomationQueue } from '@/lib/automations/engine';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/automations/trigger:
 *   post:
 *     summary: Manually trigger automation engine
 *     description: |
 *       Processes the pending automation queue. 
 *       Requires Bearer token matching CRON_SECRET.
 *     tags: [Automations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Engine triggered
 *       401:
 *         description: Unauthorized
 */
export async function POST(req: NextRequest) {
  try {
    // In production, verify a secret token for security
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await processAutomationQueue();

    return NextResponse.json({ success: true, message: 'Automation engine triggered' });
  } catch (err: any) {
    logger.error('Failed to trigger automation engine:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
