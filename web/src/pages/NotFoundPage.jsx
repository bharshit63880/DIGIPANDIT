import { Link } from "react-router-dom";
import { Button } from "../components/Button";

export default function NotFoundPage() {
  return (
    <div className="container-shell py-20">
      <div className="rounded-[36px] bg-white p-10 text-center shadow-soft">
        <h1 className="text-5xl font-bold text-brand-ink">404</h1>
        <p className="mt-4 text-brand-ink/70">The page you’re looking for does not exist.</p>
        <Link to="/" className="mt-6 inline-flex">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
