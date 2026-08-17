import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="app-shell">
      <section className="card not-found-card">
        <h1>Page not found</h1>
        <p>There's nothing to value here. Head back and try a real address.</p>
        <Link to="/" className="secondary-link">
          Back to the estimator
        </Link>
      </section>
    </div>
  );
}
