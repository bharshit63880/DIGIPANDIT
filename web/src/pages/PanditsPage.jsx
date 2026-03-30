import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { getExpertImage } from "../lib/media";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { LoadingCard } from "../components/LoadingCard";
import { SectionTitle } from "../components/SectionTitle";

const categoryTabs = [
  { label: "All Services", value: "" },
  { label: "Puja", value: "PUJA" },
  { label: "Astrology Chat", value: "ASTROLOGY_CHAT" },
  { label: "Astrology Call", value: "ASTROLOGY_CALL" },
];

export default function PanditsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    pujaType: searchParams.get("pujaType") || "",
    rating: searchParams.get("rating") || "",
    category: searchParams.get("category") || "",
  });
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPandits = async () => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));

    try {
      const response = await api.get("/pandits", { params });
      setPandits(response.data.data);
    } catch (error) {
      setPandits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFilters({
      city: searchParams.get("city") || "",
      pujaType: searchParams.get("pujaType") || "",
      rating: searchParams.get("rating") || "",
      category: searchParams.get("category") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    loadPandits();
  }, [searchParams]);

  const applyFilters = () => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    setSearchParams(params);
  };

  return (
    <div className="container-shell py-12">
      <SectionTitle
        eyebrow="Discover"
        title="Find pandits and astrology experts by city, service type, and rating"
        description="Use dedicated filters to compare puja services, astrology chats, and call consultations more easily."
      />

      <div className="mt-8 flex flex-wrap gap-3">
        {categoryTabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => {
              const next = { ...filters, category: tab.value };
              setFilters(next);
              setSearchParams(Object.fromEntries(Object.entries(next).filter(([, value]) => value)));
            }}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${
              filters.category === tab.value
                ? "bg-brand-maroon text-white"
                : "bg-white text-brand-ink shadow-soft hover:bg-brand-sand"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 rounded-[28px] bg-white p-5 shadow-soft md:grid-cols-4">
        <Input label="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
        <Input
          label="Puja type"
          value={filters.pujaType}
          onChange={(e) => setFilters({ ...filters, pujaType: e.target.value })}
        />
        <Input
          label="Minimum rating"
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          type="number"
          min="1"
          max="5"
        />
        <div className="flex items-end">
          <Button className="w-full" onClick={applyFilters}>
            Apply filters
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} />)
          : pandits.map((pandit) => (
              <article key={pandit._id} className="flex h-full flex-col overflow-hidden rounded-[24px] bg-white shadow-soft">
                <img
                  src={getExpertImage(pandit)}
                  alt={pandit.user?.name}
                  className="h-40 w-full object-cover object-[center_18%]"
                />
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${pandit.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                          <span className={`h-2.5 w-2.5 rounded-full ${pandit.isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {pandit.isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <h3
                        className="text-[1.2rem] font-bold leading-tight text-brand-ink"
                        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {pandit.user?.name}
                      </h3>
                      <p
                        className="mt-1 text-sm text-brand-ink/65"
                        style={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {pandit.serviceCities?.join(", ") || "Multiple cities"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-brand-cream px-3 py-1 text-sm font-semibold text-brand-ink">
                      <Star className="h-4 w-4 text-brand-gold" />
                      {pandit.ratingAverage?.toFixed(1) || "4.8"}
                    </div>
                  </div>
                  <p
                    className="mt-3 text-sm leading-7 text-brand-ink/70"
                    style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {pandit.bio || "Experienced pandit for pujas and astrology consultations."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(pandit.specialization || []).slice(0, 2).map((item) => (
                      <span key={item} className="rounded-full bg-brand-sand/40 px-3 py-1 text-xs font-semibold text-brand-ink">
                        {item}
                      </span>
                    ))}
                    {(pandit.services || []).slice(0, 1).map((service) => (
                      <span key={service._id} className="rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-maroon">
                        {service.category === "PUJA"
                          ? "Puja"
                          : service.category === "ASTROLOGY_CHAT"
                            ? "Astrology Chat"
                            : "Astrology Call"}
                      </span>
                    ))}
                  </div>
                  <Link to={`/pandits/${pandit._id}`} className="mt-4 inline-flex">
                    <Button className="px-4 py-2.5 text-sm">View profile</Button>
                  </Link>
                </div>
              </article>
            ))}
      </div>

      {!loading && !pandits.length ? (
        <div className="mt-10 rounded-[28px] bg-white p-8 shadow-soft">
          <h3 className="text-2xl font-bold text-brand-ink">No experts found</h3>
          <p className="mt-3 text-sm leading-7 text-brand-ink/70">
            Try clearing the current filters or switch to the Astrology Chat or Astrology Call tabs to explore additional services.
          </p>
        </div>
      ) : null}
    </div>
  );
}
