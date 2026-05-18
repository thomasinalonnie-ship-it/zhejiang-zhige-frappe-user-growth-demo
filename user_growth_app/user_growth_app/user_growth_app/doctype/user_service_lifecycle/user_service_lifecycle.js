frappe.ui.form.on("User Service Lifecycle", {
	refresh(frm) {
		frm.set_intro(
			"这是一条用户服务生命周期记录，用于支撑增长、留存、流失和收入分析。",
			"blue"
		);
	},

	status(frm) {
		if (!["流失", "Churned"].includes(frm.doc.status)) {
			frm.set_value("churn_reason", null);
			frm.set_value("churn_date", null);
		}
	},
});
