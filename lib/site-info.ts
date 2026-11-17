export const CHURCH_NAME = "Primeira Igreja Batista em Lagoa Santa";
export const CHURCH_URL = "https://pibls.com";
export const CHURCH_GIVING_URL = `${CHURCH_URL}/contribua`;

export const CONTACT_EMAIL = "juventudesalt@pibls.com";
export const WHATSAPP_NUMBER = "553192919718";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const whatsappUrlWithText = (text: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
