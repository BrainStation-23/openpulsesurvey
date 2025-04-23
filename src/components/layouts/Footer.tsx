
// Footer now minimal: only copyright; all contact and "get in touch" removed

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="border-t border-gray-800 pt-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Brain Station 23. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
