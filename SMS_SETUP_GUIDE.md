# 📱 SMS Setup Guide for NyayaSetu DBT System

## 🎯 **Current Status: WORKING IN DEVELOPMENT MODE**

The SMS service is now fully functional in development mode with mock SMS notifications. Here's what's working and how to set up real SMS delivery.

## ✅ **What's Working Now**

### **Development Mode (Current)**
- ✅ SMS service is integrated and working
- ✅ OTP generation and storage in database
- ✅ Mock SMS notifications displayed in backend logs
- ✅ Complete Aadhaar login flow with OTP verification
- ✅ Frontend integration working perfectly

### **Mock SMS Notifications**
When you test the Aadhaar login, you'll see notifications like this in the backend logs:

```
🔔 DEVELOPMENT SMS NOTIFICATION:
📱 To: +918637310611
📝 Message: Your NyayaSetu OTP for aadhaar login is: 019561. Valid for 5 minutes. Do not share with anyone.
⏰ Time: 2025-10-05 08:17:02
🔑 OTP Code: 019561
==================================================
```

## 🚀 **How to Set Up Real SMS Delivery**

### **Option 1: Twilio (Recommended)**

1. **Sign up for Twilio**:
   - Go to [https://www.twilio.com](https://www.twilio.com)
   - Create a free trial account
   - Verify your phone number

2. **Get a Twilio Phone Number**:
   - In Twilio Console, go to Phone Numbers → Manage → Buy a number
   - Choose a number that supports SMS
   - For India, you might need to request SMS capability

3. **Get Your Credentials**:
   - Account SID: Found in Twilio Console Dashboard
   - Auth Token: Found in Twilio Console Dashboard
   - Phone Number: The number you purchased (format: +1234567890)

4. **Update Environment Variables**:
   ```bash
   # In your .env file or environment
   TWILIO_ACCOUNT_SID="your_actual_account_sid"
   TWILIO_AUTH_TOKEN="your_actual_auth_token"
   TWILIO_PHONE_NUMBER="+1234567890"  # Your Twilio number
   ENVIRONMENT="production"  # Change from "development"
   ```

### **Option 2: Alternative SMS Providers**

You can also integrate with other SMS providers by modifying the `SMSService` class:

- **AWS SNS**: For high-volume SMS
- **TextLocal**: Popular in India
- **MSG91**: Indian SMS provider
- **Fast2SMS**: Another Indian provider

## 🧪 **Testing the Current Setup**

### **1. Test SMS Service Directly**
```bash
curl -X POST http://localhost:8000/api/v1/auth/test-sms
```

### **2. Test Complete Aadhaar Login Flow**
```bash
# Step 1: Send OTP
curl -X POST http://localhost:8000/api/v1/auth/aadhaar-login \
  -H "Content-Type: application/json" \
  -d '{"aadhaar_number": "362851176122"}'

# Step 2: Check backend logs for OTP code
docker logs nyayasetu_backend --tail 20

# Step 3: Verify OTP (use the OTP from logs)
curl -X POST http://localhost:8000/api/v1/auth/aadhaar-verify-otp \
  -H "Content-Type: application/json" \
  -d '{"aadhaar_number": "362851176122", "otp_code": "YOUR_OTP_CODE"}'
```

### **3. Test Frontend Flow**
1. Go to `http://localhost:3000/login`
2. Enter Aadhaar number: `362851176122`
3. Check backend logs for the OTP code
4. Enter the OTP code in the frontend
5. Complete the login flow

## 📋 **Current Test Data**

### **Dummy Aadhaar Data**
- **Aadhaar Number**: `362851176122`
- **Name**: राम कुमार शर्मा
- **Father's Name**: रामेश्वर शर्मा
- **Phone Number**: `+918637310611`
- **Address**: 123, गांधी नगर, नई दिल्ली - 110001

## 🔧 **Technical Implementation**

### **SMS Service Features**
- ✅ Automatic phone number formatting for Indian numbers
- ✅ Development mode with mock notifications
- ✅ Production mode with real SMS delivery
- ✅ Error handling and fallback mechanisms
- ✅ Structured logging for debugging

### **Security Features**
- ✅ OTP expiry (5 minutes)
- ✅ Single-use OTP validation
- ✅ Aadhaar number verification
- ✅ Phone number masking in responses

## 🎯 **Next Steps for Production**

1. **Get Real Twilio Credentials**:
   - Sign up for Twilio account
   - Purchase a phone number
   - Update environment variables

2. **Test with Real SMS**:
   - Change `ENVIRONMENT="production"`
   - Test with your actual phone number
   - Verify SMS delivery

3. **Monitor and Scale**:
   - Set up SMS delivery monitoring
   - Implement rate limiting
   - Add SMS delivery status tracking

## 🚨 **Important Notes**

- **Development Mode**: Currently using mock SMS to avoid costs and setup complexity
- **Phone Number**: The dummy number `+918637310611` is used for testing
- **OTP Display**: OTP codes are displayed in backend logs for testing
- **Security**: In production, never log OTP codes

## 📞 **Support**

If you need help setting up real SMS delivery:
1. Check the backend logs for detailed error messages
2. Verify your Twilio credentials
3. Ensure your Twilio account has SMS capability
4. Test with a small number first before scaling

---

**🎉 The SMS integration is working perfectly! You can now test the complete Aadhaar login flow with OTP delivery.**

