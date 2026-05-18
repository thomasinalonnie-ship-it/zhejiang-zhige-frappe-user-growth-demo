from __future__ import annotations

import random
from datetime import date

import frappe
from frappe.utils import add_days, add_months, flt, getdate, nowdate


DOCTYPE = "User Service Lifecycle"

STATUS_LABELS = {
	"Trial": "试用",
	"Active": "活跃",
	"Churned": "流失",
}
CHANNEL_LABELS = {
	"Organic": "自然增长",
	"Ads": "广告投放",
	"Referral": "转介绍",
	"Partner": "渠道伙伴",
	"Outbound": "主动拓展",
}
PLAN_LABELS = {
	"Basic": "基础版",
	"Pro": "专业版",
	"Enterprise": "企业版",
}
REGION_LABELS = {
	"Hangzhou": "杭州",
	"Shanghai": "上海",
	"Beijing": "北京",
	"Shenzhen": "深圳",
	"Chengdu": "成都",
	"Wuhan": "武汉",
}
CHURN_REASON_LABELS = {
	"Price": "价格因素",
	"Product Fit": "产品匹配",
	"Service": "服务体验",
	"Competitor": "竞品替换",
	"Budget Cut": "预算缩减",
	"Unknown": "未知原因",
}


def _canonical_value(value, labels):
	if not value:
		return value
	reverse = {display: code for code, display in labels.items()}
	return reverse.get(value, value)


def _display_value(value, labels):
	if not value:
		return value
	return labels.get(value, value)


def _month_key(value):
	if not value:
		return None
	return getdate(value).strftime("%Y-%m")


def _date_in_range(value, from_date=None, to_date=None):
	if not value:
		return False
	value = getdate(value)
	if from_date and value < getdate(from_date):
		return False
	if to_date and value > getdate(to_date):
		return False
	return True


@frappe.whitelist()
def seed_mock_data(records=90):
	"""Reset and create mock lifecycle records for the demo app."""
	records = int(records or 90)
	random.seed(20260518)
	for name in frappe.get_all(DOCTYPE, filters={"user_code": ["like", "UG-%"]}, pluck="name"):
		frappe.delete_doc(DOCTYPE, name, ignore_permissions=True, force=True)

	regions = list(REGION_LABELS.values())
	industries = ["企业服务", "电商零售", "教育培训", "医疗健康", "智能制造", "金融服务"]
	channels = list(CHANNEL_LABELS.values())
	plans = [
		("基础版", 199),
		("专业版", 599),
		("企业版", 1999),
	]
	churn_reasons = list(CHURN_REASON_LABELS.values())[:-1]
	owners = ["陈晨", "李明", "周宁", "王磊"]
	today = getdate(nowdate())
	start = add_months(today, -6)
	inserted = 0

	for index in range(1, records + 1):
		plan, base_mrr = random.choice(plans)
		signup_date = add_days(start, random.randint(0, 175))
		status = random.choices(["活跃", "流失", "试用"], weights=[68, 22, 10], k=1)[0]
		churn_date = None
		churn_reason = None
		if _canonical_value(status, STATUS_LABELS) == "Churned":
			max_lifecycle_days = max((today - signup_date).days, 1)
			churn_date = add_days(signup_date, random.randint(1, min(130, max_lifecycle_days)))
			churn_reason = random.choice(churn_reasons)

		doc = frappe.get_doc(
			{
				"doctype": DOCTYPE,
				"user_code": f"UG-{index:04d}",
				"user_name": f"演示客户 {index:03d}",
				"signup_date": signup_date,
				"churn_date": churn_date,
				"status": status,
				"channel": random.choice(channels),
				"plan": plan,
				"mrr": base_mrr + random.choice([0, 50, 100, 200]),
				"region": random.choice(regions),
				"industry": random.choice(industries),
				"churn_reason": churn_reason,
				"owner_sales": random.choice(owners),
			}
		)
		doc.insert(ignore_permissions=True)
		inserted += 1

	frappe.db.commit()
	return {"inserted": inserted, "message": f"已重建 {inserted} 条演示数据。"}


def get_growth_summary(from_date=None, to_date=None, channel=None, plan=None):
	rows = frappe.db.sql(
		"""
		SELECT name, user_name, signup_date, churn_date, status, channel, plan,
		       region, industry, churn_reason, mrr
		FROM `tabUser Service Lifecycle`
		ORDER BY signup_date ASC
		""",
		as_dict=True,
	)
	channel_filter = _canonical_value(channel, CHANNEL_LABELS)
	plan_filter = _canonical_value(plan, PLAN_LABELS)

	if channel_filter:
		rows = [row for row in rows if _canonical_value(row.channel, CHANNEL_LABELS) == channel_filter]
	if plan_filter:
		rows = [row for row in rows if _canonical_value(row.plan, PLAN_LABELS) == plan_filter]

	total_users = len(rows)
	active_users = sum(1 for row in rows if _canonical_value(row.status, STATUS_LABELS) == "Active")
	new_users = sum(1 for row in rows if _date_in_range(row.signup_date, from_date, to_date))
	churned_users = sum(1 for row in rows if _date_in_range(row.churn_date, from_date, to_date))
	net_growth = new_users - churned_users
	active_mrr = sum(flt(row.mrr) for row in rows if _canonical_value(row.status, STATUS_LABELS) == "Active")
	churn_rate = (churned_users / total_users * 100) if total_users else 0

	monthly = {}
	for row in rows:
		signup_month = _month_key(row.signup_date)
		if signup_month:
			monthly.setdefault(signup_month, {"month": signup_month, "new_users": 0, "churned_users": 0})
			if _date_in_range(row.signup_date, from_date, to_date):
				monthly[signup_month]["new_users"] += 1
		churn_month = _month_key(row.churn_date)
		if churn_month:
			monthly.setdefault(churn_month, {"month": churn_month, "new_users": 0, "churned_users": 0})
			if _date_in_range(row.churn_date, from_date, to_date):
				monthly[churn_month]["churned_users"] += 1

	for item in monthly.values():
		item["net_growth"] = item["new_users"] - item["churned_users"]

	def grouped_count(field, labels=None):
		result = {}
		for row in rows:
			key = row.get(field) or "Unknown"
			if labels:
				key = _display_value(key, labels)
			result[key] = result.get(key, 0) + 1
		return [{"label": key, "value": value} for key, value in sorted(result.items())]

	def grouped_sum(field, sum_field, labels=None):
		result = {}
		for row in rows:
			key = row.get(field) or "Unknown"
			if labels:
				key = _display_value(key, labels)
			result[key] = result.get(key, 0) + flt(row.get(sum_field))
		return [{"label": key, "value": value} for key, value in sorted(result.items())]

	recent_records = sorted(rows, key=lambda row: row.signup_date or date.min, reverse=True)[:10]

	return {
		"kpis": {
			"total_users": total_users,
			"active_users": active_users,
			"new_users": new_users,
			"churned_users": churned_users,
			"net_growth": net_growth,
			"active_mrr": active_mrr,
			"churn_rate": round(churn_rate, 2),
		},
		"trend": [monthly[key] for key in sorted(monthly)],
		"regions": grouped_count("region", REGION_LABELS),
		"channels": grouped_count("channel", CHANNEL_LABELS),
		"plan_mrr": grouped_sum("plan", "mrr", PLAN_LABELS),
		"churn_reasons": grouped_count("churn_reason", CHURN_REASON_LABELS),
		"recent_records": recent_records,
	}


@frappe.whitelist()
def get_growth_dashboard_data(from_date=None, to_date=None, channel=None, plan=None):
	return get_growth_summary(from_date=from_date, to_date=to_date, channel=channel, plan=plan)
