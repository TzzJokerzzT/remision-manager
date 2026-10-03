import '@testing-library/jest-dom';

/**
 * Shims para jsdom.
 *
 * jsdom no implementa varias APIs que HeroUI, react-aria y framer-motion
 * consultan al montar. Sin esto los componentes explotan con
 * "X is not a function" y el test falla por el entorno, no por el código.
 */

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

globalThis.ResizeObserver = globalThis.ResizeObserver ?? (NoopObserver as unknown as typeof ResizeObserver);
globalThis.IntersectionObserver =
  globalThis.IntersectionObserver ?? (NoopObserver as unknown as typeof IntersectionObserver);

if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => {};
}

if (typeof window.scrollTo !== 'function') {
  window.scrollTo = () => {};
}

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:jest';
  URL.revokeObjectURL = () => {};
}
