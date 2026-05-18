# 用户增长应用

这是一个基于 Frappe Framework 的自定义应用，用于完成浙江智格 Python 全栈笔试题的 MVP 交付。应用围绕“用户服务开通/流失”数据，提供单据、报表和大屏页面三类验收入口。

## 交付内容

- `User Service Lifecycle` 单据：维护用户开通、状态、流失、渠道、套餐、收入等结构化数据。
- `User Growth Report` 报表：按月份汇总新增用户、流失用户、净增长、活跃收入和流失率。
- `user-growth-dashboard` 页面：提供用户增长数据大屏，支持日期、渠道、套餐筛选。
- `user_growth_app.api`：统一封装演示数据生成和指标聚合逻辑，避免报表与页面口径不一致。
- 浙江智格品牌露出：大屏标题区和侧栏使用公司名称，并以独立 PNG 图片方式植入公司标志。

> 说明：Frappe 标准对象的内部名称保留英文，便于框架解析、安装和迁移；用户可见的字段、报表列、筛选项、按钮、说明和演示数据已中文化。

## 环境要求

- Frappe Framework v15
- Python 3.11
- Node.js / Yarn
- MariaDB 或 MySQL

## 安装方式

在已有 Frappe bench 中安装：

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $PATH_OR_GIT_URL_TO_THIS_APP
bench --site $SITE_NAME install-app user_growth_app
bench --site $SITE_NAME migrate
```

如果收到的是压缩包，请先解压，再把解压后的应用目录传给 `bench get-app`。

## 初始化演示数据

安装完成后执行：

```bash
bench --site $SITE_NAME execute user_growth_app.api.seed_mock_data --kwargs '{"records": 90}'
```

该命令可以重复执行，会删除用户编号以 `UG-` 开头的旧演示数据，并重新生成 90 条中文演示数据。

## 验收入口

登录 Frappe Desk 后打开：

- 单据列表：`/app/user-service-lifecycle`
- 增长报表：`/app/query-report/User%20Growth%20Report`
- 数据大屏：`/app/user-growth-dashboard`

推荐先看数据大屏，再从大屏按钮进入单据和报表。

## 数据模型

`User Service Lifecycle` 表示一条用户服务生命周期记录，核心字段包括：

- 用户信息：用户编号、用户名称、地区、行业、负责人
- 生命周期：开通日期、服务状态、流失日期、流失原因
- 商业信息：获客渠道、套餐、月经常收入

校验规则：

- 服务状态为“流失”时必须填写流失日期。
- 流失日期不能早于开通日期。
- 非流失状态会自动清空流失原因。

## 报表逻辑

`User Growth Report` 使用同一套服务端聚合逻辑，输出：

- 新增用户
- 流失用户
- 净增长
- 活跃用户
- 活跃月经常收入
- 流失率

报表支持按日期范围、获客渠道和套餐筛选。

## 大屏逻辑

`用户增长驾驶舱` 页面包含：

- 日期、渠道、套餐筛选器
- 用户总数、活跃用户、新增用户、流失用户、净增长、月经常收入、流失率
- 月度增长趋势图
- 地区分布、渠道分布、套餐收入结构、流失原因
- 最近服务生命周期记录
- 单据、报表、演示数据重置入口

视觉采用“奶油纸 + 深棕侧栏”的经营驾驶舱样式。公司标志通过 `<img>` 引入，CSS 只控制位置、尺寸、边框和阴影，避免用 AI 重绘或 SVG 仿制品牌图形。

## 架构说明

本应用采用保守的 Frappe 标准结构：

- Doctype 负责数据录入和校验。
- Script Report 负责原生报表验收。
- Custom Page 负责大屏展示和交互。
- `api.py` 作为统一指标口径层，报表和大屏都从这里取数。

这样做的好处是安装风险低、代码边界清楚、后续可以继续扩展权限、更多报表、更多图表或真实数据导入。

## 本地自测命令

```bash
bench --site usergrowth.localhost list-apps
bench --site usergrowth.localhost migrate
bench --site usergrowth.localhost execute user_growth_app.api.seed_mock_data --kwargs '{"records": 90}'
bench --site usergrowth.localhost execute frappe.db.count --args '["User Service Lifecycle"]'
bench --site usergrowth.localhost execute user_growth_app.api.get_growth_dashboard_data
bench --site usergrowth.localhost execute user_growth_app.user_growth_app.report.user_growth_report.user_growth_report.execute
```

## 许可证

MIT
