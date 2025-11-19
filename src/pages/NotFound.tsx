import { Link } from "react-router-dom";

const NotFound = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-[#1857FE] mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Sahifa topilmadi
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.
        </p>
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block bg-[#1857FE] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Asosiy sahifaga qaytish
          </Link>
          <div className="text-gray-600">
            <Link to="/doctors" className="hover:text-[#1857FE] transition-colors duration-200">
              Doktorlar
            </Link>
            {" | "}
            <Link to="/services" className="hover:text-[#1857FE] transition-colors duration-200">
              Xizmatlar
            </Link>
            {" | "}
            <Link to="/news" className="hover:text-[#1857FE] transition-colors duration-200">
              Yangiliklar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

