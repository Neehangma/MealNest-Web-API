import "@testing-library/jest-dom";
import React from "react";

const push = jest.fn();
const refresh = jest.fn();
const replace = jest.fn();

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
  useParams: () => ({ id: "restaurant-1" }),
  useRouter: () => ({ push, refresh, replace, back: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) => {
    const { fill, priority, ...imageProps } = props;
    void fill; void priority;
    return React.createElement("img", imageProps);
  },
}));

Object.defineProperty(window, "requestAnimationFrame", { writable: true, value: (callback: FrameRequestCallback) => window.setTimeout(callback, 0) });
Object.defineProperty(window, "matchMedia", { writable: true, value: jest.fn().mockImplementation((query: string) => ({ matches: false, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() })) });
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

beforeEach(() => {
  push.mockClear(); refresh.mockClear(); replace.mockClear();
  localStorage.clear(); sessionStorage.clear();
});

export const navigationMocks = { push, refresh, replace };
