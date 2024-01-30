/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {Protocol} from 'devtools-protocol';
import {TraceEvent} from './artifacts.js';

// This part is just the subset of types we need for the main API.

type LayoutShiftTraceEvent = TraceEvent & {
    args: {data: {
        impacted_nodes: TraceImpactedNode[],
        weighted_score_delta: number;
    }},
}

export class TraceProcessor {
    constructor(handlers: any);
    createWithAllHandlers(): TraceProcessor;
    parse(traceEvents: any[]): Promise<void>;
    data: {
        LayoutShifts: {
            clusters: Array<{
                events: LayoutShiftTraceEvent[];
            }>;
            sessionMaxScore: number;
        };
    };
}

export const TraceHandlers: Record<string, any>;

interface CSSDimensions {
    width?: string;
    height?: string;
    aspectRatio?: string;
}

type RootCauseRequest = {
    request: TraceEventSyntheticNetworkRequest;
    initiator?: Protocol.Network.Initiator;
}

export type LayoutShiftRootCauses = {
    fontChanges: Array<RootCauseRequest & {fontFace: Protocol.CSS.FontFace}>;
    iframes: Array<{
        iframe: Protocol.DOM.Node;
    }>;
    renderBlockingRequests: Array<RootCauseRequest>;
    unsizedMedia: Array<{
        node: Protocol.DOM.Node;
        authoredDimensions?: CSSDimensions;
        computedDimensions: CSSDimensions;
    }>;
};

export class RootCauses {
    constructor(protocolInterface: any);

    layoutShifts: {rootCausesForEvent(data: any, event: any): Promise<LayoutShiftRootCauses>};
}

// The rest of this file is pulled from CDT frontend
// https://source.chromium.org/chromium/chromium/src/+/main:third_party/devtools-frontend/src/front_end/models/trace/types/TraceEvents.ts;l=297?q=TraceEventSyntheticNetworkRequest&ss=chromium

// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export type MicroSeconds = number&{_tag: 'MicroSeconds'};

export type MilliSeconds = number&{_tag: 'MilliSeconds'};
export type Seconds = number&{_tag: 'Seconds'};

export const enum TimeUnit {
  MICROSECONDS = 0,
  MILLISECONDS = 1,
  SECONDS = 2,
  MINUTES = 3,
}

// Other types.

export interface TraceWindow<TimeFormat extends MicroSeconds|MilliSeconds> {
  min: TimeFormat;
  max: TimeFormat;
  range: TimeFormat;
}

export type TraceWindowMicroSeconds = TraceWindow<MicroSeconds>;
export type TraceWindowMilliSeconds = TraceWindow<MilliSeconds>;

// Trace Events.
export const enum Phase {
  // Standard
  BEGIN = 'B',
  END = 'E',
  COMPLETE = 'X',
  INSTANT = 'I',
  COUNTER = 'C',

  // Async
  ASYNC_NESTABLE_START = 'b',
  ASYNC_NESTABLE_INSTANT = 'n',
  ASYNC_NESTABLE_END = 'e',
  ASYNC_STEP_INTO = 'T',
  ASYNC_BEGIN = 'S',
  ASYNC_END = 'F',
  ASYNC_STEP_PAST = 'p',

  // Flow
  FLOW_START = 's',
  FLOW_STEP = 't',
  FLOW_END = 'f',

  // Sample
  SAMPLE = 'P',

  // Object
  OBJECT_CREATED = 'N',
  OBJECT_SNAPSHOT = 'O',
  OBJECT_DESTROYED = 'D',

  // Metadata
  METADATA = 'M',

  // Memory Dump
  MEMORY_DUMP_GLOBAL = 'V',
  MEMORY_DUMP_PROCESS = 'v',

  // Mark
  MARK = 'R',

  // Clock sync
  CLOCK_SYNC = 'c',
}

export const enum TraceEventScope {
  THREAD = 't',
  PROCESS = 'p',
  GLOBAL = 'g',
}

export interface TraceEventData {
  args?: TraceEventArgs;
  cat: string;
  name: string;
  ph: Phase;
  pid: ProcessID;
  tid: ThreadID;
  tts?: MicroSeconds;
  ts: MicroSeconds;
  tdur?: MicroSeconds;
  dur?: MicroSeconds;
}

export interface TraceEventArgs {
  data?: TraceEventArgsData;
}

export interface TraceEventArgsData {
  stackTrace?: TraceEventCallFrame[];
  navigationId?: string;
  frame?: string;
}

export interface TraceEventCallFrame {
  codeType?: string;
  functionName: string;
  scriptId: number;
  columnNumber: number;
  lineNumber: number;
  url: string;
}

export interface TraceFrame {
  frame: string;
  name: string;
  processId: ProcessID;
  url: string;
  parent?: string;
}

// Sample events.

export interface TraceEventSample extends TraceEventData {
  ph: Phase.SAMPLE;
}

/**
 * A fake trace event created to support CDP.Profiler.Profiles in the
 * trace engine.
 */
export interface SyntheticTraceEventCpuProfile extends TraceEventInstant {
  name: 'CpuProfile';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      cpuProfile: Protocol.Profiler.Profile,
    },
  };
}

export interface TraceEventProfile extends TraceEventSample {
  name: 'Profile';
  id: ProfileID;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      startTime: MicroSeconds,
    },
  };
}

export interface TraceEventProfileChunk extends TraceEventSample {
  name: 'ProfileChunk';
  id: ProfileID;
  args: TraceEventArgs&{
    // `data` is only missing in "fake" traces
    data?: TraceEventArgsData & {
      cpuProfile?: TraceEventPartialProfile,
      timeDeltas?: MicroSeconds[],
      lines?: MicroSeconds[],
    },
  };
}

export interface TraceEventPartialProfile {
  nodes?: TraceEventPartialNode[];
  samples: CallFrameID[];
}

export interface TraceEventPartialNode {
  callFrame: TraceEventCallFrame;
  id: CallFrameID;
  parent?: CallFrameID;
}

// Complete events.

export interface TraceEventComplete extends TraceEventData {
  ph: Phase.COMPLETE;
  dur: MicroSeconds;
}

export interface TraceEventFireIdleCallback extends TraceEventComplete {
  name: KnownEventName.FireIdleCallback;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      allottedMilliseconds: MilliSeconds,
      frame: string,
      id: number,
      timedOut: boolean,
    },
  };
}

export interface TraceEventDispatch extends TraceEventComplete {
  name: 'EventDispatch';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      type: string,
    },
  };
}

export interface TraceEventParseHTML extends TraceEventComplete {
  name: 'ParseHTML';
  args: TraceEventArgs&{
    beginData: {
      frame: string,
      startLine: number,
      url: string,
    },
    endData?: {
      endLine: number,
    },
  };
}

export interface TraceEventBegin extends TraceEventData {
  ph: Phase.BEGIN;
}

export interface TraceEventEnd extends TraceEventData {
  ph: Phase.END;
}

/**
 * This denotes a complete event created from a pair of begin and end
 * events. For practicality, instead of always having to look for the
 * end event corresponding to a begin event, we create a synthetic
 * complete event that comprises the data of both from the beginning in
 * the RendererHandler.
 */
export type TraceEventSyntheticCompleteEvent = TraceEventComplete;

export interface TraceEventEventTiming extends TraceEventData {
  ph: Phase.ASYNC_NESTABLE_START|Phase.ASYNC_NESTABLE_END;
  name: KnownEventName.EventTiming;
  id: string;
  args: TraceEventArgs&{
    frame: string,
    data?: TraceEventArgsData&{
      cancelable: boolean,
      duration: MilliSeconds,
      processingEnd: MilliSeconds,
      processingStart: MilliSeconds,
      timeStamp: MilliSeconds,
      interactionId?: number, type: string,
    },
  };
}

export interface TraceEventEventTimingBegin extends TraceEventEventTiming {
  ph: Phase.ASYNC_NESTABLE_START;
}
export interface TraceEventEventTimingEnd extends TraceEventEventTiming {
  ph: Phase.ASYNC_NESTABLE_END;
}

export interface TraceEventGPUTask extends TraceEventComplete {
  name: 'GPUTask';
  args: TraceEventArgs&{
    data?: TraceEventArgsData & {
      /* eslint-disable @typescript-eslint/naming-convention */
      renderer_pid: ProcessID,
      used_bytes: number,
      /* eslint-enable @typescript-eslint/naming-convention */
    },
  };
}

export interface TraceEventSyntheticNetworkRedirect {
  url: string;
  priority: string;
  requestMethod?: string;
  ts: MicroSeconds;
  dur: MicroSeconds;
}

// TraceEventProcessedArgsData is used to store the processed data of a network
// request. Which is used to distinguish from the date we extract from the
// trace event directly.
interface TraceEventSyntheticArgsData {
  dnsLookup: MicroSeconds;
  download: MicroSeconds;
  downloadStart: MicroSeconds;
  finishTime: MicroSeconds;
  initialConnection: MicroSeconds;
  isDiskCached: boolean;
  isHttps: boolean;
  isMemoryCached: boolean;
  isPushedResource: boolean;
  networkDuration: MicroSeconds;
  processingDuration: MicroSeconds;
  proxyNegotiation: MicroSeconds;
  queueing: MicroSeconds;
  redirectionDuration: MicroSeconds;
  requestSent: MicroSeconds;
  sendStartTime: MicroSeconds;
  ssl: MicroSeconds;
  stalled: MicroSeconds;
  totalTime: MicroSeconds;
  waiting: MicroSeconds;
}

export interface TraceEventSyntheticNetworkRequest extends TraceEventComplete {
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      syntheticData: TraceEventSyntheticArgsData,
      // All fields below are from TraceEventsForNetworkRequest,
      // Required fields
      decodedBodyLength: number,
      encodedDataLength: number,
      frame: string,
      fromServiceWorker: boolean,
      host: string,
      mimeType: string,
      pathname: string,
      search: string,
      priority: Priority,
      initialPriority: Priority,
      protocol: string,
      redirects: TraceEventSyntheticNetworkRedirect[],
      renderBlocking: RenderBlocking,
      requestId: string,
      requestingFrameUrl: string,
      statusCode: number,
      url: string,
      // Optional fields
      requestMethod?: string,
      timing?: TraceEventResourceReceiveResponseTimingData,
    },
  };
  cat: 'loading';
  name: 'SyntheticNetworkRequest';
  ph: Phase.COMPLETE;
  dur: MicroSeconds;
  tdur: MicroSeconds;
  ts: MicroSeconds;
  tts: MicroSeconds;
  pid: ProcessID;
  tid: ThreadID;
}

export const enum AuctionWorkletType {
  BIDDER = 'bidder',
  SELLER = 'seller',
  // Not expected to be used, but here as a fallback in case new types get
  // added and we have yet to update the trace engine.
  UNKNOWN = 'unknown',
}

export interface SyntheticAuctionWorkletEvent extends TraceEventInstant {
  name: 'SyntheticAuctionWorkletEvent';
  // The PID that the AuctionWorklet is running in.
  pid: ProcessID;
  // URL
  host: string;
  // An ID used to pair up runningInProcessEvents with doneWithProcessEvents
  target: string;
  type: AuctionWorkletType;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      // There are two threads for a worklet that we care about, so we gather
      // the thread_name events so we can know the PID and TID for them (and
      // hence display the right events in the track for each thread)
      utilityThread: TraceEventThreadName,
      v8HelperThread: TraceEventThreadName,
    } &
        (
              // This type looks odd, but this is because these events could either have:
              // 1. Just the DoneWithProcess event
              // 2. Just the RunningInProcess event
              // 3. Both events
              // But crucially it cannot have both events missing, hence listing all the
              // allowed cases.
              // Clang is disabled as the combination of nested types and optional
              // properties cause it to weirdly indent some of the properties and make it
              // very unreadable.
              // clang-format off
              {
                runningInProcessEvent: TraceEventAuctionWorkletRunningInProcess,
                doneWithProcessEvent: TraceEventAuctionWorkletDoneWithProcess,
              } |
              {
                runningInProcessEvent?: TraceEventAuctionWorkletRunningInProcess,
                doneWithProcessEvent: TraceEventAuctionWorkletDoneWithProcess,
              } |
              {
                doneWithProcessEvent?: TraceEventAuctionWorkletDoneWithProcess,
                runningInProcessEvent: TraceEventAuctionWorkletRunningInProcess,

              }),
    // clang-format on
  };
}
export interface TraceEventAuctionWorkletRunningInProcess extends TraceEventData {
  name: 'AuctionWorkletRunningInProcess';
  ph: Phase.INSTANT;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      host: string,
      pid: ProcessID,
      target: string,
      type: AuctionWorkletType,
    },
  };
}
export interface TraceEventAuctionWorkletDoneWithProcess extends TraceEventData {
  name: 'AuctionWorkletDoneWithProcess';
  ph: Phase.INSTANT;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      host: string,
      pid: ProcessID,
      target: string,
      type: AuctionWorkletType,
    },
  };
}

// Snapshot events.

export interface TraceEventSnapshot extends TraceEventData {
  args: TraceEventArgs&{
    snapshot: string,
  };
  name: 'Screenshot';
  cat: 'disabled-by-default-devtools.screenshot';
  ph: Phase.OBJECT_SNAPSHOT|Phase.INSTANT;  // In Oct 2023, the phase was changed to Instant. crbug.com/798755
}

// Animation events.

export interface TraceEventAnimation extends TraceEventData {
  args: TraceEventArgs&{
    id?: string,
    name?: string,
    nodeId?: number,
    nodeName?: string,
    state?: string,
    compositeFailed?: number,
    unsupportedProperties?: string[],
  };
  name: 'Animation';
  id2?: {
    local?: string,
  };
  ph: Phase.ASYNC_NESTABLE_START|Phase.ASYNC_NESTABLE_END;
}

// Metadata events.

export interface TraceEventMetadata extends TraceEventData {
  ph: Phase.METADATA;
  args: TraceEventArgs&{
    name?: string,
    uptime?: string,
  };
}

export interface TraceEventThreadName extends TraceEventMetadata {
  name: KnownEventName.ThreadName;
  args: TraceEventArgs&{
    name?: string,
  };
}

export interface TraceEventProcessName extends TraceEventMetadata {
  name: 'process_name';
}

// Mark events.

export interface TraceEventMark extends TraceEventData {
  ph: Phase.MARK;
}

export interface TraceEventNavigationStart extends TraceEventMark {
  name: 'navigationStart';
  args: TraceEventArgs&{
    data?: TraceEventArgsData & {
      documentLoaderURL: string,
      isLoadingMainFrame: boolean,
      // isOutermostMainFrame was introduced in crrev.com/c/3625434 and exists
      // because of Fenced Frames
      // [github.com/WICG/fenced-frame/tree/master/explainer].
      // Fenced frames introduce a situation where isLoadingMainFrame could be
      // true for a navigation, but that navigation be within an embedded "main
      // frame", and therefore it wouldn't be on the top level main frame.
      // In situations where we need to distinguish that, we can rely on
      // isOutermostMainFrame, which will only be true for navigations on the
      // top level main frame.

      // This flag is optional as it was introduced in May 2022; so users
      // reasonably may import traces from before that date that do not have
      // this field present.
      isOutermostMainFrame?: boolean, navigationId: string,
    },
        frame: string,
  };
}

export interface TraceEventFirstContentfulPaint extends TraceEventMark {
  name: 'firstContentfulPaint';
  args: TraceEventArgs&{
    frame: string,
    data?: TraceEventArgsData&{
      navigationId: string,
    },
  };
}

export interface TraceEventFirstPaint extends TraceEventMark {
  name: 'firstPaint';
  args: TraceEventArgs&{
    frame: string,
    data?: TraceEventArgsData&{
      navigationId: string,
    },
  };
}

export type PageLoadEvent = TraceEventFirstContentfulPaint|TraceEventMarkDOMContent|TraceEventInteractiveTime|
    TraceEventLargestContentfulPaintCandidate|TraceEventLayoutShift|TraceEventFirstPaint|TraceEventMarkLoad|
    TraceEventNavigationStart;

export interface TraceEventLargestContentfulPaintCandidate extends TraceEventMark {
  name: 'largestContentfulPaint::Candidate';
  args: TraceEventArgs&{
    frame: string,
    data?: TraceEventArgsData&{
      candidateIndex: number,
      isOutermostMainFrame: boolean,
      isMainFrame: boolean,
      navigationId: string,
      nodeId: Protocol.DOM.BackendNodeId,
      type?: string,
    },
  };
}
export interface TraceEventLargestImagePaintCandidate extends TraceEventMark {
  name: 'LargestImagePaint::Candidate';
  args: TraceEventArgs&{
    frame: string,
    data?: TraceEventArgsData&{
      candidateIndex: number,
      imageUrl: string,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      DOMNodeId: Protocol.DOM.BackendNodeId,
    },
  };
}
export interface TraceEventLargestTextPaintCandidate extends TraceEventMark {
  name: 'LargestTextPaint::Candidate';
  args: TraceEventArgs&{
    frame: string,
    data?: TraceEventArgsData&{
      candidateIndex: number,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      DOMNodeId: Protocol.DOM.BackendNodeId,
    },
  };
}

export interface TraceEventInteractiveTime extends TraceEventMark {
  name: 'InteractiveTime';
  args: TraceEventArgs&{
    args: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      total_blocking_time_ms: number,
    },
    frame: string,
  };
}

// Instant events.

export interface TraceEventInstant extends TraceEventData {
  ph: Phase.INSTANT;
  s: TraceEventScope;
}

export interface TraceEventUpdateCounters extends TraceEventInstant {
  name: 'UpdateCounters';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      documents: number,
      jsEventListeners: number,
      jsHeapSizeUsed: number,
      nodes: number,
      gpuMemoryLimitKB?: number,
    },
  };
}

export type TraceEventRendererEvent = TraceEventInstant|TraceEventComplete;

export interface TraceEventTracingStartedInBrowser extends TraceEventInstant {
  name: KnownEventName.TracingStartedInBrowser;
  args: TraceEventArgs&{
    data?: TraceEventArgsData & {
      frameTreeNodeId: number,
      // Frames can only missing in "fake" traces
      frames?: TraceFrame[], persistentIds: boolean,
    },
  };
}

export interface TraceEventTracingSessionIdForWorker extends TraceEventInstant {
  name: 'TracingSessionIdForWorker';
  args: TraceEventArgs&{
    data?: TraceEventArgsData & {
      url: string,
      workerId: WorkerId,
      workerThreadId: ThreadID,
      frame: string,
    },
  };
}

export interface TraceEventFrameCommittedInBrowser extends TraceEventInstant {
  name: 'FrameCommittedInBrowser';
  args: TraceEventArgs&{
    data?: TraceEventArgsData & TraceFrame,
  };
}

export interface TraceEventMainFrameViewport extends TraceEventInstant {
  name: 'PaintTimingVisualizer::Viewport';
  args: {
    data: TraceEventArgsData&{
      // eslint-disable-next-line @typescript-eslint/naming-convention
      viewport_rect: number[],
    },
  };
}

export interface TraceEventCommitLoad extends TraceEventInstant {
  name: 'CommitLoad';
  args: TraceEventArgs&{
    data?: TraceEventArgsData & {
      frame: string,
      isMainFrame: boolean,
      name: string,
      nodeId: number,
      page: string,
      parent: string,
      url: string,
    },
  };
}

export interface TraceEventMarkDOMContent extends TraceEventInstant {
  name: 'MarkDOMContent';
  args: TraceEventArgs&{
    data?: TraceEventArgsData & {
      frame: string,
      isMainFrame: boolean,
      page: string,
    },
  };
}

export interface TraceEventMarkLoad extends TraceEventInstant {
  name: 'MarkLoad';
  args: TraceEventArgs&{
    data?: TraceEventArgsData & {
      frame: string,
      isMainFrame: boolean,
      page: string,
    },
  };
}

export interface TraceEventAsync extends TraceEventData {
  ph: Phase.ASYNC_NESTABLE_START|Phase.ASYNC_NESTABLE_INSTANT|Phase.ASYNC_NESTABLE_END|Phase.ASYNC_STEP_INTO|
      Phase.ASYNC_BEGIN|Phase.ASYNC_END|Phase.ASYNC_STEP_PAST;
}

export type TraceRect = [number, number, number, number];
export type TraceImpactedNode = {
  // These keys come from the trace data, so we have to use underscores.
  /* eslint-disable @typescript-eslint/naming-convention */
  new_rect: TraceRect,
  node_id: Protocol.DOM.BackendNodeId,
  old_rect: TraceRect,
  /* eslint-enable @typescript-eslint/naming-convention */
};

type LayoutShiftData = TraceEventArgsData&{
  // These keys come from the trace data, so we have to use underscores.
  /* eslint-disable @typescript-eslint/naming-convention */
  cumulative_score: number,
  frame_max_distance: number,
  had_recent_input: boolean,
  impacted_nodes: TraceImpactedNode[] | undefined,
  is_main_frame: boolean,
  overall_max_distance: number,
  region_rects: TraceRect[],
  score: number,
  weighted_score_delta: number,
  /* eslint-enable @typescript-eslint/naming-convention */
};
// These keys come from the trace data, so we have to use underscores.
export interface TraceEventLayoutShift extends TraceEventInstant {
  name: 'LayoutShift';
  normalized?: boolean;
  args: TraceEventArgs&{
    frame: string,
    data?: LayoutShiftData,
  };
}

interface LayoutShiftSessionWindowData {
  // The sum of the weighted score of all the shifts
  // that belong to a session window.
  cumulativeWindowScore: number;
  // A consecutive generated in the frontend to
  // to identify a session window.
  id: number;
}
export interface LayoutShiftParsedData {
  screenshotSource?: string;
  timeFromNavigation?: MicroSeconds;
  // The sum of the weighted scores of the shifts that
  // belong to a session window up until this shift
  // (inclusive).
  cumulativeWeightedScoreInWindow: number;
  sessionWindowData: LayoutShiftSessionWindowData;
}
export interface SyntheticLayoutShift extends TraceEventLayoutShift {
  args: TraceEventArgs&{
    frame: string,
    data?: LayoutShiftData&{
      rawEvent: TraceEventLayoutShift,
    },
  };
  parsedData: LayoutShiftParsedData;
}

export type Priority = 'Low'|'High'|'Medium'|'VeryHigh'|'Highest';
export type RenderBlocking = 'blocking'|'non_blocking'|'in_body_parser_blocking'|'potentially_blocking';
export interface TraceEventResourceSendRequest extends TraceEventInstant {
  name: 'ResourceSendRequest';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      frame: string,
      requestId: string,
      url: string,
      priority: Priority,
      // TODO(crbug.com/1457985): change requestMethod to enum when confirm in the backend code.
      requestMethod?: string,
      renderBlocking?: RenderBlocking,
    },
  };
}

export interface TraceEventResourceChangePriority extends TraceEventInstant {
  name: 'ResourceChangePriority';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      requestId: string,
      priority: Priority,
    },
  };
}

export interface TraceEventResourceWillSendRequest extends TraceEventInstant {
  name: 'ResourceWillSendRequest';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      requestId: string,
    },
  };
}

export interface TraceEventResourceFinish extends TraceEventInstant {
  name: 'ResourceFinish';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      decodedBodyLength: number,
      didFail: boolean,
      encodedDataLength: number,
      finishTime: Seconds,
      requestId: string,
    },
  };
}

export interface TraceEventResourceReceivedData extends TraceEventInstant {
  name: 'ResourceReceivedData';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      encodedDataLength: number,
      frame: string,
      requestId: string,
    },
  };
}

interface TraceEventResourceReceiveResponseTimingData {
  connectEnd: MilliSeconds;
  connectStart: MilliSeconds;
  dnsEnd: MilliSeconds;
  dnsStart: MilliSeconds;
  proxyEnd: MilliSeconds;
  proxyStart: MilliSeconds;
  pushEnd: MilliSeconds;
  pushStart: MilliSeconds;
  receiveHeadersEnd: MilliSeconds;
  requestTime: Seconds;
  sendEnd: MilliSeconds;
  sendStart: MilliSeconds;
  sslEnd: MilliSeconds;
  sslStart: MilliSeconds;
  workerReady: MilliSeconds;
  workerStart: MilliSeconds;
}

export interface TraceEventResourceReceiveResponse extends TraceEventInstant {
  name: 'ResourceReceiveResponse';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      encodedDataLength: number,
      frame: string,
      fromCache: boolean,
      fromServiceWorker: boolean,
      mimeType: string,
      requestId: string,
      responseTime: MilliSeconds,
      statusCode: number,
      timing: TraceEventResourceReceiveResponseTimingData,
    },
  };
}

export interface TraceEventResourceMarkAsCached extends TraceEventInstant {
  name: 'ResourceMarkAsCached';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      requestId: string,
    },
  };
}

export const enum LayoutInvalidationReason {
  SIZE_CHANGED = 'Size changed',
  ATTRIBUTE = 'Attribute',
  ADDED_TO_LAYOUT = 'Added to layout',
  SCROLLBAR_CHANGED = 'Scrollbar changed',
  REMOVED_FROM_LAYOUT = 'Removed from layout',
  STYLE_CHANGED = 'Style changed',
  FONTS_CHANGED = 'Fonts changed',
  UNKNOWN = 'Unknown',
}

export interface TraceEventLayoutInvalidationTracking extends TraceEventInstant {
  name: KnownEventName.LayoutInvalidationTracking;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      frame: string,
      nodeId: Protocol.DOM.BackendNodeId,
      reason: LayoutInvalidationReason,
      nodeName?: string,
    },
  };
}

export interface TraceEventScheduleStyleInvalidationTracking extends TraceEventInstant {
  name: KnownEventName.ScheduleStyleInvalidationTracking;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      frame: string,
      nodeId: Protocol.DOM.BackendNodeId,
      invalidationSet?: string,
      invalidatedSelectorId?: string,
      reason?: LayoutInvalidationReason,
      changedClass?: string,
      nodeName?: string,
      stackTrace?: TraceEventCallFrame[],
    },
  };
}

export const enum StyleRecalcInvalidationReason {
  ANIMATION = 'Animation',
}

export interface TraceEventStyleRecalcInvalidation extends TraceEventInstant {
  name: 'StyleRecalcInvalidationTracking';
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      frame: string,
      nodeId: Protocol.DOM.BackendNodeId,
      reason: StyleRecalcInvalidationReason,
      subtree: boolean,
      nodeName?: string,
      extraData?: string,
    },
  };
}
export interface TraceEventScheduleStyleRecalculation extends TraceEventInstant {
  name: KnownEventName.ScheduleStyleRecalculation;
  args: TraceEventArgs&{
    data: {
      frame: string,
    },
  };
}
export interface TraceEventPrePaint extends TraceEventComplete {
  name: 'PrePaint';
}

export type TraceEventNestableAsync = TraceEventNestableAsyncBegin|TraceEventNestableAsyncEnd;
export interface TraceEventNestableAsyncBegin extends TraceEventData {
  ph: Phase.ASYNC_NESTABLE_START;
  // The id2 field gives flexibility to explicitly specify if an event
  // id is global among processes or process local. However not all
  // events use it, so both kind of ids need to be marked as optional.
  id2?: {local?: string, global?: string};
  id?: string;
}

export interface TraceEventNestableAsyncEnd extends TraceEventData {
  ph: Phase.ASYNC_NESTABLE_END;
  id2?: {local?: string, global?: string};
  id?: string;
}

export type TraceEventAsyncPerformanceMeasure = TraceEventPerformanceMeasureBegin|TraceEventPerformanceMeasureEnd;

export interface TraceEventPerformanceMeasureBegin extends TraceEventNestableAsyncBegin {
  cat: 'blink.user_timing';
  id: string;
}

export interface TraceEventPerformanceMeasureEnd extends TraceEventNestableAsyncEnd {
  cat: 'blink.user_timing';
  id: string;
}

export interface TraceEventConsoleTimeBegin extends TraceEventNestableAsyncBegin {
  cat: 'blink.console';
  id2: {
    local: string,
  };
}

export interface TraceEventConsoleTimeEnd extends TraceEventNestableAsyncEnd {
  cat: 'blink.console';
  id2: {
    local: string,
  };
}

export interface TraceEventTimeStamp extends TraceEventData {
  cat: 'devtools.timeline';
  name: 'TimeStamp';
  ph: Phase.INSTANT;
  id: string;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      frame: string,
      message: string,
    },
  };
}

export interface TraceEventPerformanceMark extends TraceEventData {
  cat: 'blink.user_timing';
  ph: Phase.INSTANT|Phase.MARK;
  id: string;
}

// Nestable async events with a duration are made up of two distinct
// events: the begin, and the end. We need both of them to be able to
// display the right information, so we create these synthetic events.
export interface TraceEventSyntheticNestableAsyncEvent extends TraceEventData {
  id?: string;
  id2?: {local?: string, global?: string};
  dur: MicroSeconds;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      beginEvent: TraceEventNestableAsyncBegin,
      endEvent: TraceEventNestableAsyncEnd,
    },
  };
}

export interface TraceEventSyntheticUserTiming extends TraceEventSyntheticNestableAsyncEvent {
  id: string;
  dur: MicroSeconds;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      beginEvent: TraceEventPerformanceMeasureBegin,
      endEvent: TraceEventPerformanceMeasureEnd,
    },
  };
}

export interface TraceEventSyntheticConsoleTiming extends TraceEventSyntheticNestableAsyncEvent {
  id2: {local: string};
  dur: MicroSeconds;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      beginEvent: TraceEventConsoleTimeBegin,
      endEvent: TraceEventConsoleTimeEnd,
    },
  };
}

export interface SyntheticInteractionEvent extends TraceEventSyntheticNestableAsyncEvent {
  // InteractionID and type are available within the beginEvent's data, but we
  // put them on the top level for ease of access.
  interactionId: number;
  type: string;
  // This is equivalent to startEvent.ts;
  ts: MicroSeconds;
  // This duration can be calculated via endEvent.ts - startEvent.ts, but we do
  // that and put it here to make it easier. This also makes these events
  // consistent with real events that have a dur field.
  dur: MicroSeconds;
  // These values are provided in the startEvent's args.data field as
  // millisecond values, but during the handler phase we parse these into
  // microseconds and put them on the top level for easy access.
  processingStart: MicroSeconds;
  processingEnd: MicroSeconds;
  // These 3 values represent the breakdown of the parts of an interaction:
  // 1. inputDelay: time from the user clicking to the input being handled
  inputDelay: MicroSeconds;
  // 2. mainThreadHandling: time spent processing the event handler
  mainThreadHandling: MicroSeconds;
  // 3. presentationDelay: delay between the event being processed and the frame being rendered
  presentationDelay: MicroSeconds;
  args: TraceEventArgs&{
    data: TraceEventArgsData & {
      beginEvent: TraceEventEventTimingBegin,
      endEvent: TraceEventEventTimingEnd,
    },
  };
}

/**
 * An event created synthetically in the frontend that has a self time
 * (the time spent running the task itself).
 */
export interface SyntheticEventWithSelfTime extends TraceEventData {
  selfTime?: MicroSeconds;
}

/**
 * A profile call created in the frontend from samples disguised as a
 * trace event.
 */
export interface TraceEventSyntheticProfileCall extends SyntheticEventWithSelfTime {
  callFrame: Protocol.Runtime.CallFrame;
  nodeId: Protocol.integer;
}

/**
 * A trace event augmented synthetically in the frontend to contain
 * its self time.
 */
export type SyntheticRendererEvent = TraceEventRendererEvent&SyntheticEventWithSelfTime;

export type TraceEntry = SyntheticRendererEvent|TraceEventSyntheticProfileCall;

// Events relating to frames.

export interface TraceEventDrawFrame extends TraceEventInstant {
  name: KnownEventName.DrawFrame;
  args: TraceEventArgs&{
    layerTreeId: number,
    frameSeqId: number,
  };
}

export interface TraceEventLegacyDrawFrameBegin extends TraceEventAsync {
  name: KnownEventName.DrawFrame;
  ph: Phase.ASYNC_NESTABLE_START;
  args: TraceEventArgs&{
    layerTreeId: number,
    frameSeqId: number,
  };
}

export interface TraceEventBeginFrame extends TraceEventInstant {
  name: KnownEventName.BeginFrame;
  args: TraceEventArgs&{
    layerTreeId: number,
    frameSeqId: number,
  };
}

export interface TraceEventDroppedFrame extends TraceEventInstant {
  name: KnownEventName.DroppedFrame;
  args: TraceEventArgs&{
    layerTreeId: number,
    frameSeqId: number,
    hasPartialUpdate?: boolean,
  };
}

export interface TraceEventRequestMainThreadFrame extends TraceEventInstant {
  name: KnownEventName.RequestMainThreadFrame;
  args: TraceEventArgs&{
    layerTreeId: number,
  };
}

export interface TraceEventBeginMainThreadFrame extends TraceEventInstant {
  name: KnownEventName.BeginMainThreadFrame;
  args: TraceEventArgs&{
    layerTreeId: number,
    data: TraceEventArgsData&{
      frameId?: number,
    },
  };
}

export interface TraceEventNeedsBeginFrameChanged extends TraceEventInstant {
  name: KnownEventName.NeedsBeginFrameChanged;
  args: TraceEventArgs&{
    layerTreeId: number,
    data: TraceEventArgsData&{
      needsBeginFrame: number,
    },
  };
}

export interface TraceEventCommit extends TraceEventInstant {
  name: KnownEventName.Commit;
  args: TraceEventArgs&{
    layerTreeId: number,
    frameSeqId: number,
  };
}

export interface TraceEventRasterTask extends TraceEventComplete {
  name: KnownEventName.RasterTask;
  args: TraceEventArgs&{
    tileData?: {
      layerId: number,
      sourceFrameNumber: number,
      tileId: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_ref: string,
      },
      tileResolution: string,
    },
  };
}

// CompositeLayers has been replaced by "Commit", but we support both to not break old traces being imported.
export interface TraceEventCompositeLayers extends TraceEventInstant {
  name: KnownEventName.CompositeLayers;
  args: TraceEventArgs&{
    layerTreeId: number,
  };
}

export interface TraceEventActivateLayerTree extends TraceEventInstant {
  name: KnownEventName.ActivateLayerTree;
  args: TraceEventArgs&{
    layerTreeId: number,
    frameId: number,
  };
}


export interface TraceEventUpdateLayoutTree extends TraceEventComplete {
  name: KnownEventName.UpdateLayoutTree;
  args: TraceEventArgs&{
    elementCount: number,
    beginData?: {
      frame: string,
    },
  };
}

export interface TraceEventLayout extends TraceEventComplete {
  name: KnownEventName.Layout;
  args: TraceEventArgs&{
    beginData: {
      frame: string,
      dirtyObjects: number,
      partialLayout: boolean,
      totalObjects: number,
    },
    endData: {
      layoutRoots: Array<{
        depth: number,
        nodeId: Protocol.DOM.BackendNodeId,
        quads: number[][],
      }>,
    },
  };
}


export class ProfileIdTag {
    readonly #profileIdTag: (symbol|undefined);
  }
  export type ProfileID = string&ProfileIdTag;

  export class CallFrameIdTag {
    readonly #callFrameIdTag: (symbol|undefined);
  }
  export type CallFrameID = number&CallFrameIdTag;
  
  
  export class ProcessIdTag {
    readonly #processIdTag: (symbol|undefined);
  }
  export type ProcessID = number&ProcessIdTag;
  
  
  export class ThreadIdTag {
    readonly #threadIdTag: (symbol|undefined);
  }
  export type ThreadID = number&ThreadIdTag;
  
  export class WorkerIdTag {
    readonly #workerIdTag: (symbol|undefined);
  }
  export type WorkerId = string&WorkerIdTag;
  
/**
 * This is an exhaustive list of events we track in the Performance
 * panel. Note not all of them are necessarliry shown in the flame
 * chart, some of them we only use for parsing.
 * TODO(crbug.com/1428024): Complete this enum.
 */
export const enum KnownEventName {
  /* Metadata */
  ThreadName = 'thread_name',

  /* Task */
  Program = 'Program',
  RunTask = 'RunTask',
  AsyncTask = 'AsyncTask',
  RunMicrotasks = 'RunMicrotasks',

  /* Load */
  XHRLoad = 'XHRLoad',
  XHRReadyStateChange = 'XHRReadyStateChange',
  /* Parse */
  ParseHTML = 'ParseHTML',
  ParseCSS = 'ParseAuthorStyleSheet',
  /* V8 */
  CompileCode = 'V8.CompileCode',
  CompileModule = 'V8.CompileModule',
  // Although V8 emits the V8.CompileScript event, the event that actually
  // contains the useful information about the script (URL, etc), is contained
  // in the v8.compile event.
  // Yes, it is all lowercase compared to all the rest of the V8... events,
  // that is not a typo :)
  Compile = 'v8.compile',
  CompileScript = 'V8.CompileScript',
  Optimize = 'V8.OptimizeCode',
  WasmStreamFromResponseCallback = 'v8.wasm.streamFromResponseCallback',
  WasmCompiledModule = 'v8.wasm.compiledModule',
  WasmCachedModule = 'v8.wasm.cachedModule',
  WasmModuleCacheHit = 'v8.wasm.moduleCacheHit',
  WasmModuleCacheInvalid = 'v8.wasm.moduleCacheInvalid',
  /* Js */
  ProfileCall = 'ProfileCall',
  EvaluateScript = 'EvaluateScript',
  FunctionCall = 'FunctionCall',
  EventDispatch = 'EventDispatch',
  EvaluateModule = 'v8.evaluateModule',
  RequestMainThreadFrame = 'RequestMainThreadFrame',
  RequestAnimationFrame = 'RequestAnimationFrame',
  CancelAnimationFrame = 'CancelAnimationFrame',
  FireAnimationFrame = 'FireAnimationFrame',
  RequestIdleCallback = 'RequestIdleCallback',
  CancelIdleCallback = 'CancelIdleCallback',
  FireIdleCallback = 'FireIdleCallback',
  TimerInstall = 'TimerInstall',
  TimerRemove = 'TimerRemove',
  TimerFire = 'TimerFire',
  WebSocketCreate = 'WebSocketCreate',
  WebSocketSendHandshake = 'WebSocketSendHandshakeRequest',
  WebSocketReceiveHandshake = 'WebSocketReceiveHandshakeResponse',
  WebSocketDestroy = 'WebSocketDestroy',
  CryptoDoEncrypt = 'DoEncrypt',
  CryptoDoEncryptReply = 'DoEncryptReply',
  CryptoDoDecrypt = 'DoDecrypt',
  CryptoDoDecryptReply = 'DoDecryptReply',
  CryptoDoDigest = 'DoDigest',
  CryptoDoDigestReply = 'DoDigestReply',
  CryptoDoSign = 'DoSign',
  CryptoDoSignReply = 'DoSignReply',
  CryptoDoVerify = 'DoVerify',
  CryptoDoVerifyReply = 'DoVerifyReply',
  V8Execute = 'V8.Execute',

  /* Gc */
  GC = 'GCEvent',
  DOMGC = 'BlinkGC.AtomicPhase',
  IncrementalGCMarking = 'V8.GCIncrementalMarking',
  MajorGC = 'MajorGC',
  MinorGC = 'MinorGC',
  GCCollectGarbage = 'BlinkGC.AtomicPhase',

  /* Layout */
  ScheduleStyleRecalculation = 'ScheduleStyleRecalculation',
  RecalculateStyles = 'RecalculateStyles',
  Layout = 'Layout',
  UpdateLayoutTree = 'UpdateLayoutTree',
  InvalidateLayout = 'InvalidateLayout',
  LayoutInvalidationTracking = 'LayoutInvalidationTracking',
  ComputeIntersections = 'ComputeIntersections',
  HitTest = 'HitTest',
  PrePaint = 'PrePaint',
  Layerize = 'Layerize',
  LayoutShift = 'LayoutShift',
  UpdateLayerTree = 'UpdateLayerTree',
  ScheduleStyleInvalidationTracking = 'ScheduleStyleInvalidationTracking',
  StyleRecalcInvalidationTracking = 'StyleRecalcInvalidationTracking',
  StyleInvalidatorInvalidationTracking = 'StyleInvalidatorInvalidationTracking',

  /* Paint */
  ScrollLayer = 'ScrollLayer',
  UpdateLayer = 'UpdateLayer',
  PaintSetup = 'PaintSetup',
  Paint = 'Paint',
  PaintImage = 'PaintImage',
  Commit = 'Commit',
  CompositeLayers = 'CompositeLayers',
  RasterTask = 'RasterTask',
  ImageDecodeTask = 'ImageDecodeTask',
  ImageUploadTask = 'ImageUploadTask',
  DecodeImage = 'Decode Image',
  ResizeImage = 'Resize Image',
  DrawLazyPixelRef = 'Draw LazyPixelRef',
  DecodeLazyPixelRef = 'Decode LazyPixelRef',
  GPUTask = 'GPUTask',
  Rasterize = 'Rasterize',
  EventTiming = 'EventTiming',

  /* Compile */
  OptimizeCode = 'V8.OptimizeCode',
  CacheScript = 'v8.produceCache',
  CacheModule = 'v8.produceModuleCache',
  // V8Sample events are coming from tracing and contain raw stacks with function addresses.
  // After being processed with help of JitCodeAdded and JitCodeMoved events they
  // get translated into function infos and stored as stacks in JSSample events.
  V8Sample = 'V8Sample',
  JitCodeAdded = 'JitCodeAdded',
  JitCodeMoved = 'JitCodeMoved',
  StreamingCompileScript = 'v8.parseOnBackground',
  StreamingCompileScriptWaiting = 'v8.parseOnBackgroundWaiting',
  StreamingCompileScriptParsing = 'v8.parseOnBackgroundParsing',
  BackgroundDeserialize = 'v8.deserializeOnBackground',
  FinalizeDeserialization = 'V8.FinalizeDeserialization',

  /* Markers */
  CommitLoad = 'CommitLoad',
  MarkLoad = 'MarkLoad',
  MarkDOMContent = 'MarkDOMContent',
  MarkFirstPaint = 'firstPaint',
  MarkFCP = 'firstContentfulPaint',
  MarkLCPCandidate = 'largestContentfulPaint::Candidate',
  MarkLCPInvalidate = 'largestContentfulPaint::Invalidate',
  NavigationStart = 'navigationStart',
  TimeStamp = 'TimeStamp',
  ConsoleTime = 'ConsoleTime',
  UserTiming = 'UserTiming',
  InteractiveTime = 'InteractiveTime',

  /* Frames */
  BeginFrame = 'BeginFrame',
  NeedsBeginFrameChanged = 'NeedsBeginFrameChanged',
  BeginMainThreadFrame = 'BeginMainThreadFrame',
  ActivateLayerTree = 'ActivateLayerTree',
  DrawFrame = 'DrawFrame',
  DroppedFrame = 'DroppedFrame',
  FrameStartedLoading = 'FrameStartedLoading',

  /* Network request events */
  ResourceWillSendRequest = 'ResourceWillSendRequest',
  ResourceSendRequest = 'ResourceSendRequest',
  ResourceReceiveResponse = 'ResourceReceiveResponse',
  ResourceReceivedData = 'ResourceReceivedData',
  ResourceFinish = 'ResourceFinish',
  ResourceMarkAsCached = 'ResourceMarkAsCached',

  /* Web sockets */
  WebSocketSendHandshakeRequest = 'WebSocketSendHandshakeRequest',
  WebSocketReceiveHandshakeResponse = 'WebSocketReceiveHandshakeResponse',

  /* CPU Profiling */
  Profile = 'Profile',
  StartProfiling = 'CpuProfiler::StartProfiling',
  ProfileChunk = 'ProfileChunk',
  UpdateCounters = 'UpdateCounters',

  /* Other */
  Animation = 'Animation',
  ParseAuthorStyleSheet = 'ParseAuthorStyleSheet',
  EmbedderCallback = 'EmbedderCallback',
  SetLayerTreeId = 'SetLayerTreeId',
  TracingStartedInPage = 'TracingStartedInPage',
  TracingStartedInBrowser = 'TracingStartedInBrowser',
  TracingSessionIdForWorker = 'TracingSessionIdForWorker',
  LazyPixelRef = 'LazyPixelRef',
  LayerTreeHostImplSnapshot = 'cc::LayerTreeHostImpl',
  PictureSnapshot = 'cc::Picture',
  DisplayItemListSnapshot = 'cc::DisplayItemList',
  InputLatencyMouseMove = 'InputLatency::MouseMove',
  InputLatencyMouseWheel = 'InputLatency::MouseWheel',
  ImplSideFling = 'InputHandlerProxy::HandleGestureFling::started',
}

export interface TraceEventSyntheticNetworkRequest extends TraceEventComplete {
    args: TraceEventArgs&{
      data: TraceEventArgsData & {
        syntheticData: TraceEventSyntheticArgsData,
        // All fields below are from TraceEventsForNetworkRequest,
        // Required fields
        decodedBodyLength: number,
        encodedDataLength: number,
        frame: string,
        fromServiceWorker: boolean,
        host: string,
        mimeType: string,
        pathname: string,
        search: string,
        priority: Priority,
        initialPriority: Priority,
        protocol: string,
        redirects: TraceEventSyntheticNetworkRedirect[],
        renderBlocking: RenderBlocking,
        requestId: string,
        requestingFrameUrl: string,
        statusCode: number,
        url: string,
        // Optional fields
        requestMethod?: string,
        timing?: TraceEventResourceReceiveResponseTimingData,
      },
    };
    cat: 'loading';
    name: 'SyntheticNetworkRequest';
    ph: Phase.COMPLETE;
    dur: MicroSeconds;
    tdur: MicroSeconds;
    ts: MicroSeconds;
    tts: MicroSeconds;
    pid: ProcessID;
    tid: ThreadID;
}
