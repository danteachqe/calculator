/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The performance budget interface.
 * More info: https://github.com/GoogleChrome/budget.json
 */
interface Budget {
  /** Budget options */
  options?: Budget.Options;
  /**
   * Indicates which pages a budget applies to. Uses the robots.txt format.
   * If it is not supplied, the budget applies to all pages.
   * More info on robots.txt: https://developers.google.com/search/reference/robots_txt#url-matching-based-on-path-values
   */
  path?: string;
  /** Budgets based on resource count. */
  resourceCounts?: Array<Budget.ResourceBudget>;
  /** Budgets based on resource size. */
  resourceSizes?: Array<Budget.ResourceBudget>;
  /** Budgets based on timing metrics. */
  timings?: Array<Budget.TimingBudget>;
}

declare module Budget {
  interface ResourceBudget {
    /** The resource type that a budget applies to. */
    resourceType: ResourceType;
    /** Budget for resource. Depending on context, this is either the count or size (KiB) of a resource. */
    budget: number;
  }

  interface TimingBudget {
    /** The type of timing metric. */
    metric: TimingMetric;
    /** Budget for timing measurement, in milliseconds. */
    budget: number;
  }

  interface Options {
    /**
     * List of hostnames used to classify resources as 1st or 3rd party.
     * Wildcards can optionally be used to match a hostname and all of its subdomains.
     * For example e.g.: "*.news.gov.uk" matches both "news.gov.uk" and "en.news.gov.uk"
     * If this property is not set, the root domain and all its subdomains are considered first party.
     */
    firstPartyHostnames?: Array<string>;
  }

  /** Supported timing metrics. */
  type TimingMetric = 'first-contentful-paint' | 'interactive' | 'first-meaningful-paint' | 'max-potential-fid' | 'total-blocking-time' | 'speed-index' | 'largest-contentful-paint' | 'cumulative-layout-shift';

  /** Supported values for the resourceType property of a ResourceBudget. */
  type ResourceType = 'stylesheet' | 'image' | 'media' | 'font' | 'script' | 'document' | 'other' | 'total' | 'third-party';
}

export default Budget;
