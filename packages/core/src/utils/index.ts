import { ScrollState } from "../types";

export const isNumber = (value: any): value is number => {
  return typeof value === "number" && !isNaN(value);
};

export const throttle = (fn: (...args: any[]) => void, delay: number) => {
  let lastCall = 0;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
};

// 创建带警告的只读状态
export const createReadOnlyState = <T extends ScrollState>(state: T): Readonly<T> => {
  return new Proxy(state, {
    get: (target, prop) => target[prop as keyof T],
    set: (_, prop) => {
      console.warn(
        `You cannot modify the state directly .${String(
          prop,
        )}Use methods [updateOptions] to update the state`,
      );
      return false;
    },
  });
};

// 创建带回调的只读状态
export const useStateWithCallback = (
  initialState: ScrollState,
  onStateChange?: (state: ScrollState) => void,
) => {
  const state = { ...initialState };

  const throttledOnStateChange = onStateChange
    ? throttle((newState: ScrollState) => {
        // 返回一个新对象，避免vue watch无法监听
        onStateChange({ ...newState });
      }, 16) // 约60fps的刷新率
    : undefined;

  const dispatch = (newState: Partial<ScrollState>) => {
    Object.assign(state, newState);
    if (throttledOnStateChange) {
      throttledOnStateChange({ ...state });
    }
  };

  return [state, dispatch] as const;
};
