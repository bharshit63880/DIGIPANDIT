export const allowedStoreCategories = ["PUJA_KIT", "IDOL", "INCENSE"];

export const productCategoryLabels = {
  PUJA_KIT: "Puja Kit",
  IDOL: "Murti",
  INCENSE: "Dhoop Agarbatti",
};

const defaultContentByCategory = {
  PUJA_KIT: {
    shortDescription: "A ready-to-use puja set that reduces the effort of gathering essentials separately.",
    overview:
      "This puja kit is suitable for home rituals, vrat observances, and shanti path. It brings together essential items in a practical, easy-to-use format.",
    includes: ["Roli aur chawal", "Dhoop ya agarbatti", "Kapoor", "Batti", "Choti puja upyogi samagri"],
    howToUse: [
      "Arrange the items neatly on a clean aasan or chauki before beginning the puja.",
      "Start the ritual according to your sankalp, ideally with guidance from a pandit or elder in the family.",
      "Store any clean unused items separately for future use.",
    ],
    bestFor: ["Ghar ki niyamit puja", "Vrat aur katha", "Family ritual preparation"],
    note: "The exact puja process may vary slightly depending on family tradition and sampradaya.",
  },
  IDOL: {
    shortDescription: "A devotional murti suitable for mandir placement, sthapana, and daily darshan.",
    overview:
      "This murti is suitable for home mandirs, festive worship, and everyday devotional practice.",
    includes: ["Ek murti", "Safe packing", "Basic care guidance"],
    howToUse: [
      "Place the murti respectfully in a clean and appropriate space.",
      "Offer flowers, diya, and prayer as part of daily seva.",
      "Use a soft clean cloth for maintenance and avoid harsh chemicals.",
    ],
    bestFor: ["Ghar ka mandir", "Festival sthapana", "Daily bhakti aur darshan"],
    note: "Keep the murti on a stable surface and away from accidental disturbance.",
  },
  INCENSE: {
    shortDescription: "Designed to create a calm, fragrant atmosphere for daily puja and prayer.",
    overview:
      "This incense may be used during morning and evening puja, aarti, or meditation to create a peaceful ambience.",
    includes: ["Dhoop ya agarbatti pack", "Fragrance-based devotional product"],
    howToUse: [
      "Light a stick or cone safely and place it in a suitable holder.",
      "Always use it in a well-ventilated space.",
      "Dispose of the ash only after it has cooled completely.",
    ],
    bestFor: ["Subah ki puja", "Shaam ki aarti", "Meditation aur mandir fragrance"],
    note: "Never leave a lit incense product unattended.",
  },
};

const productContentMap = {
  "complete-satyanarayan-puja-kit": {
    shortDescription: "A complete puja set prepared for Satyanarayan katha and auspicious home rituals.",
    overview:
      "This kit is curated to gather the essential items commonly needed for a Satyanarayan puja in one place, making home preparation simpler and more organised.",
    includes: [
      "Kalash aur puja aasan ke basic upyogi items",
      "Roli, chawal, moli aur haldi",
      "Kapoor, batti aur agarbatti",
      "Phool chadhane aur sankalp me useful puja essentials",
      "Prasad aur katha arrangement ke liye supportive saman",
    ],
    howToUse: [
      "Arrange all items neatly on a clean chauki before the puja begins.",
      "Use the included roli, chawal, moli, and other essentials during kalash sthapana and sankalp.",
      "Use the kapoor, diya, and agarbatti during aarti.",
      "Store any clean unused items carefully for future rituals.",
    ],
    bestFor: ["Satyanarayan katha", "Ghar ki shubh puja", "Family religious gathering"],
    note: "Fresh flowers, prasad, and fruits may still need to be arranged separately.",
  },
  "brass-ganesha-idol": {
    shortDescription: "An auspicious Ganesh murti ideal for home mandirs, new beginnings, and festive worship.",
    overview:
      "This brass Ganesh murti is suitable for mandir sthapana, Diwali, Ganesh Chaturthi, and daily prayer. Its finish brings a refined devotional presence to the space.",
    includes: ["Brass Ganesh murti", "Protective box packing", "Basic care instruction"],
    howToUse: [
      "Place the murti in your mandir or another clean, respectful location.",
      "Use it for daily prayer with diya, flowers, and kumkum if desired.",
      "Clean it gently with a soft dry cloth once a week or as needed.",
    ],
    bestFor: ["Ghar ka mandir", "Ganesh Chaturthi", "Naye ghar ya office ki shuruaat"],
    note: "Avoid water and strong cleaners, as they may affect the finish.",
  },
  "premium-sandal-incense-sticks": {
    shortDescription: "Sandalwood incense sticks designed for daily puja and a calm devotional atmosphere.",
    overview:
      "These sandal incense sticks are designed for daily prayer, meditation, and creating a serene atmosphere in the home mandir.",
    includes: ["Sandal fragrance agarbatti sticks", "Ready-to-use incense pack"],
    howToUse: [
      "Light one incense stick and gently extinguish the flame.",
      "Place it upright in a suitable incense holder.",
      "Allow it to burn during puja, aarti, or meditation.",
    ],
    bestFor: ["Daily puja", "Morning prayer", "Meditation corner"],
    note: "Keep away from children and always use a heat-safe holder.",
  },
  "navgraha-puja-samagri-box": {
    shortDescription: "A prepared samagri box for Navgraha shanti and related remedial pujas.",
    overview:
      "This box is useful for families planning a Navgraha puja, shanti path, or other grah dosh-related rituals. It reduces the effort of sourcing multiple smaller items separately.",
    includes: [
      "Navgraha puja ke liye curated basic samagri",
      "Roli, chawal, moli aur puja upyogi dravya",
      "Dhoop, kapoor aur diya use items",
      "Shanti path ke liye supportive ritual items",
    ],
    howToUse: [
      "Arrange the items in bowls or a thali according to the pandit’s ritual instructions.",
      "Use the required items during the Navgraha sankalp and mantra recitation.",
      "After aarti and completion, store any unused clean items carefully.",
    ],
    bestFor: ["Navgraha shanti", "Grah dosh puja", "Remedial family ritual"],
    note: "For specific rituals, it is best to confirm the required list once with your pandit.",
  },
  "marble-shiva-lingam-idol": {
    shortDescription: "A sacred Shivling suitable for Shiv puja, jal abhishek, Sawan, and Shivratri worship.",
    overview:
      "This marble Shiva Lingam is well suited for daily jal arpan, Rudrabhishek, and Shivratri or Sawan observances in the home mandir.",
    includes: ["Marble Shiva Lingam", "Secure protective packing", "Basic care guidance"],
    howToUse: [
      "Place the Shivling on a clean chauki or dedicated mandir base.",
      "Offer jal, belpatra, and flowers as part of daily worship.",
      "During Shivratri or Sawan, perform abhishek with milk, water, and mantra recitation as per tradition.",
    ],
    bestFor: ["Daily Shiv puja", "Sawan Somvar", "Mahamrityunjaya jaap aur abhishek"],
    note: "After abhishek, wipe the Shivling gently and keep it clean and dry.",
  },
  "dhoop-cone-devotional-pack": {
    shortDescription: "A fragrant devotional dhoop cone pack for morning and evening worship.",
    overview:
      "These devotional dhoop cones are suitable for aarti, evening puja, and creating a peaceful spiritual environment.",
    includes: ["Fragrance-based dhoop cone pack", "Ready devotional use pack"],
    howToUse: [
      "Place one cone on a heat-safe stand.",
      "Light the top and gently extinguish the flame so the cone begins to release smoke.",
      "Let it burn during the puja and clean the ash once it has cooled.",
    ],
    bestFor: ["Evening aarti", "Mandir fragrance", "Prayer room ambience"],
    note: "Ensure light ventilation when using it in enclosed rooms.",
  },
};

export const getProductContent = (product) => {
  const bySlug = productContentMap[product?.slug];

  if (bySlug) {
    return bySlug;
  }

  return defaultContentByCategory[product?.category] || defaultContentByCategory.PUJA_KIT;
};
