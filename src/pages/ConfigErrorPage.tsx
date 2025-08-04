import React from "react";

const ConfigErrorPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-10 bg-white rounded-lg shadow-xl text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Configuration Error
        </h1>
        <p className="text-gray-700">
          The application is not configured correctly. The API endpoint URL is
          missing.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Please ensure the{" "}
          <code className="bg-gray-200 p-1 rounded">VITE_API_BASE_URL</code>{" "}
          environment variable is set correctly.
        </p>
      </div>
    </div>
  );
};

export default ConfigErrorPage;
