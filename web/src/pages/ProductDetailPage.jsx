import { useEffect, useState } from "react";
import { CheckCircle2, ChevronLeft, PackageCheck, ShieldCheck, Sparkles, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api } from "../lib/api";
import { getProductFallbackImage, getProductImage } from "../lib/media";
import { allowedStoreCategories, getProductContent, productCategoryLabels } from "../lib/productContent";
import { addToCart } from "../features/cart/cartSlice";
import { Button } from "../components/Button";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/products/${slug}`);
        const nextProduct = response.data.data;

        if (!allowedStoreCategories.includes(nextProduct.category)) {
          setError("This product is not currently available in the store.");
          setProduct(null);
          return;
        }

        setProduct(nextProduct);
      } catch (requestError) {
        setError("We could not load the product details right now. Please try again shortly.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) {
    return <div className="container-shell py-16 text-sm text-brand-ink/70">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="container-shell py-16">
        <div className="rounded-[28px] bg-white p-8 shadow-soft">
          <p className="text-sm text-brand-ink/70">{error || "The product could not be found."}</p>
          <Link to="/store" className="mt-5 inline-flex">
            <Button variant="secondary">Back to store</Button>
          </Link>
        </div>
      </div>
    );
  }

  const content = getProductContent(product);
  const categoryLabel = productCategoryLabels[product.category] || product.category.replaceAll("_", " ");
  const savings = product.compareAtPrice ? product.compareAtPrice - product.price : 0;

  return (
    <div className="container-shell py-12">
      <Link to="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-maroon">
        <ChevronLeft className="h-4 w-4" />
        Back to store
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-soft">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-80 w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = getProductFallbackImage(product);
            }}
          />
        </div>

        <div className="rounded-[32px] bg-white p-8 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-clay">{categoryLabel}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-brand-ink">{product.name}</h1>
          <p className="mt-4 text-base leading-8 text-brand-ink/75">{content.shortDescription}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-ink">
              Rs. {product.price}
            </div>
            {product.compareAtPrice ? (
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-ink/55 line-through shadow-soft">
                Rs. {product.compareAtPrice}
              </div>
            ) : null}
            {product.averageRating ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-sand/45 px-4 py-2 text-sm font-semibold text-brand-ink">
                <Star className="h-4 w-4 text-brand-gold" />
                {product.averageRating.toFixed(1)} rating
              </div>
            ) : null}
            <div className="rounded-full bg-brand-sand/45 px-4 py-2 text-sm font-semibold text-brand-ink">
              Stock: {product.stock}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] bg-brand-sand/35 p-4">
              <PackageCheck className="h-5 w-5 text-brand-maroon" />
              <p className="mt-3 text-sm font-semibold text-brand-ink">Prepared for practical puja use</p>
            </div>
            <div className="rounded-[22px] bg-brand-sand/35 p-4">
              <Sparkles className="h-5 w-5 text-brand-maroon" />
              <p className="mt-3 text-sm font-semibold text-brand-ink">Suitable for both home and mandir settings</p>
            </div>
            <div className="rounded-[22px] bg-brand-sand/35 p-4">
              <ShieldCheck className="h-5 w-5 text-brand-maroon" />
              <p className="mt-3 text-sm font-semibold text-brand-ink">Secure packaging with clear usage guidance</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button onClick={() => dispatch(addToCart(product))}>Add to cart</Button>
            <Link to="/cart">
              <Button variant="secondary">View cart</Button>
            </Link>
          </div>

          {savings > 0 ? (
            <p className="mt-4 text-sm font-medium text-brand-forest">You are saving up to Rs. {savings} on this item.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-[30px] bg-white p-7 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">What is included</h2>
          <ul className="mt-5 space-y-3">
            {content.includes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-7 text-brand-ink/75">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand-maroon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-[30px] bg-white p-7 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">What this product is best for</h2>
          <p className="mt-4 text-sm leading-8 text-brand-ink/75">{content.overview}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {content.bestFor.map((item) => (
              <span key={item} className="rounded-full bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-maroon">
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[30px] bg-white p-7 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">How to use it</h2>
          <div className="mt-5 space-y-4">
            {content.howToUse.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-[22px] bg-brand-sand/30 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-maroon text-sm font-bold text-white">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-brand-ink/75">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-[30px] bg-white p-7 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">Important note</h2>
          <p className="mt-4 text-sm leading-8 text-brand-ink/75">{content.note}</p>

          {product.tags?.length ? (
            <>
              <h3 className="mt-7 text-lg font-bold text-brand-ink">Popular tags</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-brand-sand/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
