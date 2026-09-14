const { test } = require("@playwright/test");

const viewports = [
  { width: 1366, height: 768, name: "1366" },
  { width: 1920, height: 900, name: "1920" },
];

for (const viewport of viewports) {
  test(`about white intro ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("http://127.0.0.1:5500", { waitUntil: "networkidle" });

    const aboutTop = await page.locator("[data-about-section]").evaluate((el) => el.offsetTop);
    const aboutHeight = await page.locator("[data-about-section]").evaluate((el) => el.offsetHeight);
    const scrollDistance = aboutHeight - viewport.height;

    await page.evaluate(({ y }) => window.scrollTo(0, y), {
      y: aboutTop + scrollDistance * 0.61,
    });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: `output/playwright/about-white-${viewport.name}.png`,
      fullPage: false,
    });

    const result = await page.evaluate(() => {
      const selectors = [
        ".about-identity",
        ".about-rule-left",
        ".about-rule-right",
        ".about-micro-tl",
        ".about-micro-tr",
        ".about-vertical-left",
        ".about-vertical-right",
        ".about-title-where",
        ".about-title-problem",
        ".about-title-meets",
        ".about-title-engineer",
        ".about-tag-idea",
        ".about-tag-design",
        ".about-tag-develop",
        ".about-tag-deploy",
      ];

      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        const rect = el.getBoundingClientRect();
        return {
          selector,
          text: el.textContent.trim(),
          opacity: Number(getComputedStyle(el).opacity).toFixed(2),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          bottom: Math.round(rect.bottom),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      });
    });

    console.log(`VIEWPORT ${viewport.width}x${viewport.height}`);
    console.table(result);
  });
}
