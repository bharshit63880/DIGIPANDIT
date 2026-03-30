const expertPhotoMap = {
  "Pt. Raghav Shastri":
    "https://images.pexels.com/photos/28867319/pexels-photo-28867319.jpeg?cs=srgb&dl=pexels-absoluteabhi-28867319.jpg&fm=jpg",
  "Acharya Devendra Mishra":
    "https://images.pexels.com/photos/30970681/pexels-photo-30970681.jpeg?cs=srgb&dl=pexels-amol-nakve-2148578663-30970681.jpg&fm=jpg",
  "Astrologer Neha Joshi":
    "https://images.pexels.com/photos/32711516/pexels-photo-32711516.jpeg?cs=srgb&dl=pexels-anamitul-32711516.jpg&fm=jpg",
  "Pt. Omkar Tripathi":
    "https://images.pexels.com/photos/19673009/pexels-photo-19673009.jpeg?cs=srgb&dl=pexels-look-me-photography-779697472-19673009.jpg&fm=jpg",
  "Dr. Kavya Bhardwaj":
    "https://images.pexels.com/photos/31635315/pexels-photo-31635315.jpeg?cs=srgb&dl=pexels-nishantdas-31635315.jpg&fm=jpg",
  "Pt. Suresh Kulkarni":
    "https://images.pexels.com/photos/34423743/pexels-photo-34423743.jpeg?cs=srgb&dl=pexels-theamritdev-34423743.jpg&fm=jpg",
};

const productPhotoMap = {
  "Complete Satyanarayan Puja Kit":
    "https://images.unsplash.com/photo-1604608672516-f1b8f9d87e7b?auto=format&fit=crop&w=1200&q=80",
  "Brass Ganesha Idol":
    "https://images.unsplash.com/photo-1632204909023-c4d6f8d5f1db?auto=format&fit=crop&w=1200&q=80",
  "Premium Sandal Incense Sticks":
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
  "Bhagavad Gita Pocket Edition":
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
  "Navgraha Puja Samagri Box":
    "https://images.unsplash.com/photo-1597812648441-45d8b45f4a3f?auto=format&fit=crop&w=1200&q=80",
  "Marble Shiva Lingam Idol":
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
  "Dhoop Cone Devotional Pack":
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  "Hanuman Chalisa Hardbound":
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=80",
};

const isGeneratedAvatar = (url = "") => url.includes("ui-avatars.com");
const isPlaceholderProduct = (url = "") => url.includes("via.placeholder.com");
const categoryLabelMap = {
  PUJA_KIT: "Puja Kit",
  IDOL: "Murti",
  INCENSE: "Dhoop Agarbatti",
};

const encodeSvg = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

export const getProductFallbackImage = (product) => {
  const category = categoryLabelMap[product?.category] || "Puja Samagri";
  const title = product?.name || "DigiPandit Store";

  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f7efe4"/>
          <stop offset="100%" stop-color="#ecd3b8"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#bg)"/>
      <circle cx="190" cy="170" r="85" fill="#8f351b" opacity="0.12"/>
      <circle cx="1010" cy="610" r="120" fill="#8f351b" opacity="0.08"/>
      <rect x="110" y="145" rx="28" ry="28" width="980" height="510" fill="#fffaf4" opacity="0.92"/>
      <text x="160" y="255" fill="#b86b42" font-family="Georgia, serif" font-size="34" letter-spacing="8">${category.toUpperCase()}</text>
      <text x="160" y="365" fill="#1c2130" font-family="Georgia, serif" font-size="62" font-weight="700">${title}</text>
      <text x="160" y="460" fill="#6a5960" font-family="Arial, sans-serif" font-size="34">Shuddh puja samagri for ghar aur mandir use</text>
      <text x="160" y="555" fill="#8f351b" font-family="Arial, sans-serif" font-size="30">DigiPandit Store</text>
    </svg>
  `);
};

export const getExpertImage = (expert) => {
  const mapped = expertPhotoMap[expert?.user?.name];
  const current = expert?.image?.url || expert?.user?.avatar?.url || "";

  if (mapped && (!current || isGeneratedAvatar(current))) {
    return mapped;
  }

  return current || mapped || "https://randomuser.me/api/portraits/lego/1.jpg";
};

export const getProductImage = (product) => {
  const mapped = productPhotoMap[product?.name];
  const current = product?.images?.[0]?.url || "";

  if (mapped) {
    return mapped;
  }

  return (!isPlaceholderProduct(current) && current) || getProductFallbackImage(product);
};
