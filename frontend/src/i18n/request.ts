import {cookies} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';

// Function to deeply merge translation objects
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Function to load all messages for a locale from nested structure
async function loadMessages(locale: string) {
  // Supported locales with translations
  const supportedLocales = ['en', 'hi', 'bn'];  
  // If locale is not supported, fall back to English
  const effectiveLocale = supportedLocales.includes(locale) ? locale : 'en';
  const messages: any = {};

  try {
    // Load home messages
    const homeMessages = await import(`../../messages/home/${effectiveLocale}.json`);
    messages.home = homeMessages.default || homeMessages;
  } catch (error) {
    console.warn(`Could not load home messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load header messages
    const headerMessages = await import(`../../messages/header/${effectiveLocale}.json`);
    messages.header = headerMessages.default || headerMessages;
  } catch (error) {
    console.warn(`Could not load header messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load chatbot messages
    const chatbotMessages = await import(`../../messages/chatbot/${effectiveLocale}.json`);
    messages.chatbot = chatbotMessages.default || chatbotMessages;
  } catch (error) {
    console.warn(`Could not load chatbot messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load login messages
    const loginMessages = await import(`../../messages/login/${effectiveLocale}.json`);
    messages.login = loginMessages.default || loginMessages;
  } catch (error) {
    console.warn(`Could not load login messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load user-dashboard messages
    const userDashboardMessages = await import(`../../messages/user-dashboard/${effectiveLocale}.json`);
    messages.userDashboard = userDashboardMessages.default || userDashboardMessages;
  } catch (error) {
    console.warn(`Could not load user-dashboard messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load sidebar messages
    const sidebarMessages = await import(`../../messages/sidebar/${effectiveLocale}.json`);
    messages.sidebar = sidebarMessages.default || sidebarMessages;
  } catch (error) {
    console.warn(`Could not load sidebar messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load resources messages
    const resourcesMessages = await import(`../../messages/resources/${effectiveLocale}.json`);
    messages.resources = resourcesMessages.default || resourcesMessages;
  } catch (error) {
    console.warn(`Could not load resources messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load onboarding messages
    const onboardingMessages = await import(`../../messages/onboarding/${effectiveLocale}.json`);
    messages.onboarding = onboardingMessages.default || onboardingMessages;
  } catch (error) {
    console.warn(`Could not load onboarding messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load onboarding personal info messages
    const onboardingPersonalInfoMessages = await import(`../../messages/onboarding-personalInfo/${effectiveLocale}.json`);
    messages.onboardingPersonalInfo = onboardingPersonalInfoMessages.default || onboardingPersonalInfoMessages;
  } catch (error) {
    console.warn(`Could not load onboarding personal info messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load onboarding documents upload messages
    const onboardingDocumentsMessages = await import(`../../messages/onboarding-documentsUpload/${effectiveLocale}.json`);
    messages.onboardingDocuments = onboardingDocumentsMessages.default || onboardingDocumentsMessages;
  } catch (error) {
    console.warn(`Could not load onboarding documents messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load onboarding bank details messages
    const onboardingBankMessages = await import(`../../messages/onboarding-bankDetails/${effectiveLocale}.json`);
    messages.onboardingBank = onboardingBankMessages.default || onboardingBankMessages;
  } catch (error) {
    console.warn(`Could not load onboarding bank messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load user-applications messages
    const userApplicationsMessages = await import(`../../messages/user-applications/${effectiveLocale}.json`);
    messages.userApplications = userApplicationsMessages.default || userApplicationsMessages;
  } catch (error) {
    console.warn(`Could not load user-applications messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load user-new-application messages
    const userNewApplicationMessages = await import(`../../messages/user-new-application/${effectiveLocale}.json`);
    messages.userNewApplication = userNewApplicationMessages.default || userNewApplicationMessages;
  } catch (error) {
    console.warn(`Could not load user-new-application messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load user-documents messages
    const userDocumentsMessages = await import(`../../messages/user-documents/${effectiveLocale}.json`);
    messages.userDocuments = userDocumentsMessages.default || userDocumentsMessages;
  } catch (error) {
    console.warn(`Could not load user-documents messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load user-application-detail messages
    const userApplicationDetailMessages = await import(`../../messages/user-application-detail/${effectiveLocale}.json`);
    messages.userApplicationDetail = userApplicationDetailMessages.default || userApplicationDetailMessages;
  } catch (error) {
    console.warn(`Could not load user-application-detail messages for locale: ${effectiveLocale}`);
  }

  try {
    // Load user-profile messages
    const userProfileMessages = await import(`../../messages/user-profile/${effectiveLocale}.json`);
    messages.userProfile = userProfileMessages.default || userProfileMessages;
  } catch (error) {
    console.warn(`Could not load user-profile messages for locale: ${effectiveLocale}`);
  }

  return messages;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';

  const messages = await loadMessages(locale);

  return {
    locale,
    messages
  };
});
