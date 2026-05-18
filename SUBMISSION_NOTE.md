# Frappe 用户增长 App 提交说明

本压缩包包含一个可安装的 Frappe 自定义 App，用于展示用户服务开通、用户增长、流失分析和经营大屏。

交付重点是满足三个验收入口：单据、报表、页面。内部对象名为了保持 Frappe 标准报表解析稳定，保留少量英文技术名称；用户可见的字段、筛选项、报表列、图表、页面文案和演示数据均已中文化。

## 包内结构

- `user_growth_app/`：可安装的 Frappe App 源码。
- `screenshots/dashboard.png`：用户增长数据大屏截图。
- `screenshots/report.png`：用户增长分析报表截图。
- `screenshots/doctype-list.png`：用户服务开通与流失单列表截图。
- `screenshots/doctype-form.png`：用户服务开通与流失单新增表单截图。

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

建议验收顺序：

1. 先打开用户增长大屏，确认有 KPI、筛选器、趋势图、分布图、最近记录和跳转按钮。
2. 点击大屏中的“单据”，确认用户名称、服务状态、地区、行业、开通日期、获客渠道、套餐、月经常收入等字段可见。
3. 点击大屏中的“报表”，确认报表摘要、图表、表格列、筛选器均可展示增长和流失数据。
4. 点击“重置演示数据”，确认可以重新生成 90 条演示数据。

## 本地验证结果

- 已安装 `user_growth_app`。
- 已迁移 DocType / Report / Page。
- 已生成 90 条用户服务生命周期演示数据。
- 单据列表、单据详情、报表和页面均已本地打开验证。
- 页面已按“奶油纸 + 深棕侧栏”的中文经营驾驶舱风格重建。
- 大屏、列表、报表、表单的按钮和下拉菜单已做点击验收：应用筛选、重置筛选、查看单据、查看报表、重置数据、列表视图、更多、新增用户服务单、操作、刷新、更多菜单均可点击且未发现文字裁切。
- 浙江智格公司标志来自给定源图，已按透明 PNG 方式植入；HTML 使用 `<img>` 引用，CSS 仅控制位置、尺寸和阴影，不再带白色底块。

## 架构说明

- `DocType`：承载用户服务开通、状态、流失、渠道、套餐和收入等结构化数据。
- `Script Report`：承载 Frappe 原生报表验收，按月份汇总新增用户、流失用户和净增长。
- `Page`：承载大屏展示和交互，包含日期、渠道、套餐筛选，以及单据/报表/数据重置入口。
- `user_growth_app/api.py`：统一服务端指标口径，避免报表和大屏各算各的导致数据不一致。

## 参考方向

实现方式参考了 Frappe 官方 Script Report、Page 文档，以及 Frappe Insights / Frappe Charts 这类仪表盘项目的结构思路：保留 Frappe 标准对象，优先用服务端聚合口径支撑报表和页面，再用 Page 做更强的业务展示。
