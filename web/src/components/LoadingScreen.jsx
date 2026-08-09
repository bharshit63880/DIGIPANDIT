export function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070402] p-6" role="status" aria-label="डिजीपंडित खुल रहा है">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,154,49,0.16),transparent_34%)]" aria-hidden="true" />
      <div className="relative grid h-32 w-32 place-items-center rounded-full" aria-hidden="true">
        <span className="absolute inset-0 animate-spin rounded-full border border-[#8f5d15]/50 border-t-[#ffd878] shadow-[0_0_24px_rgba(238,177,66,0.55),inset_0_0_20px_rgba(238,177,66,0.12)]" />
        <span className="absolute inset-2 animate-[spin_1.8s_linear_infinite_reverse] rounded-full border-2 border-transparent border-b-[#e6a83e] border-l-[#ffe4a0]/70 shadow-[0_0_18px_rgba(255,190,71,0.38)]" />
        <span className="absolute inset-5 rounded-full border border-[#d99b32]/35 bg-[radial-gradient(circle,rgba(77,42,12,0.7),rgba(12,6,3,0.96))] shadow-[0_0_34px_rgba(223,151,40,0.26)]" />
        <img src="/digipandit-emblem.webp" alt="" width="72" height="72" className="relative z-10 h-[4.5rem] w-[4.5rem] object-contain drop-shadow-[0_0_12px_rgba(255,191,70,0.7)]" />
      </div>
      <span className="sr-only">डिजीपंडित खुल रहा है</span>
    </div>
  );
}
