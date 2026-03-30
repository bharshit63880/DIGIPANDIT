import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { api } from "../lib/api";
import { getProductImage } from "../lib/media";
import { allowedStoreCategories, getProductContent, productCategoryLabels } from "../lib/productContent";
import { useCart } from "../context/CartContext";

export function ProductDetailScreen({ route, navigation }) {
  const { slug } = route.params;
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/products/${slug}`);
        const nextProduct = response.data.data;

        if (!allowedStoreCategories.includes(nextProduct.category)) {
          setProduct(null);
          setError("Ye product abhi mobile store me available nahi hai.");
          return;
        }

        setProduct(nextProduct);
      } catch (requestError) {
        setError("Product detail load nahi ho paayi. Thodi der baad dobara try kijiye.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color="#7a2e1d" />
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen>
        <Card>
          <Text style={styles.errorText}>{error || "Product nahi mili."}</Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Store par wapas</Text>
          </Pressable>
        </Card>
      </Screen>
    );
  }

  const content = getProductContent(product);

  return (
    <Screen>
      <Card style={styles.heroCard}>
        <Image source={{ uri: getProductImage(product) }} style={styles.image} resizeMode="cover" />
        <Text style={styles.category}>{productCategoryLabels[product.category] || product.category}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.subtitle}>{content.shortDescription}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs. {product.price}</Text>
          <Text style={styles.stock}>Stock: {product.stock}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => addToCart(product)}>
            <Text style={styles.primaryButtonText}>Add to cart</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("Cart")}>
            <Text style={styles.secondaryButtonText}>Cart dekho</Text>
          </Pressable>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Iske andar aapko kya kya milega</Text>
        {content.includes.map((item) => (
          <Text key={item} style={styles.bulletText}>• {item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Ye product kis kaam aayega</Text>
        <Text style={styles.bodyText}>{content.overview}</Text>
        <View style={styles.badgeWrap}>
          {content.bestFor.map((item) => (
            <View key={item} style={styles.badge}>
              <Text style={styles.badgeText}>{item}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Kaise use karein</Text>
        {content.howToUse.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Dhyan dene wali baat</Text>
        <Text style={styles.bodyText}>{content.note}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: { padding: 14 },
  image: { width: "100%", height: 220, borderRadius: 20, backgroundColor: "#f1e4d5" },
  category: { marginTop: 16, color: "#b86b42", fontWeight: "700", letterSpacing: 1.1, textTransform: "uppercase" },
  title: { marginTop: 8, fontSize: 30, fontWeight: "800", color: "#202126", lineHeight: 36 },
  subtitle: { marginTop: 10, color: "#5e6167", lineHeight: 23 },
  priceRow: { marginTop: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  price: { fontSize: 26, fontWeight: "800", color: "#7a2e1d" },
  stock: { color: "#202126", fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  primaryButton: {
    flex: 1,
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#f8f1e8",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#202126", fontWeight: "700" },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#202126" },
  bulletText: { marginTop: 10, color: "#5e6167", lineHeight: 23 },
  bodyText: { marginTop: 12, color: "#5e6167", lineHeight: 24 },
  badgeWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  badge: { backgroundColor: "#fff6ef", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: "#7a2e1d", fontWeight: "700", fontSize: 12 },
  stepRow: { flexDirection: "row", gap: 12, marginTop: 14, alignItems: "flex-start" },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#7a2e1d",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumberText: { color: "#fff", fontWeight: "800" },
  stepText: { flex: 1, color: "#5e6167", lineHeight: 23 },
  errorText: { color: "#5e6167", lineHeight: 22 },
});
