"""
Chatbot endpoints
"""

from fastapi import APIRouter

router = APIRouter()


from fastapi import HTTPException
from pydantic import BaseModel
from typing import Optional


# Expanded FAQ mapping for more scenarios
FAQS = [
	# Application process
	(['how do i apply', 'apply for relief', 'application process', 'start application', 'begin application', 'register for scheme'],
	 "To apply for relief, click on 'Apply Now' on the home page and follow the onboarding steps. Complete onboarding and submit your application with required documents."),

	# Eligibility
	(['eligibility', 'who can apply', 'eligible', 'criteria', 'can i apply', 'am i eligible'],
	 "Eligibility depends on the scheme. Generally, individuals affected under the PCR Act or PoA Act can apply. Please refer to the eligibility section on the portal for details."),

	# Required documents
	(['documents required', 'what documents', 'document list', 'upload documents', 'docs needed', 'which documents'],
	 "You will need identity proof, caste certificate, FIR copy (if applicable), and bank details. The portal will guide you on uploading these during onboarding."),

	# Application status
	(['status', 'track application', 'application status', 'check status', 'progress', 'update on application', 'track'],
	 "You can check your application status in the dashboard after logging in. Status updates will also be sent via SMS/email."),

	# Deadlines
	(['deadline', 'last date', 'submission date', 'apply by', 'due date', 'closing date'],
	 "Deadlines vary by scheme. Please check the notifications section or the home page banner for current deadlines."),

	# Grievance/complaint
	(['grievance', 'complaint', 'raise issue', 'report problem', 'file complaint', 'register grievance'],
	 "To raise a grievance, go to the 'Grievance' section after logging in and fill out the form. You can track your grievance status in your dashboard."),

	# Escalation
	(['escalate', 'not resolved', 'no response', 'pending too long', 'waiting too long', 'escalation'],
	 "If your issue is not resolved within the expected time, you can escalate it from your dashboard or contact support at info@nyayasetu.gov.in."),

	# DBT meaning
	(['what is dbt', 'dbt meaning', 'dbt full form', 'dbt definition'],
	 "DBT stands for Direct Benefit Transfer, a system to transfer subsidies directly to beneficiaries."),

	# Contact
	(['contact', 'support', 'helpdesk', 'phone number', 'email', 'customer care', 'call'],
	 "You can contact us at info@nyayasetu.gov.in or call +91-11-2338-1234. Our helpdesk is available 24x7."),

	# Help
	(['help', 'how to use', 'guide', 'faq', 'instructions', 'assistance'],
	 "Visit the Help section or use this chatbot to ask your questions! You can also find FAQs and guides on the portal."),

	# Bank details
	(['bank details', 'bank account', 'ifsc', 'bank info', 'add bank', 'change bank'],
	 "You will be asked to provide your bank account details during onboarding. Make sure your account is active and in your name. For changes, visit your profile section."),

	# SMS/Email issues
	(['not receiving sms', 'not receiving email', 'no sms', 'no email', 'otp not received', 'verification code'],
	 "If you are not receiving SMS or email, please check your spam folder and ensure your phone number/email is correct. You can request a new OTP or contact support if the issue persists."),

	# Portal errors
	(['error', 'site not working', 'portal down', 'bug', 'problem with site'],
	 "If you are experiencing errors on the portal, please try refreshing the page or clearing your browser cache. If the problem continues, contact support with details of the error."),

	# Language support
	(['language', 'hindi', 'marathi', 'bengali', 'tamil', 'telugu', 'change language'],
	 "The portal supports multiple languages. Use the language selector at the top right to switch your preferred language."),

	# Privacy
	(['privacy', 'data security', 'is my data safe', 'confidentiality'],
	 "Your data is protected and used only for processing your application as per government guidelines. Please see our Privacy Policy for more details."),

	# Refund
	(['refund', 'money back', 'return payment'],
	 "Refunds are processed as per scheme rules. If you are eligible for a refund, it will be credited to your registered bank account. Contact support for specific queries."),

	# Registration/Login/OTP
	(['register', 'registration', 'sign up', 'login', 'log in', 'sign in', 'otp', 'forgot password', 'reset password'],
	 "For registration, click 'Apply Now' and follow the steps. For login issues or OTP problems, use the 'Forgot Password' link or contact support for help."),

	# Application correction
	(['edit application', 'correct application', 'change details', 'update application'],
	 "You can edit your application before final submission. After submission, contact support for any corrections.")
]

class ChatbotMessageRequest(BaseModel):
	message: str
	session_id: Optional[str] = None

class ChatbotMessageResponse(BaseModel):
	reply: str

@router.post("/message", response_model=ChatbotMessageResponse)
def chatbot_message(req: ChatbotMessageRequest):
	user_msg = req.message.strip().lower()
	# Expanded keyword/phrase matching (case-insensitive, partial match)
	for keywords, answer in FAQS:
		for key in keywords:
			if key in user_msg:
				return {"reply": answer}

	# Escalation for repeated unknown queries (could be improved with session tracking)
	fallback = (
		"I'm sorry, I couldn't find an answer to your question. "
		"Please try rephrasing, visit the Help section, or contact our support at info@nyayasetu.gov.in or +91-11-2338-1234. "
		"If you have a specific issue, you can also raise a grievance from your dashboard."
	)
	return {"reply": fallback}

