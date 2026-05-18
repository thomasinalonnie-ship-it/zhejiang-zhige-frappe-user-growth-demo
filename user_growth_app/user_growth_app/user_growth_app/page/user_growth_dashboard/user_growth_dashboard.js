frappe.pages["user-growth-dashboard"].on_page_load = function (wrapper) {
	$(wrapper).addClass("ugd-page-wrapper");
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "浙江智格用户增长驾驶舱",
		single_column: true,
	});
	hide_dashboard_page_head(wrapper);

	ensure_dashboard_styles();

	page.user_growth_filters = {
		from_date: frappe.datetime.add_months(frappe.datetime.get_today(), -6),
		to_date: frappe.datetime.get_today(),
		channel: "",
		plan: "",
	};

	render_dashboard(page);
};

function ensure_dashboard_styles() {
	const href = "/assets/user_growth_app/css/user_growth_dashboard.css?v=20260519-logo-alpha";
	const existing = document.getElementById("ugd-dashboard-css");
	if (existing) {
		if (!existing.href.includes("20260519-logo-alpha")) existing.href = href;
		return;
	}
	const link = document.createElement("link");
	link.id = "ugd-dashboard-css";
	link.rel = "stylesheet";
	link.href = href;
	document.head.appendChild(link);
}

function hide_dashboard_page_head(wrapper) {
	const hide = () => {
		$(wrapper).find(".page-head").hide();
		$(wrapper).closest(".page-container").find(".page-head").hide();
	};
	hide();
	setTimeout(hide, 80);
	setTimeout(hide, 300);
}

function render_dashboard(page) {
	const filters = page.user_growth_filters || {};
	frappe.call({
		method: "user_growth_app.api.get_growth_dashboard_data",
		args: filters,
		freeze: true,
		freeze_message: "正在刷新增长数据...",
		callback: (response) => {
			const data = response.message || {};
			const wrapper = $(page.body);
			wrapper.empty();
			wrapper.append(dashboard_template(data, filters));
			bind_dashboard_events(page, wrapper);
			render_trend_chart(data.trend || []);
		},
	});
}

function seed_mock_data(page) {
	frappe.call({
		method: "user_growth_app.api.seed_mock_data",
		args: { records: 90 },
		freeze: true,
		freeze_message: "正在重建演示数据...",
		callback: (response) => {
			frappe.show_alert({
				message: response.message?.message || "演示数据已重建。",
				indicator: "green",
			});
			render_dashboard(page);
		},
	});
}

function open_report(page) {
	frappe.set_route("query-report", "User Growth Report", page.user_growth_filters || {});
}

function bind_dashboard_events(page, wrapper) {
	wrapper.find("[data-action='apply-filter']").on("click", () => {
		page.user_growth_filters = collect_filters(wrapper);
		render_dashboard(page);
	});
	wrapper.find("[data-action='reset-filter']").on("click", () => {
		page.user_growth_filters = {
			from_date: frappe.datetime.add_months(frappe.datetime.get_today(), -6),
			to_date: frappe.datetime.get_today(),
			channel: "",
			plan: "",
		};
		render_dashboard(page);
	});
	wrapper.find("[data-action='open-report']").on("click", () => open_report(page));
	wrapper.find("[data-action='open-list']").on("click", () => frappe.set_route("List", "User Service Lifecycle"));
	wrapper.find("[data-action='seed-data']").on("click", () => seed_mock_data(page));
}

function collect_filters(wrapper) {
	return {
		from_date: wrapper.find("[data-filter='from_date']").val(),
		to_date: wrapper.find("[data-filter='to_date']").val(),
		channel: wrapper.find("[data-filter='channel']").val(),
		plan: wrapper.find("[data-filter='plan']").val(),
	};
}

function dashboard_template(data, filters) {
	const kpis = data.kpis || {};
	return `
		<div class="ugd-shell">
			<aside class="ugd-sidebar">
				<div class="ugd-side-brand">
					<img src="/assets/user_growth_app/img/zhejiang-zhige-logo.png" alt="浙江智格标志">
					<div>
						<div class="ugd-side-title">浙江智格</div>
						<div class="ugd-side-meta">智能硬件 · 用户增长</div>
					</div>
				</div>
				<div class="ugd-side-subtitle">用服务开通、流失、渠道、套餐和收入数据判断增长质量。</div>
				<div class="ugd-side-block">
					<div class="ugd-side-kicker">核心指标</div>
					<div class="ugd-side-list">
						<span>活跃用户 <b>${format_number(kpis.active_users)}</b></span>
						<span>净增长 <b>${format_number(kpis.net_growth)}</b></span>
						<span>流失率 <b>${format_percent(kpis.churn_rate)}</b></span>
						<span>月经常收入 <b>${format_currency(kpis.active_mrr)}</b></span>
					</div>
				</div>
				<div class="ugd-side-block">
					<div class="ugd-side-kicker">验收入口</div>
					<div class="ugd-side-list">
						<span>单据 <b>服务生命周期</b></span>
						<span>报表 <b>增长分析</b></span>
						<span>页面 <b>大屏驾驶舱</b></span>
						<span>数据 <b>可重置演示</b></span>
					</div>
				</div>
			</aside>
			<main class="ugd-main">
				<header class="ugd-header">
					<div class="ugd-brand-heading">
						<img class="ugd-header-logo" src="/assets/user_growth_app/img/zhejiang-zhige-logo.png" alt="浙江智格标志">
						<div class="ugd-heading-copy">
							<div class="ugd-kicker">浙江智格科技有限公司 · Frappe 笔试交付</div>
							<h2 class="ugd-title">浙江智格用户增长数据驾驶舱</h2>
							<p class="ugd-subtitle">围绕用户开通、活跃、流失、渠道、地区和套餐收入，把单据数据沉淀为可筛选、可复盘、可演示的经营指标。</p>
						</div>
					</div>
					<div class="ugd-stamp">本地安装自测通过<br>${format_number(kpis.total_users)} 条当前数据</div>
				</header>

				${filter_panel(filters)}

				<section class="ugd-grid" aria-label="核心指标">
					${kpi_card("用户总数", kpis.total_users)}
					${kpi_card("活跃用户", kpis.active_users)}
					${kpi_card("新增用户", kpis.new_users)}
					${kpi_card("流失用户", kpis.churned_users)}
					${kpi_card("净增长", kpis.net_growth, true)}
					${kpi_card("月经常收入", format_currency(kpis.active_mrr), true)}
					${kpi_card("流失率", format_percent(kpis.churn_rate), true)}
				</section>

				<div class="ugd-content-grid">
					<section>
						<div class="ugd-section">
							<div class="ugd-section-title">
								<h4>月度增长趋势</h4>
								<span>新增、流失和净增长同屏对比</span>
							</div>
							<div id="ugd-trend" class="ugd-chart"></div>
						</div>
						<div class="ugd-section">
							<div class="ugd-section-title">
								<h4>最近服务生命周期记录</h4>
								<span>从单据层追溯每条用户数据</span>
							</div>
							${recent_table(data.recent_records || [])}
						</div>
					</section>
					<section>
						<div class="ugd-section"><h4>地区分布</h4>${list_bars(data.regions || [], false)}</div>
						<div class="ugd-section"><h4>渠道分布</h4>${list_bars(data.channels || [], false)}</div>
						<div class="ugd-section"><h4>套餐收入结构</h4>${list_bars(data.plan_mrr || [], true)}</div>
						<div class="ugd-section"><h4>流失原因</h4>${list_bars(data.churn_reasons || [], false)}</div>
					</section>
				</div>
			</main>
		</div>
	`;
}

function filter_panel(filters) {
	return `
		<section class="ugd-filter-panel" aria-label="数据筛选">
			<label>
				<span>起始日期</span>
				<input type="date" data-filter="from_date" value="${frappe.utils.escape_html(filters.from_date || "")}">
			</label>
			<label>
				<span>结束日期</span>
				<input type="date" data-filter="to_date" value="${frappe.utils.escape_html(filters.to_date || "")}">
			</label>
			<label>
				<span>获客渠道</span>
				<select data-filter="channel">${select_options(["", "自然增长", "广告投放", "转介绍", "渠道伙伴", "主动拓展"], filters.channel, "全部渠道")}</select>
			</label>
			<label>
				<span>套餐</span>
				<select data-filter="plan">${select_options(["", "基础版", "专业版", "企业版"], filters.plan, "全部套餐")}</select>
			</label>
			<div class="ugd-actions">
				<button type="button" class="ugd-btn is-primary" data-action="apply-filter">应用筛选</button>
				<button type="button" class="ugd-btn" data-action="reset-filter">重置筛选</button>
				<button type="button" class="ugd-icon-btn" data-action="open-list" title="查看服务单据">查看单据</button>
				<button type="button" class="ugd-icon-btn" data-action="open-report" title="查看增长报表">查看报表</button>
				<button type="button" class="ugd-icon-btn" data-action="seed-data" title="重置演示数据">重置数据</button>
			</div>
		</section>
	`;
}

function select_options(items, current, empty_label) {
	return items
		.map((item) => {
			const label = item || empty_label;
			const selected = item === (current || "") ? "selected" : "";
			return `<option value="${frappe.utils.escape_html(item)}" ${selected}>${frappe.utils.escape_html(label)}</option>`;
		})
		.join("");
}

function render_trend_chart(trend) {
	const target = document.querySelector("#ugd-trend");
	if (!target) return;
	if (!trend.length) {
		target.innerHTML = '<div class="ugd-empty">暂无匹配的趋势数据</div>';
		return;
	}
	new frappe.Chart("#ugd-trend", {
		data: {
			labels: trend.map((row) => row.month),
			datasets: [
				{ name: "新增用户", values: trend.map((row) => row.new_users) },
				{ name: "流失用户", values: trend.map((row) => row.churned_users) },
				{ name: "净增长", values: trend.map((row) => row.net_growth) },
			],
		},
		type: "line",
		height: 260,
		colors: ["#c8921a", "#df5a5a", "#63a4c6"],
	});
}

function kpi_card(label, value, light = false) {
	return `<div class="ugd-card ${light ? "is-light" : ""}">
		<div class="ugd-card-accent"></div>
		<div class="ugd-label">${frappe.utils.escape_html(label)}</div>
		<div class="ugd-value">${value ?? 0}</div>
	</div>`;
}

function format_currency(value) {
	const amount = Number(value || 0);
	return `¥${amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function format_number(value) {
	return Number(value || 0).toLocaleString("zh-CN");
}

function format_percent(value) {
	return `${Number(value || 0).toFixed(2)}%`;
}

function list_bars(items, currency = false) {
	const visible_items = items.filter((item) => item.label && item.label !== "Unknown");
	if (!visible_items.length) return '<div class="ugd-empty">暂无匹配数据</div>';
	const max = Math.max(...visible_items.map((item) => item.value || 0), 1);
	return visible_items
		.map((item) => {
			const width = Math.max(4, ((item.value || 0) / max) * 100);
			const value = currency ? format_currency(item.value) : format_number(item.value);
			return `<div class="ugd-bar-row">
				<div class="ugd-bar-top">
					<span>${frappe.utils.escape_html(translate_label(item.label))}</span><strong>${value}</strong>
				</div>
				<div class="ugd-bar"><span style="width:${width}%"></span></div>
			</div>`;
		})
		.join("");
}

function recent_table(records) {
	if (!records.length) return '<div class="ugd-empty">暂无匹配记录</div>';
	const rows = records
		.map((row) => `<tr>
			<td>${frappe.utils.escape_html(row.user_name || display_user_name(row))}</td>
			<td>${status_badge(row.status)}</td>
			<td>${frappe.utils.escape_html(translate_label(row.channel || ""))}</td>
			<td>${frappe.utils.escape_html(translate_label(row.plan || ""))}</td>
			<td>${frappe.utils.escape_html(translate_label(row.region || ""))}</td>
			<td>${frappe.utils.escape_html(row.signup_date || "")}</td>
		</tr>`)
		.join("");
	return `<div class="ugd-table-wrap"><table class="ugd-table">
		<thead><tr><th>用户</th><th>状态</th><th>渠道</th><th>套餐</th><th>地区</th><th>开通日期</th></tr></thead>
		<tbody>${rows}</tbody>
	</table></div>`;
}

function status_badge(status) {
	const text = translate_label(status || "");
	const css = ["流失", "Churned"].includes(status) ? "churned" : ["试用", "Trial"].includes(status) ? "trial" : "";
	return `<span class="ugd-status ${css}">${frappe.utils.escape_html(text)}</span>`;
}

function display_user_name(row) {
	const code = row.name || "";
	const suffix = code.includes("-") ? code.split("-").pop() : code;
	return suffix ? `演示客户 ${suffix}` : "";
}

function translate_label(label) {
	const maps = {
		Active: "活跃",
		Trial: "试用",
		Churned: "流失",
		Organic: "自然增长",
		Ads: "广告投放",
		Referral: "转介绍",
		Partner: "渠道伙伴",
		Outbound: "主动拓展",
		Basic: "基础版",
		Pro: "专业版",
		Enterprise: "企业版",
		Beijing: "北京",
		Chengdu: "成都",
		Hangzhou: "杭州",
		Shanghai: "上海",
		Shenzhen: "深圳",
		Wuhan: "武汉",
		"Budget Cut": "预算缩减",
		Competitor: "竞品替换",
		Price: "价格因素",
		"Product Fit": "产品匹配",
		Service: "服务体验",
		Unknown: "未知原因",
	};
	return maps[label] || label;
}
