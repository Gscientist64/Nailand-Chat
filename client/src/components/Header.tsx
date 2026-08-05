

// Header.tsx
import logo from '../assets/images/logo/logo.png';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { IoIosGlobe } from 'react-icons/io';

const Header = () => {
  return (
    <header className="bg-[#f5f5f5] flex justify-between items-center px-[5%] py-2 max-w-[1440px] mx-auto gap-8">
     

     
       <Link to="/" className="flex items-center flex-shrink-0">
        <img src={logo} alt="NaiLand" className="w-[100px] h-auto" />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex gap-6 items-center">
        <nav>
          <ul className="flex list-none gap-8">
            <li>
              <Link to="/" className="no-underline text-[#1a1a1a] font-medium hover:text-[#fdc416] transition-colors duration-300">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="no-underline text-[#1a1a1a] font-medium hover:text-[#fdc416] transition-colors duration-300">
                About
              </Link>
            </li>
            <li>
              <Link to="/pages" className="no-underline text-[#1a1a1a] font-medium hover:text-[#fdc416] transition-colors duration-300">
                Pages
              </Link>
            </li>
            <li className="relative group">
              <button className="flex items-center gap-1 text-[#1a1a1a] font-medium hover:text-[#fdc416] transition-colors duration-300 bg-transparent border-none cursor-pointer">
                Features 
                <FiChevronDown className="text-xs transition-transform duration-300 group-hover:rotate-180" />
              </button>
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-lg py-2 min-w-[180px] opacity-0 invisible translate-y-2.5 transition-all duration-300 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 z-[1000]">
                <Link to="/features/web3" className="block px-4 py-2 text-[#1a1a1a] no-underline whitespace-nowrap hover:bg-gray-100 hover:text-[#fdc416]">Web3 Features</Link>
                <Link to="/features/collaboration" className="block px-4 py-2 text-[#1a1a1a] no-underline whitespace-nowrap hover:bg-gray-100 hover:text-[#fdc416]">Collaboration</Link>
                <Link to="/features/community" className="block px-4 py-2 text-[#1a1a1a] no-underline whitespace-nowrap hover:bg-gray-100 hover:text-[#fdc416]">Community</Link>
              </div>
            </li>
          </ul>
        </nav>
        
        {/* Language Selector */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-r border-gray-300 mr-2 cursor-pointer">
          <IoIosGlobe className="text-gray-600 text-base" />
          <span className="text-sm font-medium text-[#1a1a1a]">Language</span>
          <FiChevronDown className="text-gray-400 text-xs" />
        </div>
        
        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-6 py-2.5 border border-[#1a1a1a] rounded-[50px] font-semibold text-sm no-underline text-[#1a1a1a] hover:bg-gray-100 transition-colors duration-300">
            Log In
          </Link>
          <Link to="/signup" className="px-6 py-2.5 bg-[#fdc416] rounded-[50px] font-semibold text-sm no-underline text-[#1a1a1a] hover:bg-yellow-500 transition-colors duration-300">
            Sign Up
          </Link>
        </div>
        </div>
        

      {/* Mobile Menu Icon */}
      <button className="md:hidden text-2xl cursor-pointer">
        <i className="ph ph-list"></i>
      </button>
    </header>
  );
};

export default Header;