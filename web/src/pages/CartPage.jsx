import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { clearCart, removeFromCart, updateQuantity } from "../features/cart/cartSlice";
import { useAuth } from "../hooks/useAuth";
import { payEntity } from "../lib/payments";

export default function CartPage() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const [message, setMessage] = useState("");
  const [paying, setPaying] = useState(false);
  const items = useSelector((state) => state.cart.items);

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 999 ? 0 : items.length ? 79 : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  }, [items]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setMessage("Please login before placing a store order.");
      return;
    }

    try {
      const response = await api.post("/store/orders", {
        items: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
        shippingAddress: {
          label: "Primary",
          line1: "Demo address",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
        },
      });
      setPaying(true);
      await payEntity({
        entityType: "STORE_ORDER",
        entityId: response.data.data._id,
        title: "Puja Samagri Order",
        customer: user,
      });
      dispatch(clearCart());
      setMessage("Order created and payment completed successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[36px] bg-white p-8 shadow-soft">
          <h1 className="text-4xl font-bold text-brand-ink">Your cart</h1>
          <div className="mt-8 space-y-4">
            {items.length ? (
              items.map((item) => (
                <div key={item._id} className="flex flex-col gap-4 rounded-[24px] border border-brand-sand p-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-brand-ink">{item.name}</h3>
                    <p className="mt-1 text-sm text-brand-ink/65">Rs. {item.price} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => dispatch(updateQuantity({ id: item._id, quantity: Number(e.target.value) }))}
                      className="w-20 rounded-2xl border border-brand-sand px-3 py-2"
                    />
                    <Button variant="secondary" onClick={() => dispatch(removeFromCart(item._id))}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-brand-ink/70">
                Your cart is empty. <Link to="/store" className="font-semibold text-brand-maroon">Browse the store</Link>.
              </p>
            )}
          </div>
        </div>

        <aside className="rounded-[36px] bg-white p-8 shadow-soft">
          <h2 className="text-3xl font-bold text-brand-ink">Order summary</h2>
          <div className="mt-6 space-y-3 text-sm text-brand-ink/75">
            <div className="flex justify-between"><span>Subtotal</span><span>Rs. {summary.subtotal}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>Rs. {summary.shipping}</span></div>
            <div className="flex justify-between text-lg font-bold text-brand-ink"><span>Total</span><span>Rs. {summary.total}</span></div>
          </div>
          <Button className="mt-6 w-full" onClick={handleCheckout} disabled={!items.length || paying}>
            {paying ? "Processing payment..." : "Checkout & Pay"}
          </Button>
          {message ? <p className="mt-4 text-sm text-brand-maroon">{message}</p> : null}
        </aside>
      </div>
    </div>
  );
}
