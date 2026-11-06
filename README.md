# photo-web-frontend

Photo Web 的 React 单页前端，按照根目录 `FRONTEND_DESIGN.md` 和相邻 `photo-web` 后端接口实现。

## 本地运行

```bash
cp .env.template .env
npm install
npm run dev
```

开发服务器运行在 `http://localhost:5173`，并将 `/api` 代理到
`http://localhost:8080`。

生产构建：

```bash
npm run build
```

## 已实现

- 注册、登录、路由守卫，以及登录后返回原访问页面。
- Access Token 保存于 `sessionStorage`，Refresh Token 保存于 `localStorage`。
- 401 并发请求共享单次刷新任务，原请求最多重放一次。
- 快捷模式、专业模式和与后端一致的字段校验。
- 1 秒首次等待、约 1.8 秒轮询、后台降频、失败退避和 5 分钟截止。
- `pending`、`processing`、`completed`、`failed` 四态画布。
- 大图查看、复制提示词、下载、再次生成和最近任务恢复。
- 历史记录服务端分页、详情、完整参数、删除确认和再次生成。
- 桌面三栏、平板双栏、移动端单列与安全区适配。

## 测试

```bash
npm test
npm run test:e2e
```

Playwright 测试通过拦截 API 请求验证登录、生成轮询和历史空状态，不依赖本地后端或外部网络。
