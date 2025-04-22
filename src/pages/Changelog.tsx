
import React from 'react';

const Changelog = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Changes</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Improved user interface</li>
          <li>Performance optimizations</li>
          <li>New features coming soon</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Recent Updates</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-lg">Version 1.0.0</h3>
            <p className="text-gray-600">Initial release of the application</p>
            <ul className="list-disc list-inside text-gray-600 pl-4">
              <li>Core functionality implemented</li>
              <li>Basic user management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Changelog;
