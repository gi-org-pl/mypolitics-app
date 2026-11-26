import { act } from "@testing-library/react";
import { vi } from "vitest";

interface ObserverRecord {
  callback: ResizeObserverCallback;
  elements: Element[];
  isDisconnected: boolean;
}

export interface ResizeObserverMock {
  observers: ObserverRecord[]; // every observer that was created, oldest first
  resize: (height: number, observer?: number) => void; // reports a height of what an observer watches; the newest one by default
}

// jsdom has no ResizeObserver. This one records what is watched and lets a
// test say what height the watched content has now. It is put in place with
// `vi.stubGlobal`, so `vi.unstubAllGlobals()` takes it away again.
export const mockResizeObserver = (): ResizeObserverMock => {
  const observers: ObserverRecord[] = [];

  class ResizeObserverStub implements ResizeObserver {
    private readonly record: ObserverRecord;

    constructor(callback: ResizeObserverCallback) {
      this.record = { callback, elements: [], isDisconnected: false };
      observers.push(this.record);
    }

    observe(element: Element) {
      this.record.elements.push(element);
    }

    unobserve(element: Element) {
      this.record.elements = this.record.elements.filter(
        (watched) => watched !== element,
      );
    }

    disconnect() {
      this.record.isDisconnected = true;
    }
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverStub);

  return {
    observers,
    resize: (height, observer = observers.length - 1) => {
      const { callback, elements } = observers[observer];

      act(() =>
        callback(
          elements.map(
            (target) =>
              ({ target, contentRect: { height } }) as ResizeObserverEntry,
          ),
          {} as ResizeObserver,
        ),
      );
    },
  };
};
