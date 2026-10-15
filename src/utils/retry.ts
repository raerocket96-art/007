export interface RetryOptions {
  retries?: number;
  delay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 350,
  maxDelay = 2500,
  backoffFactor = 2
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const status = Number(err?.status || err?.code || err?.statusCode || 0);
    const msg = String(err?.message || "").toLowerCase();
    const isRetryable =
      status === 503 ||
      status === 429 ||
      status === 500 ||
      status === 502 ||
      status === 504 ||
      msg.includes("503") ||
      msg.includes("429") ||
      msg.includes("overloaded") ||
      msg.includes("unavailable") ||
      msg.includes("econnreset") ||
      msg.includes("etimedout") ||
      msg.includes("fetch failed");

    if (retries <= 0 || !isRetryable) {
      throw err;
    }

    // Attempt to extract suggested delay from RetryInfo header or use capped exponential backoff with jitter
    let retryDelay = delay;
    try {
      if (typeof err.message === "string" && err.message.startsWith("{")) {
        const details = JSON.parse(err.message);
        const retryInfo = details.error?.details?.find(
          (d: any) => d["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
        );
        if (retryInfo?.retryDelay) {
          const seconds = parseInt(retryInfo.retryDelay, 10);
          if (seconds > 0) {
            retryDelay = Math.min(seconds * 1000, maxDelay);
          }
        }
      }
    } catch {
      // ignore parse error and use calculated delay
    }

    const jitter = Math.floor(Math.random() * 150);
    const finalDelay = Math.min(retryDelay + jitter, maxDelay);

    console.info(
      `[Gemini Retry] Transient ${status || "network"} response, retrying in ${finalDelay}ms (${retries} attempts left)...`
    );
    await new Promise((resolve) => setTimeout(resolve, finalDelay));

    return withRetry(
      fn,
      retries - 1,
      Math.min(delay * backoffFactor, maxDelay),
      maxDelay,
      backoffFactor
    );
  }
}
