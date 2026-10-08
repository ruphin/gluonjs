import { beforeEach, afterEach } from 'vitest';
import type { GluonElement } from '../src/gluon.js';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
});

afterEach(() => {
  container.remove();
});

// Connects an element and waits for its first update
export const mount = async <T extends HTMLElement>(element: T): Promise<T> => {
  container.append(element);
  await (element as unknown as GluonElement).updateComplete;
  return element;
};

// The rendered text of an element, with whitespace collapsed and the part markers removed
export const text = (element: GluonElement): string =>
  (element.renderRoot.textContent ?? '').replace(/\s+/g, ' ').trim();

export const innerHTML = (node: ParentNode): string =>
  (node as Element).innerHTML.replace(/<!---->/g, '').replace(/\s+/g, ' ').trim();

// Each test class needs its own tag name
let tagCount = 0;
export const tag = (): string => `test-element-${tagCount++}`;
