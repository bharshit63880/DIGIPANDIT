import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { StatCard } from "../components/StatCard";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "products", label: "Products" },
  { id: "experts", label: "Pandits & Astrologers" },
  { id: "bookings", label: "Bookings" },
  { id: "orders", label: "Orders" },
  { id: "withdrawals", label: "Withdrawals" },
];

const emptyUserForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "USER",
  city: "",
  state: "",
  isActive: true,
};

const emptyProductForm = {
  name: "",
  category: "PUJA_KIT",
  description: "",
  price: 0,
  compareAtPrice: 0,
  stock: 0,
  tags: "",
  isActive: true,
};

const orderStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const bookingStatuses = ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"];

function TextAreaField({ label, value, onChange, rows = 4 }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink">
      <span>{label}</span>
      <textarea
        value={value}
        rows={rows}
        onChange={onChange}
        className="rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none transition focus:border-brand-clay"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink">
      <span>{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="rounded-2xl border border-brand-sand bg-white px-4 py-3 outline-none transition focus:border-brand-clay"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [experts, setExperts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState("");
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState("");

  const totalRevenue = useMemo(() => {
    if (!dashboard) return 0;

    const bookingRevenue = (dashboard.bookingRevenueByMonth || []).reduce((sum, row) => sum + (row.revenue || 0), 0);
    const storeRevenue = (dashboard.storeRevenueByMonth || []).reduce((sum, row) => sum + (row.revenue || 0), 0);
    return bookingRevenue + storeRevenue;
  }, [dashboard]);

  const pendingExpertsCount = useMemo(
    () => experts.filter((expert) => expert.approvalStatus === "PENDING").length,
    [experts]
  );

  const activeUsersCount = useMemo(
    () => users.filter((user) => user.isActive).length,
    [users]
  );

  const paidOrdersCount = useMemo(
    () => orders.filter((order) => order.payment?.status === "PAID").length,
    [orders]
  );

  const paidBookingsCount = useMemo(
    () => bookings.filter((booking) => booking.payment?.status === "PAID").length,
    [bookings]
  );

  const loadData = async () => {
    setLoading(true);

    try {
      const [dashboardRes, usersRes, productsRes, expertsRes, bookingsRes, ordersRes, withdrawalsRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users", { params: { limit: 50 } }),
        api.get("/admin/products"),
        api.get("/admin/pandits/approvals"),
        api.get("/admin/bookings", { params: { limit: 50 } }),
        api.get("/admin/store-orders", { params: { limit: 50 } }),
        api.get("/admin/withdrawals"),
      ]);

      setDashboard(dashboardRes.data.data);
      setUsers(usersRes.data.docs || []);
      setProducts(productsRes.data.data || []);
      setExperts(expertsRes.data.data || []);
      setBookings(bookingsRes.data.docs || []);
      setOrders(ordersRes.data.docs || []);
      setWithdrawals(withdrawalsRes.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetUserForm = () => {
    setEditingUserId("");
    setUserForm(emptyUserForm);
  };

  const resetProductForm = () => {
    setEditingProductId("");
    setProductForm(emptyProductForm);
  };

  const saveUser = async () => {
    const payload = {
      ...userForm,
      email: userForm.email.trim(),
    };

    if (editingUserId) {
      delete payload.password;
      await api.patch(`/admin/users/${editingUserId}`, payload);
      setNotice("User updated successfully.");
    } else {
      await api.post("/admin/users", payload);
      setNotice("User created successfully.");
    }

    resetUserForm();
    loadData();
  };

  const editUser = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      role: user.role || "USER",
      city: user.city || "",
      state: user.state || "",
      isActive: user.isActive ?? true,
    });
    setActiveTab("users");
  };

  const deactivateUser = async (userId) => {
    await api.delete(`/admin/users/${userId}`);
    setNotice("User deactivated successfully.");
    loadData();
  };

  const saveProduct = async () => {
    const payload = {
      ...productForm,
      price: Number(productForm.price || 0),
      compareAtPrice: Number(productForm.compareAtPrice || 0),
      stock: Number(productForm.stock || 0),
      tags: productForm.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    if (!payload.compareAtPrice) {
      delete payload.compareAtPrice;
    }

    if (editingProductId) {
      await api.patch(`/admin/products/${editingProductId}`, payload);
      setNotice("Product updated successfully.");
    } else {
      await api.post("/admin/products", payload);
      setNotice("Product created successfully.");
    }

    resetProductForm();
    loadData();
  };

  const editProduct = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name || "",
      category: product.category || "PUJA_KIT",
      description: product.description || "",
      price: product.price || 0,
      compareAtPrice: product.compareAtPrice || 0,
      stock: product.stock || 0,
      tags: (product.tags || []).join(", "),
      isActive: product.isActive ?? true,
    });
    setActiveTab("products");
  };

  const archiveProduct = async (productId) => {
    await api.delete(`/admin/products/${productId}`);
    setNotice("Product archived successfully.");
    loadData();
  };

  const updateExpertApproval = async (expertId, status) => {
    await api.patch(`/admin/pandits/${expertId}/approval`, { status });
    setNotice(`Expert marked as ${status}.`);
    loadData();
  };

  const updateBookingStatus = async (bookingId, status) => {
    await api.patch(`/admin/bookings/${bookingId}`, { status });
    setNotice("Booking updated successfully.");
    loadData();
  };

  const deleteBooking = async (bookingId) => {
    await api.delete(`/admin/bookings/${bookingId}`);
    setNotice("Booking deleted successfully.");
    loadData();
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    await api.patch(`/admin/store-orders/${orderId}/status`, { orderStatus });
    setNotice("Order status updated successfully.");
    loadData();
  };

  const deleteOrder = async (orderId) => {
    await api.delete(`/admin/store-orders/${orderId}`);
    setNotice("Order deleted successfully.");
    loadData();
  };

  const updateWithdrawalStatus = async (withdrawalId, status) => {
    await api.patch(`/admin/withdrawals/${withdrawalId}/status`, { status });
    setNotice("Withdrawal status updated successfully.");
    loadData();
  };

  const deleteWithdrawal = async (withdrawalId) => {
    await api.delete(`/admin/withdrawals/${withdrawalId}`);
    setNotice("Withdrawal deleted successfully.");
    loadData();
  };

  if (loading || !dashboard) {
    return <div className="rounded-[36px] bg-white p-8 shadow-soft">Loading admin control center...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-clay">Admin Control Center</p>
        <h1 className="mt-3 text-4xl font-bold text-brand-ink">Admin-only dashboard with platform-wide control</h1>
        <p className="mt-3 text-brand-ink/70">
          Is panel ko sirf admin role hi access kar sakta hai. Yahan se users, experts, bookings, products, orders,
          aur withdrawals ko manage kiya ja sakta hai.
        </p>
        {notice ? <p className="mt-4 text-sm font-semibold text-brand-forest">{notice}</p> : null}
      </div>

      <div className="grid gap-5 md:grid-cols-5">
        <StatCard label="Users" value={dashboard.totalUsers} detail="Registered customers" />
        <StatCard label="Pandits" value={dashboard.totalPandits} detail="Experts on platform" />
        <StatCard label="Bookings" value={dashboard.totalBookings} detail="All bookings" />
        <StatCard label="Products" value={dashboard.totalProducts} detail="Store catalogue" />
        <StatCard label="Revenue" value={`Rs. ${totalRevenue}`} detail="Bookings + store orders" />
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-3 text-sm font-semibold ${
              activeTab === tab.id ? "bg-brand-maroon text-white" : "bg-white text-brand-ink shadow-soft hover:bg-brand-sand"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[36px] bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-bold text-brand-ink">Latest store orders</h2>
            <div className="mt-6 space-y-4">
              {(dashboard.latestOrders || []).map((order) => (
                <div key={order._id} className="rounded-[24px] border border-brand-sand p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{order.orderStatus}</p>
                  <h3 className="mt-2 text-xl font-bold text-brand-ink">{order.user?.name || "Unknown user"}</h3>
                  <p className="mt-2 text-sm text-brand-ink/65">Payment: {order.payment?.status || "CREATED"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[36px] bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-bold text-brand-ink">Live backend snapshot</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-brand-sand/30 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">Active users</p>
                <p className="mt-3 text-3xl font-bold text-brand-ink">{activeUsersCount}</p>
              </div>
              <div className="rounded-[24px] bg-brand-sand/30 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">Pending expert approvals</p>
                <p className="mt-3 text-3xl font-bold text-brand-ink">{pendingExpertsCount}</p>
              </div>
              <div className="rounded-[24px] bg-brand-sand/30 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">Paid bookings</p>
                <p className="mt-3 text-3xl font-bold text-brand-ink">{paidBookingsCount}</p>
              </div>
              <div className="rounded-[24px] bg-brand-sand/30 p-5">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">Paid store orders</p>
                <p className="mt-3 text-3xl font-bold text-brand-ink">{paidOrdersCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[36px] bg-white p-8 shadow-soft lg:col-span-2">
            <h2 className="text-2xl font-bold text-brand-ink">Recent users from backend</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {users.slice(0, 6).map((user) => (
                <div key={user._id} className="rounded-[24px] border border-brand-sand p-5">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{user.role}</p>
                  <h3 className="mt-2 text-xl font-bold text-brand-ink">{user.name}</h3>
                  <p className="mt-2 text-sm text-brand-ink/65">{user.email}</p>
                  <p className="mt-2 text-sm text-brand-ink/65">{user.city || "No city"} | {user.isActive ? "Active" : "Inactive"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "users" ? (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[36px] bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-bold text-brand-ink">{editingUserId ? "Update user" : "Create new user"}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Name" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
              <Input label="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
              {!editingUserId ? (
                <Input
                  label="Password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                />
              ) : null}
              <Input label="Phone" value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} />
              <Input label="City" value={userForm.city} onChange={(e) => setUserForm({ ...userForm, city: e.target.value })} />
              <Input label="State" value={userForm.state} onChange={(e) => setUserForm({ ...userForm, state: e.target.value })} />
              <SelectField
                label="Role"
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                options={["USER", "PANDIT", "ADMIN"]}
              />
              <SelectField
                label="Status"
                value={userForm.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) => setUserForm({ ...userForm, isActive: e.target.value === "ACTIVE" })}
                options={["ACTIVE", "INACTIVE"]}
              />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={saveUser}>{editingUserId ? "Update user" : "Create user"}</Button>
              <Button variant="secondary" onClick={resetUserForm}>Reset</Button>
            </div>
          </div>

          <div className="rounded-[36px] bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-bold text-brand-ink">All users</h2>
            <div className="mt-6 space-y-4">
              {users.map((user) => (
                <div key={user._id} className="rounded-[24px] border border-brand-sand p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{user.role}</p>
                      <h3 className="mt-2 text-xl font-bold text-brand-ink">{user.name}</h3>
                      <p className="mt-2 text-sm text-brand-ink/65">{user.email}</p>
                      <p className="mt-1 text-sm text-brand-ink/65">{user.city || "No city"} | {user.isActive ? "Active" : "Inactive"}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => editUser(user)}>Edit</Button>
                      <Button variant="secondary" onClick={() => deactivateUser(user._id)}>Deactivate</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "products" ? (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[36px] bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-bold text-brand-ink">{editingProductId ? "Update product" : "Create product"}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
              <SelectField
                label="Category"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                options={["PUJA_KIT", "IDOL", "INCENSE", "BOOK"]}
              />
              <Input label="Price" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
              <Input
                label="Compare price"
                type="number"
                value={productForm.compareAtPrice}
                onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
              />
              <Input label="Stock" type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
              <SelectField
                label="Status"
                value={productForm.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) => setProductForm({ ...productForm, isActive: e.target.value === "ACTIVE" })}
                options={["ACTIVE", "INACTIVE"]}
              />
            </div>
            <div className="mt-4">
              <TextAreaField
                label="Description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>
            <div className="mt-4">
              <Input label="Tags comma separated" value={productForm.tags} onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })} />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={saveProduct}>{editingProductId ? "Update product" : "Create product"}</Button>
              <Button variant="secondary" onClick={resetProductForm}>Reset</Button>
            </div>
          </div>

          <div className="rounded-[36px] bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-bold text-brand-ink">Store catalogue</h2>
            <div className="mt-6 space-y-4">
              {products.map((product) => (
                <div key={product._id} className="rounded-[24px] border border-brand-sand p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{product.category}</p>
                      <h3 className="mt-2 text-xl font-bold text-brand-ink">{product.name}</h3>
                      <p className="mt-2 text-sm text-brand-ink/65">Rs. {product.price} | Stock {product.stock} | {product.isActive ? "Active" : "Archived"}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => editProduct(product)}>Edit</Button>
                      <Button variant="secondary" onClick={() => archiveProduct(product._id)}>Archive</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "experts" ? (
        <div className="rounded-[36px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">Pandit & astrologer profiles</h2>
          <div className="mt-6 space-y-4">
            {experts.map((expert) => (
              <div key={expert._id} className="rounded-[24px] border border-brand-sand p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{expert.approvalStatus}</p>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${expert.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${expert.isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {expert.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-brand-ink">{expert.user?.name}</h3>
                    <p className="mt-2 text-sm text-brand-ink/65">{expert.user?.email}</p>
                    <p className="mt-2 text-sm text-brand-ink/70">{expert.bio || "No bio added yet."}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => updateExpertApproval(expert._id, "APPROVED")}>Approve</Button>
                    <Button variant="secondary" onClick={() => updateExpertApproval(expert._id, "REJECTED")}>Reject</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "bookings" ? (
        <div className="rounded-[36px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">Bookings management</h2>
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="rounded-[24px] border border-brand-sand p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{booking.status}</p>
                    <h3 className="mt-2 text-xl font-bold text-brand-ink">{booking.serviceName}</h3>
                    <p className="mt-2 text-sm text-brand-ink/65">
                      {booking.user?.name} with {booking.pandit?.name} | {new Date(booking.scheduleAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <select
                      defaultValue={booking.status}
                      onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                      className="rounded-full border border-brand-sand px-4 py-3 text-sm font-semibold"
                    >
                      {bookingStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <Button variant="secondary" onClick={() => deleteBooking(booking._id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "orders" ? (
        <div className="rounded-[36px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">Store orders management</h2>
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="rounded-[24px] border border-brand-sand p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{order.orderStatus}</p>
                    <h3 className="mt-2 text-xl font-bold text-brand-ink">{order.user?.name}</h3>
                    <p className="mt-2 text-sm text-brand-ink/65">Payment: {order.payment?.status} | Total: Rs. {order.pricing?.total}</p>
                  </div>
                  <select
                    defaultValue={order.orderStatus}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="rounded-full border border-brand-sand px-4 py-3 text-sm font-semibold"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                      ))}
                  </select>
                  <Button variant="secondary" onClick={() => deleteOrder(order._id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "withdrawals" ? (
        <div className="rounded-[36px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">Withdrawal requests</h2>
          <div className="mt-6 space-y-4">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="rounded-[24px] border border-brand-sand p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{withdrawal.status}</p>
                    <h3 className="mt-2 text-xl font-bold text-brand-ink">{withdrawal.pandit?.name}</h3>
                    <p className="mt-2 text-sm text-brand-ink/65">Amount: Rs. {withdrawal.amount}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => updateWithdrawalStatus(withdrawal._id, "APPROVED")}>Approve</Button>
                    <Button variant="secondary" onClick={() => updateWithdrawalStatus(withdrawal._id, "REJECTED")}>Reject</Button>
                    <Button variant="secondary" onClick={() => deleteWithdrawal(withdrawal._id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
