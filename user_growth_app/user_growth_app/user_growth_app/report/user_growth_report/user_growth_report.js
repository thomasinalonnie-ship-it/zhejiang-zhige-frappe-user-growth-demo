frappe.query_reports["User Growth Report"] = {
	onload() {
		localize_report_shell();
	},
	refresh() {
		localize_report_shell();
	},
	after_datatable_render() {
		localize_report_shell();
	},
	filters: [
		{
			fieldname: "from_date",
			label: __("起始日期"),
			fieldtype: "Date",
			default: frappe.datetime.add_months(frappe.datetime.get_today(), -6),
		},
		{
			fieldname: "to_date",
			label: __("结束日期"),
			fieldtype: "Date",
			default: frappe.datetime.get_today(),
		},
		{
			fieldname: "channel",
			label: __("获客渠道"),
			fieldtype: "Select",
			options: "\n自然增长\n广告投放\n转介绍\n渠道伙伴\n主动拓展",
		},
		{
			fieldname: "plan",
			label: __("套餐"),
			fieldtype: "Select",
			options: "\n基础版\n专业版\n企业版",
		},
	],
};

function localize_report_shell() {
	[80, 500, 1500, 3000].forEach((delay) => setTimeout(() => {
		const title = document.querySelector(".page-title .title-text, .page-title h3, .page-head .title-text");
		if (title && title.textContent.trim() === "User Growth Report") {
			title.textContent = "用户增长分析报表";
		}
		document.querySelectorAll("button, .btn").forEach((element) => {
			const text = element.textContent.trim();
			if (text === "Actions") element.textContent = "操作";
			if (text === "Menu") element.setAttribute("title", "更多");
		});
		document.querySelectorAll("a, .dropdown-item, .menu-item-label").forEach((element) => {
			const text = element.textContent.trim();
			if (text === "PDF") element.textContent = "导出PDF";
		});
		document.querySelectorAll("input[placeholder]").forEach((element) => {
			const placeholder = element.getAttribute("placeholder") || "";
			if (placeholder.startsWith("Filter based on ")) {
				element.setAttribute("placeholder", `筛选${placeholder.replace("Filter based on ", "")}`);
				element.setAttribute("aria-label", `筛选${placeholder.replace("Filter based on ", "")}`);
			}
		});
	}, delay));
}
