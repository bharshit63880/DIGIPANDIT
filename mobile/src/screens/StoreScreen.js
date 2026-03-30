import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { api } from "../lib/api";
import { getProductImage } from "../lib/media";
import { allowedStoreCategories, productCategoryLabels } from "../lib/productContent";
import { useCart } from "../context/CartContext";

export function StoreScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, summary } = useCart();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.data.filter((product) => allowedStoreCategories.includes(product.category)));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Puja Store</Text>
        <Text style={styles.subtitle}>Sirf puja ka zaroori saman, bina faltu cheezon ke.</Text>
        <View style={styles.badges}>
          {allowedStoreCategories.map((category) => (
            <View key={category} style={styles.badge}>
              <Text style={styles.badgeText}>{productCategoryLabels[category]}</Text>
            </View>
          ))}
        </View>
        <Pressable style={styles.cartButton} onPress={() => navigation.navigate("Cart")}>
          <Text style={styles.cartButtonText}>Cart kholo ({summary.totalItems})</Text>
        </Pressable>
      </Card>

      {loading ? <ActivityIndicator size="large" color="#7a2e1d" /> : null}

      {!loading && !products.length ? (
        <Card>
          <Text style={styles.emptyText}>Abhi puja store me saman available nahi hai.</Text>
        </Card>
      ) : null}

      {products.map((product) => (
        <Card key={product._id} style={styles.productCard}>
          <Pressable onPress={() => navigation.navigate("ProductDetail", { slug: product.slug })}>
            <Image source={{ uri: getProductImage(product) }} style={styles.image} resizeMode="cover" />
          </Pressable>
          <Text style={styles.category}>{productCategoryLabels[product.category] || product.category}</Text>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.price}>Rs. {product.price}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("ProductDetail", { slug: product.slug })}>
              <Text style={styles.secondaryButtonText}>Open description</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => addToCart(product)}>
              <Text style={styles.primaryButtonText}>Add to cart</Text>
            </Pressable>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 8, color: "#5e6167", lineHeight: 22 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  badge: { backgroundColor: "#fff6ef", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: "#7a2e1d", fontWeight: "700", fontSize: 12 },
  cartButton: {
    marginTop: 16,
    alignSelf: "flex-start",
    backgroundColor: "#202126",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cartButtonText: { color: "#fff", fontWeight: "700" },
  image: { width: "100%", height: 180, borderRadius: 18, backgroundColor: "#f1e4d5" },
  category: { marginTop: 14, color: "#b86b42", fontWeight: "700", letterSpacing: 1.1, textTransform: "uppercase" },
  productCard: { padding: 14 },
  productTitle: { marginTop: 8, fontSize: 24, fontWeight: "800", color: "#202126", lineHeight: 30 },
  price: { marginTop: 10, fontSize: 24, fontWeight: "800", color: "#7a2e1d" },
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
  secondaryButtonText: { color: "#202126", fontWeight: "700", textAlign: "center" },
  emptyText: { color: "#5e6167", lineHeight: 22 },
});
