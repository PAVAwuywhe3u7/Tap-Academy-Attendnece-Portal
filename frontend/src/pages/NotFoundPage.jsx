import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="grid min-h-screen place-items-center bg-brand-gradient px-6 text-center text-white">
    <div className="space-y-4">
      <p className="text-6xl font-display font-bold">404</p>
      <p className="text-lg text-slate-200">The page you requested does not exist.</p>
      <Link to="/" className="btn-gradient inline-flex">
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;