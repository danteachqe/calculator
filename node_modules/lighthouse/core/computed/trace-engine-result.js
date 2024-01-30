/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as TraceEngine from '../lib/trace-engine.js';
import {makeComputedArtifact} from './computed-artifact.js';
import {CumulativeLayoutShift} from './metrics/cumulative-layout-shift.js';
import {ProcessedTrace} from './processed-trace.js';

/**
 * @fileoverview Processes trace with the shared trace engine.
 */
class TraceEngineResult {
  /**
   * @param {LH.TraceEvent[]} traceEvents
   */
  static async runTraceEngine(traceEvents) {
    const engine = new TraceEngine.TraceProcessor({
      AuctionWorklets: TraceEngine.TraceHandlers.AuctionWorklets,
      Initiators: TraceEngine.TraceHandlers.Initiators,
      LayoutShifts: TraceEngine.TraceHandlers.LayoutShifts,
      NetworkRequests: TraceEngine.TraceHandlers.NetworkRequests,
      Renderer: TraceEngine.TraceHandlers.Renderer,
      Samples: TraceEngine.TraceHandlers.Samples,
      Screenshots: TraceEngine.TraceHandlers.Screenshots,
    });
    await engine.parse(traceEvents);
    return engine.data;
  }

  /**
   * @param {{trace: LH.Trace}} data
   * @param {LH.Artifacts.ComputedContext} context
   * @return {Promise<LH.Artifacts.TraceEngineResult>}
   */
  static async compute_(data, context) {
    // In CumulativeLayoutShift.getLayoutShiftEvents we handle a bug in Chrome layout shift
    // trace events re: changing the viewport emulation resulting in incorrectly set `had_recent_input`.
    // Below, the same logic is applied to set those problem events' `had_recent_input` to false, so that
    // the trace engine will count them.
    // The trace events are copied-on-write, so the original trace remains unmodified.
    const processedTrace = await ProcessedTrace.request(data.trace, context);
    const layoutShiftEvents = new Set(
      CumulativeLayoutShift.getLayoutShiftEvents(processedTrace).map(e => e.event));

    // Avoid modifying the input array.
    const traceEvents = [...data.trace.traceEvents];
    for (let i = 0; i < traceEvents.length; i++) {
      let event = traceEvents[i];
      if (event.name !== 'LayoutShift') continue;
      if (!event.args.data) continue;

      const isConsidered = layoutShiftEvents.has(event);
      if (event.args.data.had_recent_input && isConsidered) {
        event = JSON.parse(JSON.stringify(event));
        // @ts-expect-error impossible for data to be missing.
        event.args.data.had_recent_input = false;
        traceEvents[i] = event;
      }
    }

    return TraceEngineResult.runTraceEngine(traceEvents);
  }
}

const TraceEngineResultComputed = makeComputedArtifact(TraceEngineResult, ['trace']);
export {TraceEngineResultComputed as TraceEngineResult};
