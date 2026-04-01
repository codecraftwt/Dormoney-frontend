import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="container">
      <h1>Page not found</h1>
      <p>Go back to your dashboard.</p>
      <Link to="/dashboard">Dashboard</Link>
    </main>
  );
}
