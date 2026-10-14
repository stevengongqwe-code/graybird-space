# 自动化质量检查

本项目是无需运行时框架的静态网站。GitHub Actions 在每次 push 和 PR 创建、更新或重新打开时运行一个最多 10 分钟的检查任务；同一分支的新提交取消旧任务以节省额度。工作流只有仓库读取权限，不含部署、密钥或付费服务步骤。

## 覆盖范围

- 已跟踪 Python 和 JavaScript 文件的语法。
- 标准库内容生成器的数据校验及构建。
- 首页、鸟窝、档案馆和 sitemap 与生成结果的一致性，包括未提交的新路由。
- 现有两套小游戏测试：武器、升级、碰撞、Boss、暂停、复活、收益结算和固定种子的双尺寸长时间模拟。
- 本地 HTTP 服务上的内部页面、图片等资源、锚点和重复 ID，复用现有链接检查器。

没有添加 npm/pip 依赖。Node.js 24 和 Python 3.12 由 Actions 提供，第三方 Actions 固定到提交 SHA。只使用标准 push/pull_request 事件，不使用 pull_request_target。

## 本地运行

在干净的 Git 工作区中执行：

```sh
python3 scripts/ci_checks.py
```

需要 Git、Node.js 24 和 Python 3.12。此命令会运行内容生成器并检查差异；若因内容未更新而失败，执行 `python3 scripts/build_content.py`、审核生成差异并将生成页面随数据一起提交。HTTP 服务仅监听本机临时端口，检查结束后关闭。

## 限制与维护

这套低成本基础检查不覆盖真实浏览器渲染、触摸交互、搜索/历史记录、视觉截图、音效、线上 HTTPS 或外部 X 链接可用性。现有 `qa_frontend.py` 和游戏浏览器 QA 脚本保留，涉及界面修改时仍应按 AGENTS.md 手动运行；常规 CI 不安装 Playwright/Chromium。

PR 审核后由维护者决定合并。若希望禁止跳过检查，可在 GitHub 分支保护中手动将 `Static site and game checks` 设为必需状态检查。工作流不会更改 Pages、CNAME、DNS 或线上网站。
