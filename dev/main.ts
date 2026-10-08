// Import by package name, exactly as a consumer would.
// dev/vite.config.ts aliases the package to ../src during development.
import { GluonElement, define, html, css, type Styles } from "@gluon/gluon";

class HelloMessage extends GluonElement {
  // A class that is extended by a class with its own styles needs the annotation
  static override styles: Styles = css`
    p { color: firebrick; }
  `;
  static override properties = { name: { attribute: true } };

  name = "";

  override render() {
    return html`<p>Hello ${this.name}</p>`;
  }
}

class LoudMessage extends HelloMessage {
  static override styles = [
    HelloMessage.styles!,
    css`
      p { text-transform: uppercase; font-weight: bold; }
    `,
  ].flat();

  override render() {
    return html`<p>Hello ${this.name}!</p>`;
  }
}

class MyCounter extends GluonElement {
  static override styles = css`
    :host { display: inline-flex; gap: 8px; align-items: center; }
    button { font: inherit; }
  `;
  static override properties = {
    count: { type: Number, attribute: true, reflect: true },
    step: { type: Number, attribute: true },
  };

  count = 0;
  step = 1;

  override render() {
    return html`
      <button @click=${this.decrement}>-</button>
      <span>${this.count}</span>
      <button @click=${this.increment}>+</button>
    `;
  }

  increment() {
    this.count += this.step;
    this.emit();
  }

  decrement() {
    this.count -= this.step;
    this.emit();
  }

  private emit() {
    this.dispatchEvent(
      new CustomEvent("count-changed", {
        detail: { count: this.count },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

define(HelloMessage, "hello-message");
define(LoudMessage, "loud-message");
define(MyCounter, "my-counter");

declare global {
  interface HTMLElementTagNameMap {
    "hello-message": HelloMessage;
    "loud-message": LoudMessage;
    "my-counter": MyCounter;
  }
  interface GlobalEventHandlersEventMap {
    "count-changed": CustomEvent<{ count: number }>;
  }
}

const log = document.querySelector<HTMLElement>("#log")!;
document.addEventListener("count-changed", (event) => {
  log.textContent = `Count changed to ${event.detail.count}`;
});
