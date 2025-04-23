
const Footer = () => {
  return (
    <footer className="w-full fixed bottom-0 left-0 z-10 bg-gray-900/80 text-white py-2">
      <div className="container mx-auto px-4 text-center text-gray-400 text-xs">
        <p>
          © {new Date().getFullYear()} Brain Station 23. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
