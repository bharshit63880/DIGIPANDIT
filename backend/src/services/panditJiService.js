const buildSuggestions = (intents = []) => {
  const suggestionMap = {
    astrology: ["Show astrology chat", "Book astrology call", "Best astrologer in my city"],
    puja: ["Book a griha pravesh puja", "Find pandit near me", "Puja booking steps"],
    booking: ["How do I book a service?", "How do I cancel a booking?", "How do I pay?"],
    store: ["Open puja store", "Show puja kits", "How to place an order?"],
    auth: ["How do I sign up?", "How do I login?", "Forgot password help"],
    pandit: ["How to become a pandit?", "Pandit approval process", "How to add services?"],
  };

  const flattened = intents.flatMap((intent) => suggestionMap[intent] || []);
  return flattened.length ? flattened.slice(0, 3) : ["Book puja", "Astrology consultation", "Open store"];
};

const getPanditJiResponse = ({ message }) => {
  const normalized = (message || "").toLowerCase().trim();
  const intents = [];
  let reply =
    "Namaste. Main PanditJi hoon. Main aapko puja booking, astrology consultation, store orders, payments, aur account help me guide kar sakta hoon.";

  if (!normalized) {
    return {
      reply,
      suggestions: ["Book puja", "Astrology consultation", "Open store"],
    };
  }

  if (/(hi|hello|hey|namaste|radhe|jai)/.test(normalized)) {
    reply =
      "Namaste. Main PanditJi assistant hoon. Aap puja booking, astrology chat, astrology call, payment, ya store order ke baare me puchh sakte hain.";
  }

  if (/(astrology|astro|kundli|horoscope|chat|consultation|call|rashifal)/.test(normalized)) {
    intents.push("astrology");
    reply =
      "Astrology consultation ke liye aap `Astrology` section ya `/pandits?category=ASTROLOGY_CHAT` use kar sakte hain. Agar voice-style consultation chahiye to `ASTROLOGY_CALL` services choose kariye. Profile me service dekh kar date/time select karke booking create kar sakte hain.";
  }

  if (/(puja|pooja|havan|pandit|griha|satyanarayan|wedding|ritual)/.test(normalized)) {
    intents.push("puja");
    reply =
      "Puja booking ke liye `Browse Pandits` page par jaiye, city aur service filter lagaiye, fir pandit profile kholkar service select karke booking create kijiye. Payment ke baad booking confirm flow complete ho jayega.";
  }

  if (/(book|booking|schedule|slot|date|time|cancel)/.test(normalized)) {
    intents.push("booking");
    reply =
      "Booking flow simple hai: expert select kariye, service choose kariye, date/time dijiye, address ya online mode set kariye, fir payment complete kariye. Existing booking cancel karne ke liye `My Bookings` section use kijiye.";
  }

  if (/(payment|pay|razorpay|refund|upi|money)/.test(normalized)) {
    reply =
      "Payments DigiPandit me Razorpay flow ke through create hote hain. Booking ya order create hone ke baad payment order generate hota hai. Agar payment issue ho to pehle entity create hui hai ya nahi aur uska gateway order generate hua hai ya nahi ye check kijiye.";
  }

  if (/(store|samagri|kit|idol|book|incense|order)/.test(normalized)) {
    intents.push("store");
    reply =
      "Puja samagri ke liye store section me jaiye. Wahan se products cart me add kariye, checkout kijiye, aur order history `Orders` flow se track kar sakte hain.";
  }

  if (/(login|signup|sign up|register|account|password)/.test(normalized)) {
    intents.push("auth");
    reply =
      "Account help ke liye signup ya login page use kijiye. Ab successful login/signup ke baad user home page par redirect hota hai. Forgot password ke liye OTP based reset backend me available hai.";
  }

  if (/(become pandit|join as pandit|pandit dashboard|approval|service add|earnings)/.test(normalized)) {
    intents.push("pandit");
    reply =
      "Pandit banne ke liye signup me `Pandit / Astrologer` account type choose kijiye. Uske baad profile complete kariye, services aur availability add kariye, aur admin approval ke baad bookings accept kar sakte hain.";
  }

  return {
    reply,
    suggestions: buildSuggestions(intents),
  };
};

module.exports = { getPanditJiResponse };
