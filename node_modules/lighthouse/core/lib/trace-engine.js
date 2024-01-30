// @ts-expect-error missing types
import * as TraceEngine from '@paulirish/trace_engine';

import {polyfillDOMRect} from './polyfill-dom-rect.js';

polyfillDOMRect();

/** @type {import('../../types/trace-engine.js').TraceProcessor & typeof import('../../types/trace-engine.js').TraceProcessor} */
const TraceProcessor = TraceEngine.Processor.TraceProcessor;
/** @type {import('../../types/trace-engine.js').TraceHandlers} */
const TraceHandlers = TraceEngine.Handlers.ModelHandlers;
/** @type {import('../../types/trace-engine.js').RootCauses & typeof import('../../types/trace-engine.js').RootCauses} */
const RootCauses = TraceEngine.RootCauses.RootCauses.RootCauses;

export {
  TraceProcessor,
  TraceHandlers,
  RootCauses,
};
