from __future__ import annotations

import frappe

from user_growth_app.api import get_growth_summary


def execute(filters=None):
	filters = filters or {}
	columns = [
		{"label": "月份", "fieldname": "month", "fieldtype": "Data", "width": 100},
		{"label": "新增用户", "fieldname": "new_users", "fieldtype": "Int", "width": 110},
		{"label": "流失用户", "fieldname": "churned_users", "fieldtype": "Int", "width": 120},
		{"label": "净增长", "fieldname": "net_growth", "fieldtype": "Int", "width": 110},
	]

	summary = get_growth_summary(
		from_date=filters.get("from_date"),
		to_date=filters.get("to_date"),
		channel=filters.get("channel"),
		plan=filters.get("plan"),
	)
	data = summary["trend"]
	chart = {
		"data": {
			"labels": [row["month"] for row in data],
			"datasets": [
				{"name": "新增用户", "values": [row["new_users"] for row in data]},
				{"name": "流失用户", "values": [row["churned_users"] for row in data]},
				{"name": "净增长", "values": [row["net_growth"] for row in data]},
			],
		},
		"type": "line",
	}
	report_summary = [
		{"label": "活跃用户", "value": summary["kpis"]["active_users"], "indicator": "Green"},
		{"label": "新增用户", "value": summary["kpis"]["new_users"], "indicator": "Blue"},
		{"label": "流失用户", "value": summary["kpis"]["churned_users"], "indicator": "Red"},
		{"label": "活跃月经常收入", "value": frappe.format_value(summary["kpis"]["active_mrr"], {"fieldtype": "Currency"}), "indicator": "Green"},
		{"label": "流失率", "value": f'{summary["kpis"]["churn_rate"]}%', "indicator": "Orange"},
	]
	return columns, data, None, chart, report_summary
