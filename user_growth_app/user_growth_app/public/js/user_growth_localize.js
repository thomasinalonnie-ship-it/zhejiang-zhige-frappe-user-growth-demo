(function () {
	const TEXT_MAP = {
		"User Growth App": "用户增长应用",
		"User Growth Dashboard": "用户增长驾驶舱",
		"User Growth Report": "用户增长分析报表",
		"User Service Lifecycle": "用户服务开通与流失单",
		"Add User Service Lifecycle": "新增用户服务单",
		"添加 用户服务开通与流失单": "新增用户服务单",
		Actions: "操作",
		Refresh: "刷新",
		More: "更多",
		Menu: "更多",
		Filter: "筛选",
		Filters: "筛选",
		"Clear all filters": "清空全部筛选",
		"Reset Filters": "重置筛选",
		"List View": "列表视图",
		Export: "导出",
		PDF: "导出PDF",
		Print: "打印",
		Save: "保存",
		Add: "新增",
		Create: "新建",
		Edit: "编辑",
		Delete: "删除",
		Duplicate: "复制",
		Cancel: "取消",
		"Assign To": "分配给",
		Share: "分享",
		Tags: "标签",
		"附件集": "附件",
		"Last Updated On": "最近更新时间",
	};

	const PLACEHOLDER_MAP = {
		"Search or type a command": "搜索或输入命令",
		"Search User Service Lifecycle": "搜索用户服务单",
		"Search List": "搜索列表",
	};

	function is_user_growth_route() {
		if (!window.frappe || !frappe.get_route) return false;
		const route = frappe.get_route().join(" ");
		return /User Growth|user-growth|User Service Lifecycle|user-service-lifecycle|用户增长/.test(route);
	}

	function mark_user_growth_route() {
		if (!window.frappe || !frappe.get_route) return;
		const route_parts = frappe.get_route();
		const route = route_parts.join(" ");
		const class_names = [
			"user-growth-desk",
			"user-growth-list",
			"user-growth-form",
			"user-growth-report",
			"user-growth-dashboard-route",
		];
		document.body.classList.remove(...class_names);
		if (!is_user_growth_route()) return;

		document.body.classList.add("user-growth-desk");
		if (route_parts[0] === "List" && route.includes("User Service Lifecycle")) {
			document.body.classList.add("user-growth-list");
		}
		if (route_parts[0] === "Form" && route.includes("User Service Lifecycle")) {
			document.body.classList.add("user-growth-form");
		}
		if (route_parts[0] === "query-report" && route.includes("User Growth Report")) {
			document.body.classList.add("user-growth-report");
		}
		if (route.includes("user-growth-dashboard")) {
			document.body.classList.add("user-growth-dashboard-route");
		}
	}

	function replace_text(element) {
		const text = (element.textContent || "").trim();
		if (TEXT_MAP[text]) element.textContent = TEXT_MAP[text];
	}

	function localize_placeholder(element) {
		const placeholder = (element.getAttribute("placeholder") || "").trim();
		if (PLACEHOLDER_MAP[placeholder]) {
			element.setAttribute("placeholder", PLACEHOLDER_MAP[placeholder]);
		}
		if (placeholder.startsWith("Filter based on ")) {
			element.setAttribute("placeholder", `筛选${placeholder.replace("Filter based on ", "")}`);
		}
	}

	function localize_label_attribute(element, attribute) {
		const value = (element.getAttribute(attribute) || "").trim();
		if (TEXT_MAP[value]) {
			element.setAttribute(attribute, TEXT_MAP[value]);
		}
		if (value.startsWith("Filter based on ")) {
			element.setAttribute(attribute, `筛选${value.replace("Filter based on ", "")}`);
		}
	}

	function localize_user_growth_shell() {
		mark_user_growth_route();
		if (!is_user_growth_route()) return;

		document
			.querySelectorAll(".page-title, .title-text, h3, button, .btn, .dropdown-item, .menu-item-label, .list-sidebar span, label, a")
			.forEach(replace_text);

		document.querySelectorAll("[title]").forEach((element) => localize_label_attribute(element, "title"));
		document.querySelectorAll("[aria-label]").forEach((element) => localize_label_attribute(element, "aria-label"));
		document.querySelectorAll("[data-original-title]").forEach((element) => localize_label_attribute(element, "data-original-title"));

		document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(localize_placeholder);
	}

	function schedule_localize() {
		mark_user_growth_route();
		[50, 250, 650, 1500, 3000].forEach((delay) => setTimeout(localize_user_growth_shell, delay));
	}

	function ensure_global_styles() {
		const href = "/assets/user_growth_app/css/user_growth_global.css?v=20260519-layout4";
		const existing = document.getElementById("user-growth-global-css");
		if (existing) {
			if (!existing.href.includes("20260519-layout4")) existing.href = href;
			return;
		}
		const link = document.createElement("link");
		link.id = "user-growth-global-css";
		link.rel = "stylesheet";
		link.href = href;
		document.head.appendChild(link);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			ensure_global_styles();
			schedule_localize();
		});
	} else {
		ensure_global_styles();
		schedule_localize();
	}

	if (window.frappe?.router?.on) {
		frappe.router.on("change", schedule_localize);
	}

	const observer = new MutationObserver(() => {
		window.clearTimeout(window.__user_growth_localize_timer);
		window.__user_growth_localize_timer = window.setTimeout(localize_user_growth_shell, 120);
	});
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["placeholder", "title", "aria-label", "data-original-title"],
	});
})();
