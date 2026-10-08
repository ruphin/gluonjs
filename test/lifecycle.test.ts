import { describe, it, expect } from 'vitest';
import { GluonElement, define, html, type PropertyValues } from '../src/gluon.js';
import { mount, text, tag } from './helpers.js';

describe('update cycle', () => {
  it('does not render before the element is connected', async () => {
    class Lazy extends GluonElement {
      override render() {
        return html`rendered`;
      }
    }
    define(Lazy, tag());
    const element = new Lazy();
    expect(element.isUpdatePending).toBe(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(element.hasUpdated).toBe(false);
    expect(text(element)).toBe('');
    await mount(element);
    expect(element.hasUpdated).toBe(true);
    expect(text(element)).toBe('rendered');
  });

  it('runs the lifecycle methods in order', async () => {
    const calls: string[] = [];
    class Ordered extends GluonElement {
      static override properties = { value: {} };
      value = 'a';
      override shouldUpdate() {
        calls.push('shouldUpdate');
        return true;
      }
      override willUpdate() {
        calls.push('willUpdate');
      }
      override update(changed: PropertyValues<this>) {
        calls.push('update');
        super.update(changed);
      }
      override render() {
        calls.push('render');
        return html`${this.value}`;
      }
      override firstUpdated() {
        calls.push('firstUpdated');
      }
      override updated() {
        calls.push('updated');
      }
    }
    define(Ordered, tag());
    const element = await mount(new Ordered());
    expect(calls).toEqual(['shouldUpdate', 'willUpdate', 'update', 'render', 'firstUpdated', 'updated']);
    calls.length = 0;
    element.value = 'b';
    await element.updateComplete;
    expect(calls).toEqual(['shouldUpdate', 'willUpdate', 'update', 'render', 'updated']);
  });

  it('skips the update when `shouldUpdate` returns false', async () => {
    class Guarded extends GluonElement {
      static override properties = { value: { type: Number } };
      value = 0;
      renders = 0;
      override shouldUpdate(changed: PropertyValues<this>) {
        return !changed.has('value') || this.value % 2 === 0;
      }
      override render() {
        this.renders++;
        return html`${this.value}`;
      }
    }
    define(Guarded, tag());
    const element = await mount(new Guarded());
    element.value = 1;
    expect(await element.updateComplete).toBe(true);
    expect(element.renders).toBe(1);
    expect(element.isUpdatePending).toBe(false);
    element.value = 2;
    await element.updateComplete;
    expect(element.renders).toBe(2);
  });

  it('lets `willUpdate` derive values before rendering', async () => {
    class Derived extends GluonElement {
      static override properties = { first: {}, last: {} };
      first = 'Ada';
      last = 'Lovelace';
      full = '';
      override willUpdate(changed: PropertyValues<this>) {
        if (changed.has('first') || changed.has('last')) {
          this.full = `${this.first} ${this.last}`;
        }
      }
      override render() {
        return html`${this.full}`;
      }
    }
    define(Derived, tag());
    const element = await mount(new Derived());
    expect(text(element)).toBe('Ada Lovelace');
    element.last = 'Byron';
    await element.updateComplete;
    expect(text(element)).toBe('Ada Byron');
  });

  it('re-renders on `requestUpdate()` without arguments', async () => {
    class Manual extends GluonElement {
      items: string[] = [];
      override render() {
        return html`${this.items.length}`;
      }
    }
    define(Manual, tag());
    const element = await mount(new Manual());
    element.items.push('a');
    element.requestUpdate();
    await element.updateComplete;
    expect(text(element)).toBe('1');
  });

  it('resolves `updateComplete` with false when the update requested another update', async () => {
    class Chained extends GluonElement {
      static override properties = { value: { type: Number } };
      value = 0;
      override updated() {
        if (this.value < 3) {
          this.value++;
        }
      }
      override render() {
        return html`${this.value}`;
      }
    }
    define(Chained, tag());
    const element = new Chained();
    document.body.append(element);
    expect(await element.updateComplete).toBe(false);
    expect(element.value).toBe(1);
    while (!(await element.updateComplete));
    expect(element.value).toBe(3);
    expect(text(element)).toBe('3');
    element.remove();
  });

  it('performs the update synchronously with `performUpdate()`', async () => {
    class Sync extends GluonElement {
      static override properties = { value: {} };
      value = 'a';
      override render() {
        return html`${this.value}`;
      }
    }
    define(Sync, tag());
    const element = await mount(new Sync());
    element.value = 'b';
    element.performUpdate();
    expect(text(element)).toBe('b');
    expect(element.isUpdatePending).toBe(false);
    expect(await element.updateComplete).toBe(true);
  });
});

describe('disconnectSignal', () => {
  it('is aborted on disconnect, and replaced on the next connect', async () => {
    class Listening extends GluonElement {
      clicks = 0;
      override connectedCallback() {
        super.connectedCallback();
        document.addEventListener('click', () => this.clicks++, { signal: this.disconnectSignal });
      }
    }
    define(Listening, tag());
    const element = await mount(new Listening());
    const signal = element.disconnectSignal;
    expect(signal.aborted).toBe(false);
    document.body.click();
    expect(element.clicks).toBe(1);
    element.remove();
    expect(signal.aborted).toBe(true);
    document.body.click();
    expect(element.clicks).toBe(1);
    await mount(element);
    expect(element.disconnectSignal.aborted).toBe(false);
    expect(element.disconnectSignal).not.toBe(signal);
    document.body.click();
    expect(element.clicks).toBe(2);
    element.remove();
  });
});
