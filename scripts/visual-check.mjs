import { chromium } from "playwright";

const recordId = "1a703f01-53a2-4d3e-aae4-b300583710f8";
const createdAt = new Date().toISOString();
const styleId = "f1fd6626-688b-4c6c-b7c3-c6be97f27c43";
const workspaceState = {
  state: {
    mode: "simple",
    activeRecordId: recordId,
    recentTasks: [
      {
        recordId,
        prompt: "雨后的东京街头，霓虹倒映在积水里，电影感广角",
        status: "completed",
        mode: "simple",
        width: 768,
        height: 512,
        createdAt,
        styleName: "动漫风格",
        imageUrl: "generated/mock.png",
      },
      {
        recordId: "6a11a5bb-5292-4dde-806c-70f4be677b7c",
        prompt: "漂浮在云海上的白色灯塔，清晨柔光，极简构图",
        status: "processing",
        mode: "pro",
        width: 512,
        height: 768,
        createdAt,
      },
    ],
    preferredSize: { width: 768, height: 512 },
  },
  version: 0,
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 960 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(
      ({ state, id }) => {
        sessionStorage.setItem(
          "photo-web:access-token",
          "header.eyJ1c2VybmFtZSI6ImNyZWF0b3IifQ.signature",
        );
        localStorage.setItem("photo-web:refresh-token", "refresh-token");
        localStorage.setItem("photo-web:username", "creator");
        sessionStorage.setItem("photo-web:workspace", JSON.stringify(state));
        void id;
      },
      { state: workspaceState, id: recordId },
    );
    const page = await context.newPage();
    await page.route("**/api/v1/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      if (path.endsWith("/generate/styles")) {
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            code: 0,
            message: "success",
            data: [
              {
                id: styleId,
                name: "anime",
                display_name: "动漫风格",
                description: "日系动漫风格，色彩鲜艳，线条清晰",
                preset_params: {},
                sort_order: 1,
                preview_url: "",
                is_active: true,
                created_at: createdAt,
                updated_at: createdAt,
              },
              {
                id: "46f3606f-7f37-4f50-98e7-8e3a1329b521",
                name: "realistic",
                display_name: "写实风格",
                description: "照片级写实风格，细节丰富",
                preset_params: {},
                sort_order: 2,
                preview_url: "",
                is_active: true,
                created_at: createdAt,
                updated_at: createdAt,
              },
              {
                id: "94d9592c-f629-446a-998e-4ee1224b68e9",
                name: "watercolor",
                display_name: "水彩风格",
                description: "柔和的水彩画风格",
                preset_params: {},
                sort_order: 3,
                preview_url: "",
                is_active: true,
                created_at: createdAt,
                updated_at: createdAt,
              },
              {
                id: "43f03257-15ff-4e7a-b614-dcf8d36d2783",
                name: "oil_painting",
                display_name: "油画风格",
                description: "古典油画风格，笔触明显",
                preset_params: {},
                sort_order: 4,
                preview_url: "",
                is_active: true,
                created_at: createdAt,
                updated_at: createdAt,
              },
            ],
          }),
        });
      }
      if (path.endsWith(`/generate/status/${recordId}`)) {
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            code: 0,
            message: "success",
            data: {
              record_id: recordId,
              status: "completed",
              prompt: "雨后的东京街头，霓虹倒映在积水里，电影感广角",
              image_url: "generated/mock.png",
              width: 768,
              height: 512,
              seed: 4282,
              duration_ms: 2430,
            },
          }),
        });
      }
      if (path.endsWith("/files/generated/mock.png")) {
        return route.fulfill({
          contentType: "image/svg+xml",
          body: `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="512"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#1e3546"/><stop offset=".55" stop-color="#975943"/><stop offset="1" stop-color="#f1c795"/></linearGradient></defs><rect width="768" height="512" fill="url(#g)"/><circle cx="550" cy="180" r="86" fill="#ffe2b0" opacity=".85"/><path d="M0 365L180 260l140 85 170-132 278 177v122H0z" fill="#15242d" opacity=".9"/><path d="M0 402h768v110H0z" fill="#0e1d27"/><g stroke="#efad76" stroke-width="5" opacity=".65"><path d="M96 512l36-124"/><path d="M190 512l-10-93"/><path d="M670 512l-26-134"/></g></svg>`,
        });
      }
      return route.continue();
    });

    await page.goto("http://127.0.0.1:4173/create");
    await page.getByText("创作完成").waitFor();
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `/private/tmp/photo-web-${name}.png`,
      fullPage: false,
    });
    if (name === "mobile") {
      await page.getByText("创作完成").scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await page.screenshot({
        path: "/private/tmp/photo-web-mobile-result.png",
        fullPage: false,
      });
    }
    await context.close();
  }

  const loginContext = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });
  const loginPage = await loginContext.newPage();
  await loginPage.goto("http://127.0.0.1:4173/login");
  await loginPage.getByRole("heading", { name: "继续你的创作" }).waitFor();
  await loginPage.screenshot({
    path: "/private/tmp/photo-web-login.png",
    fullPage: false,
  });
  await loginContext.close();
} finally {
  await browser.close();
}
