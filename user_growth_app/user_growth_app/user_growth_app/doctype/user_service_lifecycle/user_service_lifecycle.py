import frappe
from frappe.model.document import Document


class UserServiceLifecycle(Document):
	def validate(self):
		if self.churn_date and self.signup_date and self.churn_date < self.signup_date:
			frappe.throw("流失日期不能早于开通日期。")

		if self.status in ("流失", "Churned") and not self.churn_date:
			frappe.throw("服务状态为流失时必须填写流失日期。")

		if self.status not in ("流失", "Churned"):
			self.churn_reason = None
