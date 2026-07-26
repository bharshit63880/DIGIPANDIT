export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-ink p-6">
      <div className="border border-white/10 bg-white/5 px-8 py-7 text-center backdrop-blur">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
        <p className="mt-4 font-serif text-xl text-white">Preparing your space</p>
      </div>
    </div>
  );
}
