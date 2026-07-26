import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { StatCard } from "../components/StatCard";
import { Input } from "../components/Input";
import { Button } from "../components/Button";

const emptyService = {
  name: "",
  category: "PUJA",
  description: "",
  durationInMinutes: 60,
  price: 0,
  isActive: true,
};

const emptySlot = {
  day: "MON",
  startTime: "09:00",
  endTime: "18:00",
  isAvailable: true,
};

function TextAreaField({ label, value, onChange, rows = 4 }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-brand-ink">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
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

export default function PanditDashboardPage() {
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState({ totalEarnings: 0, totalBookings: 0, withdrawals: [] });
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    bio: "",
    experienceInYears: 0,
    specialization: "",
    languages: "",
    serviceCities: "",
    isOnline: false,
    services: [emptyService],
    availability: [emptySlot],
  });
  const [notice, setNotice] = useState("");

  const load = async () => {
    const [profileRes, earningsRes, bookingsRes] = await Promise.all([
      api.get("/pandits/dashboard/me/profile"),
      api.get("/pandits/dashboard/me/earnings"),
      api.get("/pandits/dashboard/me/bookings"),
    ]);

    const nextProfile = profileRes.data.data;
    setProfile(nextProfile);
    setEarnings(earningsRes.data.data);
    setBookings(bookingsRes.data.data || bookingsRes.data.docs || []);
    setForm({
      bio: nextProfile.bio || "",
      experienceInYears: nextProfile.experienceInYears || 0,
      specialization: (nextProfile.specialization || []).join(", "),
      languages: (nextProfile.languages || []).join(", "),
      serviceCities: (nextProfile.serviceCities || []).join(", "),
      isOnline: nextProfile.isOnline || false,
      services: nextProfile.services?.length ? nextProfile.services : [emptyService],
      availability: nextProfile.availability?.length ? nextProfile.availability : [emptySlot],
    });
  };

  useEffect(() => {
    load();
  }, []);

  const updateService = (index, key, value) => {
    setForm((current) => ({
      ...current,
      services: current.services.map((service, serviceIndex) =>
        serviceIndex === index ? { ...service, [key]: value } : service
      ),
    }));
  };

  const updateSlot = (index, key, value) => {
    setForm((current) => ({
      ...current,
      availability: current.availability.map((slot, slotIndex) =>
        slotIndex === index ? { ...slot, [key]: value } : slot
      ),
    }));
  };

  const saveProfile = async () => {
    const payload = {
      bio: form.bio,
      experienceInYears: Number(form.experienceInYears || 0),
      specialization: form.specialization.split(",").map((item) => item.trim()).filter(Boolean),
      languages: form.languages.split(",").map((item) => item.trim()).filter(Boolean),
      serviceCities: form.serviceCities.split(",").map((item) => item.trim()).filter(Boolean),
      isOnline: form.isOnline,
      services: form.services.map((service) => ({
        ...service,
        durationInMinutes: Number(service.durationInMinutes || 60),
        price: Number(service.price || 0),
      })),
      availability: form.availability,
    };

    await api.patch("/pandits/dashboard/me/profile", payload);
    setNotice("Profile updated successfully.");
    load();
  };

  const togglePresence = async () => {
    const nextOnline = !form.isOnline;
    await api.patch("/pandits/dashboard/me/presence", { isOnline: nextOnline });
    setForm((current) => ({ ...current, isOnline: nextOnline }));
    setNotice(`You are now ${nextOnline ? "online" : "offline"}.`);
    load();
  };

  const updateBookingStatus = async (bookingId, status) => {
    await api.patch(`/bookings/${bookingId}/status`, { status });
    setNotice(`Booking ${status.toLowerCase()} successfully.`);
    load();
  };

  if (!profile) {
    return <div className="rounded-[36px] bg-white p-8 shadow-soft">Loading expert dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-clay">Pandit Dashboard</p>
            <h1 className="mt-3 text-4xl font-bold text-brand-ink">{profile.user?.name || "Your profile"}</h1>
            <p className="mt-3 text-brand-ink/70">
              Yahan se aap apna profile, services, availability, aur visible online/offline status manage kar sakte ho.
            </p>
            {notice ? <p className="mt-4 text-sm font-semibold text-brand-forest">{notice}</p> : null}
          </div>
          <button
            onClick={togglePresence}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${
              form.isOnline ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}
          >
            <span className={`h-3 w-3 rounded-full ${form.isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
            {form.isOnline ? "Online" : "Offline"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Approval" value={profile.approvalStatus || "PENDING"} detail="Admin approval status" />
        <StatCard label="Bookings" value={earnings.totalBookings} detail="Completed paid bookings" />
        <StatCard label="Earnings" value={`Rs. ${earnings.totalEarnings}`} detail="Total credited revenue" />
        <StatCard label="Presence" value={form.isOnline ? "ONLINE" : "OFFLINE"} detail="Visible to users with green/red dot" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[36px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">Profile section</h2>
          <div className="mt-6 space-y-4">
            <TextAreaField label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Experience in years"
                type="number"
                value={form.experienceInYears}
                onChange={(e) => setForm({ ...form, experienceInYears: e.target.value })}
              />
              <Input
                label="Specialization comma separated"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
              />
              <Input
                label="Languages comma separated"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
              />
              <Input
                label="Service cities comma separated"
                value={form.serviceCities}
                onChange={(e) => setForm({ ...form, serviceCities: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[36px] bg-white p-8 shadow-soft">
          <h2 className="text-2xl font-bold text-brand-ink">Upcoming schedule</h2>
          <div className="mt-6 space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="rounded-[24px] border border-brand-sand p-5">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-clay">{booking.status}</p>
                <h3 className="mt-2 text-xl font-bold text-brand-ink">{booking.serviceName}</h3>
                <p className="mt-2 text-sm text-brand-ink/65">
                  {booking.user?.name} | {new Date(booking.scheduleAt).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-brand-ink/65">
                  Mode: {booking.meetingMode} | Payment: {booking.payment?.status || "CREATED"}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {booking.status === "PENDING" ? (
                    <>
                      <Button onClick={() => updateBookingStatus(booking._id, "ACCEPTED")}>Accept</Button>
                      <Button variant="secondary" onClick={() => updateBookingStatus(booking._id, "REJECTED")}>
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {booking.status === "ACCEPTED" ? (
                    <Button variant="secondary" onClick={() => updateBookingStatus(booking._id, "COMPLETED")}>
                      Mark completed
                    </Button>
                  ) : null}
                  {booking.meetingLink && booking.payment?.status === "PAID" ? (
                    <Link to={`/video-call/${booking._id}`}>
                      <Button variant="secondary">Join video call</Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-brand-ink">Services management</h2>
          <Button variant="secondary" onClick={() => setForm((current) => ({ ...current, services: [...current.services, { ...emptyService }] }))}>
            Add service
          </Button>
        </div>
        <div className="mt-6 space-y-4">
          {form.services.map((service, index) => (
            <div key={`${service._id || "new"}-${index}`} className="rounded-[24px] border border-brand-sand p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input label="Service name" value={service.name} onChange={(e) => updateService(index, "name", e.target.value)} />
                <SelectField
                  label="Category"
                  value={service.category}
                  onChange={(e) => updateService(index, "category", e.target.value)}
                  options={["PUJA", "ASTROLOGY_CHAT", "ASTROLOGY_CALL"]}
                />
                <Input
                  label="Price"
                  type="number"
                  value={service.price}
                  onChange={(e) => updateService(index, "price", e.target.value)}
                />
                <Input
                  label="Duration in minutes"
                  type="number"
                  value={service.durationInMinutes}
                  onChange={(e) => updateService(index, "durationInMinutes", e.target.value)}
                />
                <SelectField
                  label="Active"
                  value={service.isActive ? "ACTIVE" : "INACTIVE"}
                  onChange={(e) => updateService(index, "isActive", e.target.value === "ACTIVE")}
                  options={["ACTIVE", "INACTIVE"]}
                />
              </div>
              <div className="mt-4">
                <TextAreaField
                  label="Description"
                  value={service.description || ""}
                  onChange={(e) => updateService(index, "description", e.target.value)}
                />
              </div>
              {form.services.length > 1 ? (
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setForm((current) => ({ ...current, services: current.services.filter((_, serviceIndex) => serviceIndex !== index) }))}
                >
                  Remove service
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[36px] bg-white p-8 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-brand-ink">Availability calendar</h2>
          <Button variant="secondary" onClick={() => setForm((current) => ({ ...current, availability: [...current.availability, { ...emptySlot }] }))}>
            Add slot
          </Button>
        </div>
        <div className="mt-6 space-y-4">
          {form.availability.map((slot, index) => (
            <div key={`${slot._id || "slot"}-${index}`} className="rounded-[24px] border border-brand-sand p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SelectField
                  label="Day"
                  value={slot.day}
                  onChange={(e) => updateSlot(index, "day", e.target.value)}
                  options={["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]}
                />
                <Input label="Start time" value={slot.startTime} onChange={(e) => updateSlot(index, "startTime", e.target.value)} />
                <Input label="End time" value={slot.endTime} onChange={(e) => updateSlot(index, "endTime", e.target.value)} />
                <SelectField
                  label="Availability"
                  value={slot.isAvailable ? "AVAILABLE" : "UNAVAILABLE"}
                  onChange={(e) => updateSlot(index, "isAvailable", e.target.value === "AVAILABLE")}
                  options={["AVAILABLE", "UNAVAILABLE"]}
                />
              </div>
              {form.availability.length > 1 ? (
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setForm((current) => ({ ...current, availability: current.availability.filter((_, slotIndex) => slotIndex !== index) }))}
                >
                  Remove slot
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={saveProfile}>Save profile changes</Button>
      </div>
    </div>
  );
}
