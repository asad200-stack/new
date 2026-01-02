export type PublicLocale = "en" | "ar";

const dict = {
  en: {
    products: "Products",
    search: "Search",
    messageUs: "Message us",
    name: "Name",
    email: "Email",
    phone: "Phone (optional)",
    message: "Message",
    send: "Send",
    sent: "Message sent. We'll contact you soon.",
    price: "Price",
    sale: "SALE",
    back: "Back",
    share: "Share",
    whatsapp: "WhatsApp",
    messenger: "Messenger",
    copyLink: "Copy link",
  },
  ar: {
    products: "المنتجات",
    search: "بحث",
    messageUs: "راسلنا",
    name: "الاسم",
    email: "البريد",
    phone: "الهاتف (اختياري)",
    message: "الرسالة",
    send: "إرسال",
    sent: "تم إرسال الرسالة. سنقوم بالتواصل قريباً.",
    price: "السعر",
    sale: "خصم",
    back: "رجوع",
    share: "مشاركة",
    whatsapp: "واتساب",
    messenger: "ماسنجر",
    copyLink: "نسخ الرابط",
  },
} as const;

export function t(locale: PublicLocale) {
  return dict[locale];
}


