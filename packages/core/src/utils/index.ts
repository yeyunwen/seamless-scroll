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
  onStateChange?: () => [(state: ScrollState) => void, (keyof ScrollState)[]],
) => {
  const state = { ...initialState };
  // 用于记录回调和依赖项
  let callbackFn: ((state: ScrollState) => void) | undefined;
  let watchDeps: (keyof ScrollState)[] = [];
  // 保存上一次依赖项的值
  const prevDepsValues: any = {};

  // 设置回调和依赖项
  if (onStateChange) {
    const [callback, deps] = onStateChange();
    callbackFn = callback;
    watchDeps = deps;
    // 初始化依赖项的初始值
    deps.forEach((key) => {
      if (key in initialState) {
        prevDepsValues[key] = initialState[key as keyof ScrollState];
      }
    });
  }

  const dispatch = (newState: Partial<ScrollState>) => {
    // 检查依赖项是否有变化
    let shouldRunCallback = false;

    if (watchDeps.length > 0) {
      for (const key of watchDeps) {
        if (
          key in newState &&
          newState[key as keyof Partial<ScrollState>] !== prevDepsValues[key]
        ) {
          shouldRunCallback = true;
          // 更新依赖值
          prevDepsValues[key] = newState[key as keyof Partial<ScrollState>];
        }
      }
    } else {
      // 如果没有指定依赖项，则每次都运行
      shouldRunCallback = true;
    }

    Object.assign(state, newState);
    // 直接调用回调，不使用节流
    if (callbackFn && shouldRunCallback) {
      callbackFn({ ...state });
    }
  };

  return [state, dispatch] as const;
};
