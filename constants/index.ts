export const DEFAULT_SCORE_THRESHOLD = 1;
export const FETCH_TIMEOUT = 60_000;
export const CHAT_GPT_FETCH_TIMEOUT = 60_000;
export const DEFAULT_WORKER_CONCURRENCY = 50;
export const PROCESS_WEBSITE_WORKER_CONCURRENCY = 5;
export const PROCESS_WEBPAGE_WORKER_CONCURRENCY = 10;
export const CREATE_ADVERTISEMENT_WORKER_CONCURRENCY = 10;
export const WEBPAGE_INSERT_CHUNK_COUNT = 100;
export const AD_BUILD_FAIL_COUNT_LIMIT = 3;

let ad_build_lock_time;
if (process.env.NODE_ENV === "development") {
  ad_build_lock_time = 5;
} else {
  ad_build_lock_time = 1 * 60 * 60;
}
export const AD_BUILD_LOCK_TIME = ad_build_lock_time;
