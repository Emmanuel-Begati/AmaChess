
const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-t from-[#0a0f16] to-[#111822] border-t border-[#233248]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-[#115fd4] to-[#4a90e2] rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-white">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">AmaChess</span>
          </div>

          {/* Copyright */}
          <p className="text-[#92a8c9] text-sm">
            © {new Date().getFullYear()} AmaChess. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
