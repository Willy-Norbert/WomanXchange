
import { Link } from 'react-router-dom';

const TopBanner = () => {
  return (
    <div className="bg-purple-600 text-white py-2 text-center text-sm">
      <div className="container mx-auto px-4">
        Sell on Our Platform: {' '}
        <Link to="/register" className="underline hover:text-purple-200 transition-colors">
          Join as a Seller
        </Link>
      </div>
    </div>
  );
};

export default TopBanner;
