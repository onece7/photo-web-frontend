import { expect, test, type Page } from "@playwright/test";

const recordId = "1a703f01-53a2-4d3e-aae4-b300583710f8";

test("login, submit a simple generation and receive the image", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/login");

  await page.getByLabel("用户名").fill("creator");
  await page.getByLabel("密码", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "进入创作" }).click();

  await expect(page).toHaveURL(/\/create$/);
  await page
    .getByLabel("提示词")
    .fill("雨后的东京街头，霓虹倒映在积水里");
  await page.getByRole("button", { name: /动漫风格/ }).click();
  await page.getByRole("button", { name: "开始生成" }).click();

  await expect(
    page.getByRole("button", { name: "开始生成" }),
  ).toBeEnabled({ timeout: 100 });
  await expect(page.getByText("创作完成")).toBeVisible({ timeout: 8_000 });
  await expect(
    page.getByRole("img", { name: /雨后的东京街头/ }),
  ).toBeVisible();
});

test("history empty state provides a path back to creation", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/login");
  await page.getByLabel("用户名").fill("creator");
  await page.getByLabel("密码", { exact: true }).fill("password123");
  await page.getByRole("button", { name: "进入创作" }).click();
  await page.getByRole("link", { name: "历史" }).click();

  await expect(page.getByRole("heading", { name: "我的作品" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "还没有作品" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "开始创作" }),
  ).toBeVisible();
});

async function mockApi(page: Page) {
  let statusCalls = 0;
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path.endsWith("/auth/login")) {
      return json(route, {
        code: 0,
        message: "success",
        data: {
          access_token:
            "header.eyJ1c2VybmFtZSI6ImNyZWF0b3IifQ.signature",
          refresh_token: "refresh-token",
          expires_in: 900,
        },
      });
    }

    if (path.endsWith("/generate/styles")) {
      return json(route, {
        code: 0,
        message: "success",
        data: [
          {
            id: "f1fd6626-688b-4c6c-b7c3-c6be97f27c43",
            name: "anime",
            display_name: "动漫风格",
            description: "日系动漫风格，色彩鲜艳",
            preset_params: {},
            sort_order: 1,
            preview_url: "",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
      });
    }

    if (path.endsWith("/generate/simple")) {
      return json(
        route,
        {
          code: 0,
          message: "success",
          data: { record_id: recordId, status: "pending" },
        },
        202,
      );
    }

    if (path.endsWith(`/generate/status/${recordId}`)) {
      statusCalls += 1;
      return json(route, {
        code: 0,
        message: "success",
        data:
          statusCalls < 2
            ? {
                record_id: recordId,
                status: "processing",
                prompt: "雨后的东京街头，霓虹倒映在积水里",
                width: 512,
                height: 512,
              }
            : {
                record_id: recordId,
                status: "completed",
                prompt: "雨后的东京街头，霓虹倒映在积水里",
                image_url: "generated/mock.png",
                width: 512,
                height: 512,
                seed: 42,
                duration_ms: 2300,
              },
      });
    }

    if (path.endsWith("/history")) {
      return json(route, {
        code: 0,
        message: "success",
        data: {
          records: [],
          total: 0,
          page: 1,
          page_size: 24,
          total_pages: 0,
        },
      });
    }

    if (path.endsWith("/files/generated/mock.png")) {
      return route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="#29323b"/><circle cx="260" cy="240" r="120" fill="#d87650"/></svg>`,
      });
    }

    return route.continue();
  });
}

function json(
  route: Parameters<Parameters<Page["route"]>[1]>[0],
  body: unknown,
  status = 200,
) {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}
