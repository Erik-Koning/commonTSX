export const oneSecondMS = 1000;
export const oneMinuteMS = 60 * 1000;
export const oneHourMS = 60 * 60 * 1000;
export const oneDayMS = 24 * 60 * 60 * 1000;

export const wait = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));

export const waitUntil = async (condition: () => boolean, interval = 1000) => {
  while (!condition()) {
    await wait(interval);
  }
};

export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
