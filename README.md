# 浙江智格 Frappe 用户增长 App

这是浙江智格 Python 全栈笔试题的 Frappe 自定义 App 交付包。包内包含源码、安装说明、运行截图和提交说明。

## 交付内容

- `user_growth_app/`：可安装的 Frappe App 源码。
- `SUBMISSION_NOTE.md`：提交说明、验收入口、架构说明和本地验证结果。
- `screenshots/dashboard.png`：用户增长驾驶舱截图。
- `screenshots/report.png`：用户增长分析报表截图。
- `screenshots/doctype-list.png`：用户服务开通与流失单列表截图。
- `screenshots/doctype-form.png`：新增用户服务单表单截图。

## 安装方式

在已有 Frappe v15 bench 中执行：

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app ./path/to/user_growth_app
bench --site $SITE_NAME install-app user_growth_app
bench --site $SITE_NAME migrate
bench --site $SITE_NAME execute user_growth_app.api.seed_mock_data --kwargs '{"records": 90}'
```

## 验收入口

登录 Frappe Desk 后访问：

- 单据列表：`/app/user-service-lifecycle`
- 增长报表：`/app/query-report/User%20Growth%20Report`
- 用户增长大屏：`/app/user-growth-dashboard`

本地演示账号：

- 账号：`Administrator`
- 密码：`admin`

## 本地自测结果

- 已生成 90 条 mock 数据。
- 单据列表、单据表单、增长报表、用户增长大屏均可打开。
- 大屏按钮、列表按钮、报表按钮和下拉菜单均已做点击验收。
- 用户可见字段、筛选项、报表列、图表、菜单和按钮已中文化。
- 浙江智格标志已按透明 PNG 方式嵌入，页面不依赖白色底图。

内部对象名为保持 Frappe 安装、迁移和报表解析稳定，保留少量英文技术名；用户可见界面已按中文交付。
