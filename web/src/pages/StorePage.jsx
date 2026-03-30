import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { getProductFallbackImage, getProductImage } from "../lib/media";
import { allowedStoreCategories, getProductContent, productCategoryLabels } from "../lib/productContent";
import { Button } from "../components/Button";
import { LoadingCard } from "../components/LoadingCard";
import { SectionTitle } from "../components/SectionTitle";
import { addToCart } from "../features/cart/cartSlice";

export default function StorePage() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.data.filter((product) => allowedStoreCategories.includes(product.category)));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container-shell py-12">
      <SectionTitle
        eyebrow="Puja Store"
        title="A curated store for essential puja products"
        description="Browse puja kits, murtis, incense, and practical mandir essentials selected for everyday use."
      />

      <div className="mt-8 flex flex-wrap gap-3">
        {allowedStoreCategories.map((category) => (
          <div
            key={category}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-clay shadow-soft"
          >
            {productCategoryLabels[category]}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} />)
          : products.map((product) => (
              <article key={product._id} className="flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-soft">
                <Link to={`/store/${product.slug}`} className="block overflow-hidden">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="h-40 w-full object-cover transition duration-300 hover:scale-[1.03]"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = getProductFallbackImage(product);
                    }}
                  />
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-clay">
                    {productCategoryLabels[product.category] || product.category.replaceAll("_", " ")}
                  </p>
                  <Link to={`/store/${product.slug}`}>
                    <h3
                      className="mt-2 text-xl font-bold leading-tight text-brand-ink"
                      style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {product.name}
                    </h3>
                  </Link>
                  <p
                    className="mt-3 text-sm leading-7 text-brand-ink/70"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {getProductContent(product).shortDescription}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-lg font-bold text-brand-maroon">Rs. {product.price}</p>
                    <Button className="px-4 py-2.5 text-sm" onClick={() => dispatch(addToCart(product))}>
                      Add to cart
                    </Button>
                  </div>
                  <Link to={`/store/${product.slug}`} className="mt-3 inline-flex text-sm font-semibold text-brand-maroon">
                    View details
                  </Link>
                </div>
              </article>
            ))}
      </div>

      {!loading && !products.length ? (
        <div className="mt-8 rounded-[24px] bg-white p-6 shadow-soft">
          <p className="text-sm text-brand-ink/70">No puja products are available at the moment. Please check back shortly.</p>
        </div>
      ) : null}
    </div>
  );
}
