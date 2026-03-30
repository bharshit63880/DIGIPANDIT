const productPhotoMap = {
  "Complete Satyanarayan Puja Kit":
    "https://images.unsplash.com/photo-1604608672516-f1b8f9d87e7b?auto=format&fit=crop&w=1200&q=80",
  "Brass Ganesha Idol":
    "https://images.unsplash.com/photo-1632204909023-c4d6f8d5f1db?auto=format&fit=crop&w=1200&q=80",
  "Premium Sandal Incense Sticks":
    "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
  "Navgraha Puja Samagri Box":
    "https://images.unsplash.com/photo-1597812648441-45d8b45f4a3f?auto=format&fit=crop&w=1200&q=80",
  "Marble Shiva Lingam Idol":
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80",
  "Dhoop Cone Devotional Pack":
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
};

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
      <rect x="100" y="120" rx="28" ry="28" width="1000" height="560" fill="#fffaf4" opacity="0.94"/>
      <text x="150" y="250" fill="#b86b42" font-family="Georgia, serif" font-size="36" letter-spacing="7">${category.toUpperCase()}</text>
      <text x="150" y="380" fill="#1c2130" font-family="Georgia, serif" font-size="58" font-weight="700">${title}</text>
      <text x="150" y="490" fill="#6a5960" font-family="Arial, sans-serif" font-size="34">Shuddh puja samagri for ghar aur mandir use</text>
    </svg>
  `);
};

export const getProductImage = (product) => {
  const mapped = productPhotoMap[product?.name];
  const current = product?.images?.[0]?.url || "";

  if (mapped) {
    return mapped;
  }

  return (!isPlaceholderProduct(current) && current) || getProductFallbackImage(product);
};
