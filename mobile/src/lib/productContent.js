export const allowedStoreCategories = ["PUJA_KIT", "IDOL", "INCENSE"];

export const productCategoryLabels = {
  PUJA_KIT: "Puja Kit",
  IDOL: "Murti",
  INCENSE: "Dhoop Agarbatti",
};

const defaultContentByCategory = {
  PUJA_KIT: {
    shortDescription: "Puja ke liye ready-to-use samagri, taaki alag se saman jodne ki tension na rahe.",
    overview:
      "Ye puja kit ghar ki puja, vrat, aur shanti path ke liye useful hai. Isme basic samagri ko practical tarike se ready rakha gaya hai.",
    includes: ["Roli aur chawal", "Dhoop ya agarbatti", "Kapoor", "Batti", "Choti puja upyogi samagri"],
    howToUse: [
      "Puja se pehle saman ko ek saaf aasan ya chauki par rakh lijiye.",
      "Sankalp ke hisab se pandit ji ya ghar ke bade ke saath puja shuru kijiye.",
      "Bachi hui saaf samagri ko agle upyog ke liye alag dibbe me rakh sakte hain.",
    ],
    bestFor: ["Ghar ki niyamit puja", "Vrat aur katha", "Family ritual preparation"],
    note: "Puja vidhi alag parampara ke hisab se thodi change ho sakti hai.",
  },
  IDOL: {
    shortDescription: "Mandir, sthapana, aur daily darshan ke liye pavitra murti.",
    overview:
      "Ye murti ghar ke mandir me sthapana, tyohar puja, aur daily bhakti ke liye rakhi ja sakti hai.",
    includes: ["Ek murti", "Safe packing", "Basic care guidance"],
    howToUse: [
      "Murti ko saaf aur uchit jagah par sthapit kijiye.",
      "Rozana phool, diya, aur prarthana ke saath seva kijiye.",
      "Safai ke liye halka saaf kapda use kijiye aur chemical products avoid kijiye.",
    ],
    bestFor: ["Ghar ka mandir", "Festival sthapana", "Daily bhakti aur darshan"],
    note: "Murti ko bachchon ki pahunch se door aur stable surface par rakhein.",
  },
  INCENSE: {
    shortDescription: "Roz ki puja aur mandir ke mahaul ko sugandhit aur shaant banane ke liye.",
    overview:
      "Ye dhoop ya agarbatti ghar ki subah-shaam puja, aarti, aur meditation ke time use ki ja sakti hai.",
    includes: ["Dhoop ya agarbatti pack", "Fragrance-based devotional product"],
    howToUse: [
      "Ek stick ya cone ko safely jala kar holder me rakh dijiye.",
      "Use hamesha hawadar jagah me karein.",
      "Bujhne ke baad raakh ko thanda hone par dispose karein.",
    ],
    bestFor: ["Subah ki puja", "Shaam ki aarti", "Meditation aur mandir fragrance"],
    note: "Jalte hue product ko bina dekh-rekh ke na chhodein.",
  },
};

const productContentMap = {
  "complete-satyanarayan-puja-kit": {
    shortDescription: "Satyanarayan katha aur ghar ki shubh puja ke liye sampoorna taiyar samagri set.",
    overview:
      "Is kit ko is tarah curate kiya gaya hai ki Satyanarayan puja ke liye basic se lekar essential puja saman ek hi jagah mil jaye. Ghar par katha, prasad, aur sankalp ki tayari asaan ho jati hai.",
    includes: [
      "Kalash aur puja aasan ke basic upyogi items",
      "Roli, chawal, moli aur haldi",
      "Kapoor, batti aur agarbatti",
      "Phool chadhane aur sankalp me useful puja essentials",
      "Prasad aur katha arrangement ke liye supportive saman",
    ],
    howToUse: [
      "Puja shuru karne se pehle saara saman ek saaf chauki par saja lijiye.",
      "Kalash sthapana aur sankalp ke samay kit ke roli, chawal, moli aur anya saman ka upyog kijiye.",
      "Aarti ke samay kapoor, diya aur agarbatti use kijiye.",
      "Katha ke baad bachi hui saaf samagri ko future puja ke liye sambhal kar rakh sakte hain.",
    ],
    bestFor: ["Satyanarayan katha", "Ghar ki shubh puja", "Family religious gathering"],
    note: "Prasad, phal, aur fresh phool alag se arrange karna useful rahega.",
  },
  "brass-ganesha-idol": {
    shortDescription: "Ghar ke mandir, naye kaam ki shuruaat, aur tyohar puja ke liye shubh Ganesh murti.",
    overview:
      "Brass Ganesh murti ko mandir sthapana, Diwali, Ganesh Chaturthi, aur roz ki prarthana ke liye use kiya ja sakta hai. Iska finish ghar ke mandir me premium devotional look deta hai.",
    includes: ["Brass Ganesh murti", "Protective box packing", "Basic care instruction"],
    howToUse: [
      "Murti ko mandir ya saaf uchit jagah par sthapit kijiye.",
      "Roz diya, phool, aur kumkum ke saath prarthana kar sakte hain.",
      "Murti ko hafte me ek baar soft dry cloth se saaf kijiye.",
    ],
    bestFor: ["Ghar ka mandir", "Ganesh Chaturthi", "Naye ghar ya office ki shuruaat"],
    note: "Paani ya strong cleaner se polish ko nuksan ho sakta hai, isliye soft dry cloth best rahega.",
  },
  "premium-sandal-incense-sticks": {
    shortDescription: "Chandan sugandh wali agarbatti jo daily puja aur shaant mahaul ke liye perfect hai.",
    overview:
      "Ye sandal incense sticks roz ki puja, dhyan, aur ghar ke mandir ke mahaul ko sugandhit banane ke liye design ki gayi hain.",
    includes: ["Sandal fragrance agarbatti sticks", "Ready-to-use incense pack"],
    howToUse: [
      "Ek agarbatti ko jala kar halka sa flame bujha dijiye.",
      "Use incense holder me seedha rakhiye.",
      "Puja, aarti, ya meditation ke dauran use hone dijiye.",
    ],
    bestFor: ["Daily puja", "Morning prayer", "Meditation corner"],
    note: "Bachchon se door rakhein aur hamesha heat-safe holder me hi jalayein.",
  },
  "navgraha-puja-samagri-box": {
    shortDescription: "Navgraha shanti aur grah dosh sambandhit puja ke liye ready samagri box.",
    overview:
      "Ye box un parivaron ke liye useful hai jo Navgraha puja, shanti path, ya grah dosh sambandhit anushthan karna chahte hain. Isse alag-alag choti samagri dhoondhne ki mehnat kam ho jati hai.",
    includes: [
      "Navgraha puja ke liye curated basic samagri",
      "Roli, chawal, moli aur puja upyogi dravya",
      "Dhoop, kapoor aur diya use items",
      "Shanti path ke liye supportive ritual items",
    ],
    howToUse: [
      "Pandit ji ki vidhi ke hisab se saman ko alag-alag katoriyon ya thali me rakh lijiye.",
      "Navgraha sankalp aur mantra ucharan ke dauran required items use kijiye.",
      "Aarti aur samapan ke baad bachi samagri ko saaf jagah par rakh lijiye.",
    ],
    bestFor: ["Navgraha shanti", "Grah dosh puja", "Remedial family ritual"],
    note: "Specific anushthan ke liye pandit ji se ek baar list verify kar lena aur bhi behtar rahega.",
  },
  "marble-shiva-lingam-idol": {
    shortDescription: "Shiv puja, jal abhishek, aur Sawan ya Shivratri ke liye pavitra Shivling murti.",
    overview:
      "Marble Shiva Lingam ghar ke mandir me daily jal arpan, Rudrabhishek, aur Sawan/ Shivratri puja ke liye bahut upyogi hai.",
    includes: ["Marble Shiva Lingam", "Secure protective packing", "Basic care guidance"],
    howToUse: [
      "Shivling ko saaf chowki ya mandir base par sthapit kijiye.",
      "Daily jal, belpatra, aur phool chadha sakte hain.",
      "Shivratri ya Sawan me doodh, jal, aur mantra ke saath abhishek kijiye.",
    ],
    bestFor: ["Daily Shiv puja", "Sawan Somvar", "Mahamrityunjaya jaap aur abhishek"],
    note: "Abhishek ke baad Shivling ko softly wipe karke saaf aur dry rakhein.",
  },
  "dhoop-cone-devotional-pack": {
    shortDescription: "Subah-shaam ki puja aur ghar ke mandir ke liye sugandhit dhoop cone pack.",
    overview:
      "Ye devotional dhoop cones aarti ke time, shaam ki puja, aur shaant spiritual environment ke liye suitable hain.",
    includes: ["Fragrance-based dhoop cone pack", "Ready devotional use pack"],
    howToUse: [
      "Ek cone ko heat-safe stand par rakhiye.",
      "Top ko jala kar halka sa flame bujha dijiye taaki smoke release ho.",
      "Puja ke dauran use hone dijiye aur baad me ash thandi hone par saaf kar dijiye.",
    ],
    bestFor: ["Evening aarti", "Mandir fragrance", "Prayer room ambience"],
    note: "Closed room me use karte waqt halka ventilation zaroor rakhein.",
  },
};

export const getProductContent = (product) => {
  const bySlug = productContentMap[product?.slug];

  if (bySlug) {
    return bySlug;
  }

  return defaultContentByCategory[product?.category] || defaultContentByCategory.PUJA_KIT;
};
