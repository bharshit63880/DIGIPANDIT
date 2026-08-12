import { useEffect, useMemo, useState } from "react";
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
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState("DEFAULT");

  useEffect(() => {
    const fetchProducts = async () => {
      setError("");
      try {
        const response = await api.get("/products");
        setProducts(response.data.data.filter((product) => allowedStoreCategories.includes(product.category)));
      } catch (requestError) {
        setProducts([]);
        setError("पूजा सामग्री अभी उपलब्ध नहीं हो सकी। कृपया पुनः प्रयास करें।");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const visibleProducts = useMemo(() => products
    .filter((product) => category === "ALL" || product.category === category)
    .filter((product) => !search.trim() || `${product.name} ${getProductContent(product).shortDescription}`.toLocaleLowerCase("hi").includes(search.trim().toLocaleLowerCase("hi")))
    .sort((a, b) => sort === "PRICE_LOW" ? Number(a.price) - Number(b.price) : sort === "PRICE_HIGH" ? Number(b.price) - Number(a.price) : 0), [products, search, category, sort]);

  return (
    <div className="dp-theme dp-store-theme dp-store-reference container-shell py-12">
      <div className="dp-store-atmosphere" aria-hidden="true">
        <span className="dp-store-mandala" />
        <img src="/cinematic/puja-essentials.png" alt="" width="1024" height="805" />
        <i /><b />
      </div>
      <div className="dp-store-reference__heading"><SectionTitle
        eyebrow="पूजा स्टोर"
        title="पूजा की आवश्यक सामग्री, एक भरोसेमंद जगह पर"
        description="रोज़मर्रा की पूजा के लिए चुनी हुई पूजा किट, मूर्तियाँ, धूप और मंदिर की उपयोगी सामग्री देखें।"
      /><div className="dp-store-search"><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="पूजा सामग्री खोजें" aria-label="पूजा सामग्री खोजें" /><span>खोजें</span></div></div>

      <div className="dp-store-filterbar"><label>श्रेणी<select value={category} onChange={(e)=>setCategory(e.target.value)}><option value="ALL">सभी</option>{allowedStoreCategories.map((item)=><option key={item} value={item}>{productCategoryLabels[item]}</option>)}</select></label><label>क्रम<select value={sort} onChange={(e)=>setSort(e.target.value)}><option value="DEFAULT">लोकप्रिय</option><option value="PRICE_LOW">कम कीमत</option><option value="PRICE_HIGH">अधिक कीमत</option></select></label><span>कुल {visibleProducts.length} उत्पाद उपलब्ध</span></div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} />)
          : visibleProducts.map((product, index) => (
              <article key={product._id} className={`dp-store-product flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-soft ${index === 0 ? "dp-store-product--featured" : ""}`}>
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
                    <p className="text-lg font-bold text-brand-maroon">₹{product.price}</p>
                    <Button className="px-4 py-2.5 text-sm" onClick={() => dispatch(addToCart(product))}>
                      कार्ट में जोड़ें
                    </Button>
                  </div>
                  <Link to={`/store/${product.slug}`} className="mt-3 inline-flex text-sm font-semibold text-brand-maroon">
                    विवरण देखें
                  </Link>
                </div>
              </article>
            ))}
      </div>

      {error ? (
        <div role="alert" className="mt-8 rounded-[24px] border border-red-200 bg-red-50 p-6 text-sm font-medium text-red-700">
          {error} कृपया DigiPandit बैकएंड चालू होने की पुष्टि करें और फिर से कोशिश करें।
        </div>
      ) : null}

      {!loading && !error && !products.length ? (
        <div className="mt-8 rounded-[24px] bg-white p-6 shadow-soft">
          <p className="text-sm text-brand-ink/70">अभी कोई पूजा सामग्री उपलब्ध नहीं है। कृपया थोड़ी देर बाद फिर देखें।</p>
        </div>
      ) : null}
    </div>
  );
}
