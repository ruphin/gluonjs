const puppeteer = require('puppeteer');
const { expect } = require('chai');
const browserSync = require('browser-sync').create();

let browser = null;
let page = null;

before(async () => {
  // Workaround until https://github.com/GoogleChrome/puppeteer/issues/290 is fixed
  browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  page = await browser.newPage();
  await page.setViewport({
    width: 1024,
    height: 768
  });
  await new Promise(resolve =>
    browserSync.init(
      {
        port: 5000,
        notify: false,
        open: false,
        ui: false,
        logLevel: 'silent',
        server: {
          baseDir: ['examples', '.', 'node_modules']
        }
      },
      resolve
    )
  );
});

after(async () => {
  await browser.close();
  browserSync.exit();
});

describe('GluonJS', () => {
  describe(`'$' property`, () => {
    beforeEach(async () => {
      await page.goto('http://localhost:5000/test/test-$.html');
    });
    it('should contain a key for each child with an ID', async () => {
      const keyCount = await page.evaluate(() => {
        const testElement = document.getElementById('testElement');
        return Object.keys(testElement.$).length;
      });
      expect(keyCount).to.be.equal(2);
    });
    it('should map to the elements by ID', async () => {
      const equality = await page.evaluate(() => {
        const testElement = document.getElementById('testElement');
        return testElement.$.one === testElement.shadowRoot.getElementById('one') && testElement.$.two === testElement.shadowRoot.getElementById('two');
      });
      expect(equality).to.be.true;
    });
  });
  describe(`'is' property`, () => {
    beforeEach(async () => {
      await page.goto('http://localhost:5000/test/test-is.html');
    });
    it(`should be 'regular-element' for RegularElement`, async () => {
      let result = await page.evaluate(() => {
        return class RegularElement extends GluonElement {}.is;
      });
      expect(result).to.be.equal('regular-element');
    });
    it(`should be 'caps-first-element' for CAPSFirstElement`, async () => {
      let result = await page.evaluate(() => {
        return class CAPSFirstElement extends GluonElement {}.is;
      });
      expect(result).to.be.equal('caps-first-element');
    });

    it(`should be 'caps-middle-element' for CapsMIDDLEElement`, async () => {
      let result = await page.evaluate(() => {
        return class CapsMIDDLEElement extends GluonElement {}.is;
      });
      expect(result).to.be.equal('caps-middle-element');
    });

    it(`should be 'caps-last-element' for CapsLastELEMENT`, async () => {
      let result = await page.evaluate(() => {
        return class CapsLastELEMENT extends GluonElement {}.is;
      });
      expect(result).to.be.equal('caps-last-element');
    });

    it(`should be 'as-sh-ol-ec-as-e-element' for AsShOlEcAsEElement`, async () => {
      let result = await page.evaluate(() => {
        return class AsShOlEcAsEElement extends GluonElement {}.is;
      });
      expect(result).to.be.equal('as-sh-ol-ec-as-e-element');
    });
  });
});
