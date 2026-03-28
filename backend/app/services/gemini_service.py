import re
import json
import google.generativeai as genai
from typing import List, Dict
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
        self.system_prompt = """You are NyayaSetu AI Assistant, a helpful chatbot for India's Direct Benefit Transfer (DBT) system for relief and compensation schemes under PCR Act and PoA Act.

Your role is to help users understand:
- Their rights under PCR Act (Prevention of Atrocities against SCs/STs) and PoA Act
- Application process for relief and compensation
- Required documents (Aadhaar, caste certificate, FIR copy, bank details, etc.)
- Eligibility criteria for different schemes
- General information about DBT, grievance system, and government schemes
- Deadlines and application procedures
- How to track applications and raise grievances

Guidelines:
- Be concise, helpful, and empathetic
- Use simple language suitable for all citizens
- Provide accurate information about Indian government schemes
- Direct users to appropriate sections or support for specific issues
- Avoid making up information - if you don't know, say so
- Keep responses under 200 words unless more detail is needed
- Do not answer personal application-specific queries (those are handled separately)
- Use markdown formatting for better readability:
  * Use **bold** for important terms, document names, and key information
  * Use bullet points (•) for lists
  * Use numbered lists (1. 2. 3.) for sequential steps
  * Use clear section headings ending with colon (:)

Answer in a friendly, official tone suitable for a government portal."""

    def detect_language(self, text: str) -> str:
        detection_prompt = f"""Detect the language of this text and respond with ONLY the language code.

Text: "{text}"

Language codes:
- en: English
- hi: Hindi (हिंदी)
- bn: Bengali (বাংলা)
- te: Telugu (తెలుగు)
- ta: Tamil (தமிழ்)
- mr: Marathi (मराठी)

Respond with ONLY the 2-letter language code, nothing else."""

        try:
            response = self.model.generate_content(detection_prompt)
            detected_lang = response.text.strip().lower()
            
            valid_languages = ['en', 'hi', 'bn', 'te', 'ta', 'mr']
            if detected_lang in valid_languages:
                return detected_lang
            else:
                return 'en'
                
        except Exception as e:
            print(f"Language detection error: {e}")
            return 'en'

    def classify_query(self, message: str) -> Dict[str, any]:
        classification_prompt = f"""Analyze this user query and classify it as either:
1. "general" - Questions about rights, schemes, procedures, documents, eligibility, general information
2. "user_specific" - Questions about the user's own application status, documents, account details, personal data

Query: "{message}"

Respond with ONLY a JSON object in this exact format:
{{"type": "general" or "user_specific", "confidence": 0.0 to 1.0, "reasoning": "brief explanation"}}"""

        try:
            response = self.model.generate_content(classification_prompt)
            result = response.text.strip()
            
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()
            
            classification = json.loads(result)
            return classification
        except Exception as e:
            print(f"Classification error: {e}")
            return {"type": "general", "confidence": 0.5, "reasoning": "Classification failed, defaulting to general"}

    def get_response(self, message: str, chat_history: List[Dict[str, str]] = None, language: str = "en") -> str:
        language_names = {
            "en": "English",
            "hi": "Hindi",
            "bn": "Bengali",
            "te": "Telugu",
            "ta": "Tamil",
            "mr": "Marathi"
        }
        target_language = language_names.get(language, "English")
        
        try:
            conversation = ""
            if language != "en":
                conversation += f"CRITICAL INSTRUCTION: You MUST respond ONLY in {target_language} language. Do NOT use English.\n\n"
            
            conversation += f"{self.system_prompt}\n\n"
            
            if language != "en":
                conversation += f"REMINDER: Always respond in {target_language} language.\n\n"
            
            if chat_history:
                for msg in chat_history[-5:]:
                    role = "User" if msg["role"] == "user" else "Assistant"
                    conversation += f"{role}: {msg['content']}\n"
            
            conversation += f"User: {message}\nAssistant ({target_language}):"
            
            response = self.model.generate_content(conversation)
            response_text = response.text.strip()
            
            return response_text
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again or contact support at info@nyayasetu.gov.in for immediate assistance."

    def generate_sql_query(self, user_question: str, user_id: str) -> str:
        sql_prompt = f"""You are a SQL query generator for the NyayaSetu database. Generate a safe, read-only PostgreSQL query based on the user's question.

Database Schema:

1. users table:
   - id (String, PK), full_name, email, phone_number, aadhaar_number (unique)
   - father_name, mother_name, date_of_birth, age, gender (ENUM: MALE/FEMALE/OTHER/PREFER_NOT_TO_SAY)
   - category (ENUM: SC/ST/OBC/GENERAL/OTHER)
   - address, district, state, pincode
   - role (ENUM: PUBLIC/DISTRICT_AUTHORITY/SOCIAL_WELFARE/FINANCIAL_INSTITUTION/ADMIN)
   - is_active, is_verified, is_onboarded, onboarding_step
   - profile_image, created_at, updated_at, last_login

2. applications table:
   - id (String, PK), application_number (unique), user_id (FK to users.id)
   - title, description, application_type (ENUM), status (ENUM)
   - incident_date, incident_description, incident_district, police_station
   - amount_approved, amount_disbursed
   - bank_account_number, bank_ifsc_code, bank_name, bank_branch, account_holder_name
   - fir_number, district_comments, cctns_verified, cctns_verification_date
   - district_reviewed_by, district_reviewed_at
   - social_welfare_comments, social_welfare_reviewed_by, social_welfare_reviewed_at
   - submitted_at, reviewed_at, approved_at, disbursed_at, rejection_reason
   - created_at, updated_at

3. documents table:
   - id (String, PK), user_id (FK to users.id), application_id (FK to applications.id, nullable)
   - document_type (ENUM), document_name, file_path, file_size, mime_type
   - status (ENUM), is_digilocker, digilocker_uri
   - verification_notes, verified_by, verified_at
   - created_at, updated_at
   - UNIQUE CONSTRAINT: (user_id, document_type) - Each user can have only ONE of each document type

4. bank_accounts table:
   - id (String, PK), user_id (FK to users.id)
   - account_number, ifsc_code, bank_name, branch_name, account_holder_name
   - is_verified, verified_at, created_at, updated_at

5. onboarding_steps table:
   - id (String, PK), user_id (FK to users.id)
   - step_number, step_name, is_completed, data (JSON string)
   - completed_at, created_at, updated_at

6. application_status_logs table:
   - id (String, PK), application_id (FK to applications.id)
   - stage (ENUM: DISTRICT_AUTHORITY/SOCIAL_WELFARE/FINANCIAL_INSTITUTION/COMPLETED)
   - status (ENUM: PENDING/APPROVED/REJECTED)
   - comments, rejection_reason, reviewed_by, reviewer_role
   - stage_entered_at, stage_completed_at, created_at, updated_at

7. roles table:
   - id (String, PK), name (unique), description, permissions (ARRAY), is_active
   - created_at, updated_at

8. user_role_assignments table:
   - id (String, PK), user_id (FK to users.id), role_id (FK to roles.id)
   - assigned_by, assigned_at, expires_at, is_active

ENUMS:
- ApplicationStatus: DRAFT, SUBMITTED, UNDER_REVIEW, DOCUMENT_VERIFICATION_PENDING, APPROVED, DOCUMENTS_APPROVED, DISTRICT_AUTHORITY_REJECTED, DOCUMENTS_REJECTED, SOCIAL_WELFARE_APPROVED, SOCIAL_WELFARE_REJECTED, FI_REJECTED, REJECTED, FUND_DISBURSED, COMPLETED
- ApplicationType: PCR_RELIEF, POA_COMPENSATION, INTER_CASTE_MARRIAGE, OTHER
- DocumentStatus: PENDING, VERIFIED, REJECTED, EXPIRED
- DocumentType: AADHAAR_CARD, PAN_CARD, BIRTH_CERTIFICATE, BANK_PASSBOOK, CATEGORY_CERTIFICATE, INCOME_CERTIFICATE, MARRIAGE_CERTIFICATE
- Gender: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
- Category: SC, ST, OBC, GENERAL, OTHER
- UserRole: PUBLIC, DISTRICT_AUTHORITY, SOCIAL_WELFARE, FINANCIAL_INSTITUTION, ADMIN

APPLICATION WORKFLOW (Sequential Stages):
1. DRAFT → User creating application
2. SUBMITTED → Application submitted, waiting for review
3. UNDER_REVIEW → Being reviewed by district authority
4. DOCUMENT_VERIFICATION_PENDING → Documents need to be verified
5. DOCUMENTS_APPROVED → District authority approved documents
6. SOCIAL_WELFARE_APPROVED → Social welfare officer approved
7. FUND_DISBURSED → Funds have been disbursed
8. COMPLETED → Application fully completed

Rejection statuses (terminal states):
- DISTRICT_AUTHORITY_REJECTED → Rejected by district authority
- SOCIAL_WELFARE_REJECTED → Rejected by social welfare
- FI_REJECTED → Rejected by financial institution

When asked about "pending stages":
- If status is DOCUMENTS_APPROVED, pending stages are: SOCIAL_WELFARE_APPROVED, FUND_DISBURSED, COMPLETED
- If status is SUBMITTED, pending stages are: UNDER_REVIEW, DOCUMENT_VERIFICATION_PENDING, DOCUMENTS_APPROVED, SOCIAL_WELFARE_APPROVED, FUND_DISBURSED, COMPLETED
- Use the workflow order above to determine what stages come AFTER the current status

IMPORTANT NOTES:
- The documents table does NOT have an 'uploaded_at' column. Use 'created_at' for when a document was uploaded.
- Document 'status' field indicates verification status (PENDING/VERIFIED/REJECTED/EXPIRED), NOT upload status.
- To check if a document is uploaded: Check if a document record EXISTS for that user and document_type.
- To check if a document is verified: Check if status = 'VERIFIED'.
- CRITICAL: When comparing ENUM values, cast to text: column_name::text = 'VALUE'
- Bank details can be in either applications table OR bank_accounts table. Check both.
- Users can have multiple bank accounts in bank_accounts table but only one of each document type.

Current user_id: {user_id}

User question: "{user_question}"

CRITICAL RULES:
1. ONLY generate SELECT queries (no INSERT, UPDATE, DELETE, DROP)
2. ALWAYS include WHERE user_id = '{user_id}' to restrict to current user's data
3. Use proper table joins if needed
4. Return valid PostgreSQL syntax
5. Use appropriate LIMIT if listing multiple records
6. Cast ENUM columns to text when comparing: status::text = 'VALUE'

Respond with ONLY the SQL query, nothing else."""

        try:
            response = self.model.generate_content(sql_prompt)
            sql_query = response.text.strip()

            print(f"Raw SQL generated: {sql_query}")
            if "```sql" in sql_query:
                sql_query = sql_query.split("```sql")[1].split("```")[0].strip()
            elif "```" in sql_query:
                sql_query = sql_query.split("```")[1].split("```")[0].strip()

            sql_query = re.sub(r'--[^\n]*', '', sql_query)
            
            sql_query = re.sub(r"=\s*d\.document_type\b(?!\:\:)", "= d.document_type::text", sql_query)
            sql_query = re.sub(r"\bd\.document_type\s*=\s*'", "d.document_type::text = '", sql_query)
            sql_query = re.sub(r"=\s*d\.status\b(?!\:\:)", "= d.status::text", sql_query)
            sql_query = re.sub(r"=\s*a\.status\b(?!\:\:)", "= a.status::text", sql_query)
            sql_query = re.sub(r"\ba\.status\s*=\s*'", "a.status::text = '", sql_query)
            
            sql_query = ' '.join(sql_query.split())
            print(f"Cleaned SQL: {sql_query}")
            
            sql_lower = sql_query.lower().strip()
            
            if not (sql_lower.startswith("select") or sql_lower.startswith("with")):
                print(f"Query validation failed - doesn't start with SELECT or WITH: {sql_lower[:50]}")
                raise ValueError("Only SELECT queries (including CTEs with WITH) are allowed")

            dangerous_keywords = ['insert', 'update', 'delete', 'drop', 'alter', 'create', 'truncate', 'grant', 'revoke']
            for keyword in dangerous_keywords:
                pattern = r'\b' + keyword + r'\b'
                if re.search(pattern, sql_lower):
                    print(f"Query validation failed - contains dangerous keyword: {keyword}")
                    raise ValueError(f"Query contains forbidden keyword: {keyword}")
            
            if user_id not in sql_query:
                print(f"Query validation failed - user_id not found in query")
                raise ValueError("Query must filter by user_id")
            
            print(f"SQL validation passed")
            return sql_query
            
        except Exception as e:
            print(f"SQL generation error: {e}")
            raise ValueError(f"Could not generate valid SQL query: {str(e)}")

    def format_sql_results(self, question: str, sql_results: List[Dict], query: str, language: str = "en") -> str:
        language_names = {
            "en": "English",
            "hi": "Hindi",
            "bn": "Bengali",
            "te": "Telugu",
            "ta": "Tamil",
            "mr": "Marathi"
        }
        target_language = language_names.get(language, "English")
        
        language_instruction = f"CRITICAL: You MUST respond ONLY in {target_language} language. Do not use English if the target language is not English.\n\n" if language != "en" else ""
        
        format_prompt = f"""{language_instruction}Convert the following database query results into a natural, conversational response for the user.

User's question: "{question}"

SQL Query executed: {query}

Results: {sql_results}

Generate a helpful, concise response (under 150 words) that:
1. Directly answers the user's question
2. Presents the data in a clear, readable format
3. Is friendly and helpful in tone

FORMATTING RULES (Keep it simple!):
- Use **text** for important values (e.g., **Approved**, **NS123456**)
- For lists, use this exact format:
  • Item one
  • Item two
  • Item three
- Put section headings on their own line ending with colon
- Do NOT nest bullets or create complex structures
- Do NOT mix different bullet types (•, *, -)
- Keep it clean and readable

Example good format:
Your application status:
• Application Number: **NS123456**
• Status: **Approved**
• Amount: **₹50,000**

If results are empty, politely inform the user that no data was found.

LANGUAGE: {target_language}"""

        try:
            response = self.model.generate_content(format_prompt)
            response_text = response.text.strip()
            
            response_text = re.sub(r'([•\*\-])\s*\n+\s*([^\n•\*\-])', r'\1 \2', response_text)
            response_text = re.sub(r'^[\*\-]\s+', '• ', response_text, flags=re.MULTILINE)
            response_text = re.sub(r'\n{3,}', '\n\n', response_text)
            
            return response_text
        except Exception as e:
            print(f"Result formatting error: {e}")
            if not sql_results:
                return "I couldn't find any information matching your query in the database."
            return f"Here's what I found: {sql_results}"


gemini_service = GeminiService()
