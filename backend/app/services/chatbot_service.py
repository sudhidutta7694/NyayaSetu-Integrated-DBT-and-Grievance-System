from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.services.gemini_service import gemini_service
from models.user import User


class ChatbotService:
    def __init__(self, db: Session):
        self.db = db
        self.gemini = gemini_service

    async def process_message(
        self,
        message: str,
        user_id: Optional[str] = None,
        chat_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en"
    ) -> Dict[str, any]:
        detected_language = self.gemini.detect_language(message)
        response_language = detected_language if detected_language != 'en' else language
        
        print(f"Page language: {language}, Detected language: {detected_language}, Using: {response_language}")
        
        classification = self.gemini.classify_query(message)
        query_type = classification.get("type", "general")
        
        response_data = {
            "reply": "",
            "query_type": query_type,
            "classification_confidence": classification.get("confidence", 0.0),
            "sql_executed": None,
            "error": None,
            "detected_language": detected_language,
            "response_language": response_language
        }

        try:
            if query_type == "user_specific" and user_id:
                response_data["reply"] = await self._handle_user_specific_query(
                    message, user_id, chat_history, response_language
                )
            elif query_type == "user_specific" and not user_id:
                response_data["reply"] = self._get_login_required_message(response_language)
            else:
                response_data["reply"] = self.gemini.get_response(message, chat_history, response_language)
                
        except Exception as e:
            print(f"Chatbot error: {e}")
            response_data["error"] = str(e)
            response_data["reply"] = self._get_error_message(response_language)

        return response_data
    
    def _get_login_required_message(self, language: str) -> str:
        messages = {
            "en": "I'd love to help you with your specific applications and documents! 😊\n\nTo provide personalized information about your account, please **log in** first. Once you're logged in, I can help you with:\n\n• Your application status\n• Document verification details\n• Account information\n• And much more!\n\nIf you have general questions about schemes, eligibility, or procedures, feel free to ask - I'm here to help!",
            "hi": "मैं आपके विशिष्ट आवेदनों और दस्तावेज़ों में आपकी मदद करना चाहूंगा! 😊\n\nआपके खाते के बारे में व्यक्तिगत जानकारी प्रदान करने के लिए, कृपया पहले **लॉगिन करें**। एक बार जब आप लॉगिन हो जाते हैं, तो मैं आपकी मदद कर सकता हूं:\n\n• आपके आवेदन की स्थिति\n• दस्तावेज़ सत्यापन विवरण\n• खाता जानकारी\n• और भी बहुत कुछ!\n\nयदि आपके पास योजनाओं, पात्रता या प्रक्रियाओं के बारे में सामान्य प्रश्न हैं, तो बेझिझक पूछें - मैं मदद करने के लिए यहाँ हूँ!",
            "bn": "আমি আপনার নির্দিষ্ট আবেদন এবং নথিতে সাহায্য করতে চাই! 😊\n\nআপনার অ্যাকাউন্ট সম্পর্কে ব্যক্তিগত তথ্য প্রদান করতে, অনুগ্রহ করে প্রথমে **লগইন করুন**। একবার লগইন করলে, আমি আপনাকে সাহায্য করতে পারি:\n\n• আপনার আবেদনের স্ট্যাটাস\n• নথি যাচাইকরণ বিবরণ\n• অ্যাকাউন্ট তথ্য\n• এবং আরও অনেক কিছু!\n\nযদি আপনার প্রকল্প, যোগ্যতা বা পদ্ধতি সম্পর্কে সাধারণ প্রশ্ন থাকে, নির্দ্বিধায় জিজ্ঞাসা করুন - আমি সাহায্য করতে এখানে আছি!",
            "te": "మీ నిర్దిష్ట దరఖాస్తులు మరియు పత్రాలతో సహాయం చేయడానికి నేను ఇష్టపడతాను! 😊\n\nమీ ఖాతా గురించి వ్యక్తిగత సమాచారం అందించడానికి, దయచేసి మొదట **లాగిన్ అవ్వండి**. మీరు లాగిన్ అయిన తర్వాత, నేను మీకు సహాయం చేయగలను:\n\n• మీ దరఖాస్తు స్థితి\n• పత్రం ధృవీకరణ వివరాలు\n• ఖాతా సమాచారం\n• మరియు మరెన్నో!\n\nమీకు పథకాలు, అర్హత లేదా విధానాల గురించి సాధారణ ప్రశ్నలు ఉంటే, అడగడానికి సంకోచించకండి - నేను సహాయం చేయడానికి ఇక్కడ ఉన్నాను!",
            "ta": "உங்கள் குறிப்பிட்ட விண்ணப்பங்கள் மற்றும் ஆவணங்களில் உதவ நான் விரும்புகிறேன்! 😊\n\nஉங்கள் கணக்கு பற்றிய தனிப்பட்ட தகவலை வழங்க, முதலில் **உள்நுழையவும்**. நீங்கள் உள்நுழைந்தவுடன், நான் உங்களுக்கு உதவ முடியும்:\n\n• உங்கள் விண்ணப்ப நிலை\n• ஆவண சரிபார்ப்பு விவரங்கள்\n• கணக்கு தகவல்\n• மேலும் பல!\n\nதிட்டங்கள், தகுதி அல்லது நடைமுறைகள் பற்றிய பொதுவான கேள்விகள் இருந்தால், கேட்க தயங்க வேண்டாம் - நான் உதவ இங்கே இருக்கிறேன்!",
            "mr": "तुमच्या विशिष्ट अर्ज आणि कागदपत्रांमध्ये मदत करण्यास मला आवडेल! 😊\n\nतुमच्या खात्याबद्दल वैयक्तिक माहिती देण्यासाठी, कृपया प्रथम **लॉगिन करा**. एकदा तुम्ही लॉगिन केल्यावर, मी तुम्हाला मदत करू शकतो:\n\n• तुमच्या अर्जाची स्थिती\n• कागदपत्र पडताळणी तपशील\n• खाते माहिती\n• आणि बरेच काही!\n\nजर तुम्हाला योजना, पात्रता किंवा प्रक्रियांबद्दल सामान्य प्रश्न असतील, तर विचारण्यास मोकळ्या मनाने - मी मदत करण्यासाठी येथे आहे!"
        }
        return messages.get(language, messages["en"])
    
    def _get_error_message(self, language: str) -> str:
        messages = {
            "en": "Oops! I encountered a small hiccup while processing your request. 🤔\n\nPlease try:\n• Rephrasing your question\n• Asking something else\n\nIf the problem continues, our support team at **info@nyayasetu.gov.in** is ready to help you!",
            "hi": "उफ़! आपके अनुरोध को संसाधित करते समय मुझे एक छोटी सी समस्या का सामना करना पड़ा। 🤔\n\nकृपया प्रयास करें:\n• अपने प्रश्न को दोबारा लिखना\n• कुछ और पूछना\n\nयदि समस्या जारी रहती है, तो **info@nyayasetu.gov.in** पर हमारी सहायता टीम आपकी मदद के लिए तैयार है!",
            "bn": "ওহো! আপনার অনুরোধ প্রক্রিয়া করার সময় আমি একটি ছোট সমস্যার সম্মুখীন হয়েছি। 🤔\n\nঅনুগ্রহ করে চেষ্টা করুন:\n• আপনার প্রশ্নটি পুনরায় লেখা\n• অন্য কিছু জিজ্ঞাসা করা\n\nসমস্যা অব্যাহত থাকলে, **info@nyayasetu.gov.in** এ আমাদের সহায়তা দল আপনাকে সাহায্য করতে প্রস্তুত!",
            "te": "అయ్యో! మీ అభ్యర్థనను ప్రాసెస్ చేస్తున్నప్పుడు నాకు ఒక చిన్న సమస్య ఎదురైంది। 🤔\n\nదయచేసి ప్రయత్నించండి:\n• మీ ప్రశ్నను మళ్లీ రాయండి\n• వేరే ఏదైనా అడగండి\n\nసమస్య కొనసాగితే, **info@nyayasetu.gov.in** వద్ద మా మద్దతు బృందం మీకు సహాయం చేయడానికి సిద్ధంగా ఉంది!",
            "ta": "அடடா! உங்கள் கோரிக்கையை செயலாக்கும்போது நான் ஒரு சிறிய சிக்கலை சந்தித்தேன். 🤔\n\nதயவுசெய்து முயற்சிக்கவும்:\n• உங்கள் கேள்வியை மீண்டும் எழுதுங்கள்\n• வேறு ஏதாவது கேளுங்கள்\n\nசிக்கல் தொடர்ந்தால், **info@nyayasetu.gov.in** இல் எங்கள் ஆதரவு குழு உங்களுக்கு உதவ தயாராக உள்ளது!",
            "mr": "अरेरे! तुमची विनंती प्रक्रिया करताना मला एक लहान अडचण आली। 🤔\n\nकृपया प्रयत्न करा:\n• तुमचा प्रश्न पुन्हा लिहा\n• काहीतरी वेगळे विचारा\n\nसमस्या सुरू राहिल्यास, **info@nyayasetu.gov.in** वरील आमची समर्थन टीम तुम्हाला मदत करण्यास तयार आहे!"
        }
        return messages.get(language, messages["en"])

    async def _handle_user_specific_query(
        self,
        message: str,
        user_id: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en"
    ) -> str:
        try:
            sql_query = self.gemini.generate_sql_query(message, user_id)
            result = self.db.execute(text(sql_query))
            rows = result.fetchall()
            
            columns = result.keys()
            sql_results = [dict(zip(columns, row)) for row in rows]
            
            print(f"SQL Results: {sql_results}")
            print(f"Number of results: {len(sql_results)}")
            
            response = self.gemini.format_sql_results(message, sql_results, sql_query, language)
            
            return response
            
        except Exception as e:
            print(f"User-specific query error: {e}")
            return self._get_data_access_error_message(language)
    
    def _get_data_access_error_message(self, language: str) -> str:
        messages = {
            "en": "I'm having trouble accessing your information right now. 😅\n\nThis could be temporary! Please:\n• **Refresh** and try again in a moment\n• Check if you're still **logged in**\n\nIf you keep seeing this, please reach out to our support team at **info@nyayasetu.gov.in** - we're here to help!",
            "hi": "मुझे अभी आपकी जानकारी तक पहुंचने में परेशानी हो रही है। 😅\n\nयह अस्थायी हो सकता है! कृपया:\n• **रिफ्रेश** करें और एक पल में फिर से प्रयास करें\n• जांचें कि क्या आप अभी भी **लॉग इन** हैं\n\nयदि आप इसे देखते रहते हैं, तो कृपया **info@nyayasetu.gov.in** पर हमारी सहायता टीम से संपर्क करें - हम मदद के लिए यहां हैं!",
            "bn": "আমি এখন আপনার তথ্য অ্যাক্সেস করতে সমস্যা হচ্ছে। 😅\n\nএটি সাময়িক হতে পারে! অনুগ্রহ করে:\n• **রিফ্রেশ** করুন এবং একটু পরে আবার চেষ্টা করুন\n• পরীক্ষা করুন আপনি এখনও **লগ ইন** আছেন কিনা\n\nআপনি যদি এটি দেখতে থাকেন, তাহলে **info@nyayasetu.gov.in** এ আমাদের সহায়তা দলের সাথে যোগাযোগ করুন - আমরা সাহায্য করতে এখানে আছি!",
            "te": "ప్రస్తుతం మీ సమాచారాన్ని యాక్సెస్ చేయడంలో నాకు సమస్య ఉంది। 😅\n\nఇది తాత్కాలికంగా ఉండవచ్చు! దయచేసి:\n• **రిఫ్రెష్** చేసి కొద్దిసేపటికి మళ్లీ ప్రయత్నించండి\n• మీరు ఇంకా **లాగిన్** అయి ఉన్నారో లేదో తనిఖీ చేయండి\n\nమీరు దీన్ని చూస్తూనే ఉంటే, దయచేసి **info@nyayasetu.gov.in** వద్ద మా మద్దతు బృందాన్ని సంప్రదించండి - మేము సహాయం చేయడానికి ఇక్కడ ఉన్నాము!",
            "ta": "இப்போது உங்கள் தகவல்களை அணுகுவதில் எனக்கு சிக்கல் உள்ளது। 😅\n\nஇது தற்காலிகமாக இருக்கலாம்! தயவுசெய்து:\n• **ரிஃப்ரெஷ்** செய்து சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்\n• நீங்கள் இன்னும் **உள்நுழைந்துள்ளீர்களா** என்பதை சரிபார்க்கவும்\n\nநீங்கள் இதைத் தொடர்ந்து பார்த்தால், **info@nyayasetu.gov.in** இல் எங்கள் ஆதரவு குழுவைத் தொடர்பு கொள்ளுங்கள் - நாங்கள் உதவ இங்கே இருக்கிறோம்!",
            "mr": "मला सध्या तुमची माहिती ॲक्सेस करण्यात अडचण येत आहे। 😅\n\nहे तात्पुरते असू शकते! कृपया:\n• **रिफ्रेश** करा आणि थोड्या वेळाने पुन्हा प्रयत्न करा\n• तपासा की तुम्ही अजूनही **लॉग इन** आहात का\n\nजर तुम्हाला हे दिसत राहिलं, तर कृपया **info@nyayasetu.gov.in** वरील आमच्या समर्थन टीमशी संपर्क साधा - आम्ही मदतीसाठी येथे आहोत!"
        }
        return messages.get(language, messages["en"])

    def get_user_context(self, user_id: str) -> Dict:
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                return {
                    "name": user.full_name,
                    "district": user.district,
                    "is_onboarded": user.is_onboarded,
                    "is_verified": user.is_verified
                }
        except Exception as e:
            print(f"Error fetching user context: {e}")
        
        return {}
    
    def _get_error_message(self, language: str) -> str:
        """Get error message in appropriate language"""
        messages = {
            "en": "Oops! I encountered a small hiccup while processing your request. 🤔\n\nPlease try:\n• Rephrasing your question\n• Asking something else\n\nIf the problem continues, our support team at **info@nyayasetu.gov.in** is ready to help you!",
            "hi": "उफ़! आपके अनुरोध को संसाधित करते समय मुझे एक छोटी सी समस्या का सामना करना पड़ा। 🤔\n\nकृपया प्रयास करें:\n• अपने प्रश्न को दोबारा लिखना\n• कुछ और पूछना\n\nयदि समस्या जारी रहती है, तो **info@nyayasetu.gov.in** पर हमारी सहायता टीम आपकी मदद के लिए तैयार है!",
            "bn": "ওহো! আপনার অনুরোধ প্রক্রিয়া করার সময় আমি একটি ছোট সমস্যার সম্মুখীন হয়েছি। 🤔\n\nঅনুগ্রহ করে চেষ্টা করুন:\n• আপনার প্রশ্নটি পুনরায় লেখা\n• অন্য কিছু জিজ্ঞাসা করা\n\nসমস্যা অব্যাহত থাকলে, **info@nyayasetu.gov.in** এ আমাদের সহায়তা দল আপনাকে সাহায্য করতে প্রস্তুত!",
            "te": "అయ్యో! మీ అభ్యర్థనను ప్రాసెస్ చేస్తున్నప్పుడు నాకు ఒక చిన్న సమస్య ఎదురైంది। 🤔\n\nదయచేసి ప్రయత్నించండి:\n• మీ ప్రశ్నను మళ్లీ రాయండి\n• వేరే ఏదైనా అడగండి\n\nసమస్య కొనసాగితే, **info@nyayasetu.gov.in** వద్ద మా మద్దతు బృందం మీకు సహాయం చేయడానికి సిద్ధంగా ఉంది!",
            "ta": "அடடா! உங்கள் கோரிக்கையை செயலாக்கும்போது நான் ஒரு சிறிய சிக்கலை சந்தித்தேன். 🤔\n\nதயவுசெய்து முயற்சிக்கவும்:\n• உங்கள் கேள்வியை மீண்டும் எழுதுங்கள்\n• வேறு ஏதாவது கேளுங்கள்\n\nசிக்கல் தொடர்ந்தால், **info@nyayasetu.gov.in** இல் எங்கள் ஆதரவு குழு உங்களுக்கு உதவ தயாராக உள்ளது!",
            "mr": "अरेरे! तुमची विनंती प्रक्रिया करताना मला एक लहान अडचण आली। 🤔\n\nकृपया प्रयत्न करा:\n• तुमचा प्रश्न पुन्हा लिहा\n• काहीतरी वेगळे विचारा\n\nसमस्या सुरू राहिल्यास, **info@nyayasetu.gov.in** वरील आमची समर्थन टीम तुम्हाला मदत करण्यास तयार आहे!"
        }
        return messages.get(language, messages["en"])

    async def _handle_user_specific_query(
        self,
        message: str,
        user_id: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en"
    ) -> str:
        """
        Handle queries that require database access
        """
        try:
            sql_query = self.gemini.generate_sql_query(message, user_id)
            result = self.db.execute(text(sql_query))
            rows = result.fetchall()
            
            # Convert to list of dicts
            columns = result.keys()
            sql_results = [dict(zip(columns, row)) for row in rows]
            
            # Debug: Print the results
            print(f"SQL Results: {sql_results}")
            print(f"Number of results: {len(sql_results)}")
            
            # Format results as natural language
            response = self.gemini.format_sql_results(message, sql_results, sql_query, language)
            
            return response
            
        except Exception as e:
            print(f"User-specific query error: {e}")
            # Fallback with translated message
            return self._get_data_access_error_message(language)
    
    def _get_data_access_error_message(self, language: str) -> str:
        """Get data access error message in appropriate language"""
        messages = {
            "en": "I'm having trouble accessing your information right now. 😅\n\nThis could be temporary! Please:\n• **Refresh** and try again in a moment\n• Check if you're still **logged in**\n\nIf you keep seeing this, please reach out to our support team at **info@nyayasetu.gov.in** - we're here to help!",
            "hi": "मुझे अभी आपकी जानकारी तक पहुंचने में परेशानी हो रही है। 😅\n\nयह अस्थायी हो सकता है! कृपया:\n• **रिफ्रेश** करें और एक पल में फिर से प्रयास करें\n• जांचें कि क्या आप अभी भी **लॉग इन** हैं\n\nयदि आप इसे देखते रहते हैं, तो कृपया **info@nyayasetu.gov.in** पर हमारी सहायता टीम से संपर्क करें - हम मदद के लिए यहां हैं!",
            "bn": "আমি এখন আপনার তথ্য অ্যাক্সেস করতে সমস্যা হচ্ছে। 😅\n\nএটি সাময়িক হতে পারে! অনুগ্রহ করে:\n• **রিফ্রেশ** করুন এবং একটু পরে আবার চেষ্টা করুন\n• পরীক্ষা করুন আপনি এখনও **লগ ইন** আছেন কিনা\n\nআপনি যদি এটি দেখতে থাকেন, তাহলে **info@nyayasetu.gov.in** এ আমাদের সহায়তা দলের সাথে যোগাযোগ করুন - আমরা সাহায্য করতে এখানে আছি!",
            "te": "ప్రస్తుతం మీ సమాచారాన్ని యాక్సెస్ చేయడంలో నాకు సమస్య ఉంది। 😅\n\nఇది తాత్కాలికంగా ఉండవచ్చు! దయచేసి:\n• **రిఫ్రెష్** చేసి కొద్దిసేపటికి మళ్లీ ప్రయత్నించండి\n• మీరు ఇంకా **లాగిన్** అయి ఉన్నారో లేదో తనిఖీ చేయండి\n\nమీరు దీన్ని చూస్తూనే ఉంటే, దయచేసి **info@nyayasetu.gov.in** వద్ద మా మద్దతు బృందాన్ని సంప్రదించండి - మేము సహాయం చేయడానికి ఇక్కడ ఉన్నాము!",
            "ta": "இப்போது உங்கள் தகவல்களை அணுகுவதில் எனக்கு சிக்கல் உள்ளது। 😅\n\nஇது தற்காலிகமாக இருக்கலாம்! தயவுசெய்து:\n• **ரிஃப்ரெஷ்** செய்து சிறிது நேரத்தில் மீண்டும் முயற்சிக்கவும்\n• நீங்கள் இன்னும் **உள்நுழைந்துள்ளீர்களா** என்பதை சரிபார்க்கவும்\n\nநீங்கள் இதைத் தொடர்ந்து பார்த்தால், **info@nyayasetu.gov.in** இல் எங்கள் ஆதரவு குழுவைத் தொடர்பு கொள்ளுங்கள் - நாங்கள் உதவ இங்கே இருக்கிறோம்!",
            "mr": "मला सध्या तुमची माहिती ॲक्सेस करण्यात अडचण येत आहे। 😅\n\nहे तात्पुरते असू शकते! कृपया:\n• **रिफ्रेश** करा आणि थोड्या वेळाने पुन्हा प्रयत्न करा\n• तपासा की तुम्ही अजूनही **लॉग इन** आहात का\n\nजर तुम्हाला हे दिसत राहिलं, तर कृपया **info@nyayasetu.gov.in** वरील आमच्या समर्थन टीमशी संपर्क साधा - आम्ही मदतीसाठी येथे आहोत!"
        }
        return messages.get(language, messages["en"])

    def get_user_context(self, user_id: str) -> Dict:
        """
        Get user context for better responses
        """
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                return {
                    "name": user.full_name,
                    "district": user.district,
                    "is_onboarded": user.is_onboarded,
                    "is_verified": user.is_verified
                }
        except Exception as e:
            print(f"Error fetching user context: {e}")
        
        return {}
