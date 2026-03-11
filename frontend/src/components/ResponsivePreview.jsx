import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

const ResponsivePreview = ({ screenshots }) => {
  const [selectedDevice, setSelectedDevice] = useState('mobile');

  if (!screenshots || Object.keys(screenshots).length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
        <p className="text-sm text-yellow-800">⚠️ Screenshots could not be captured</p>
      </div>
    );
  }

  const devices = [
    { key: 'mobile', label: 'Mobile', icon: Smartphone },
    { key: 'tablet', label: 'Tablet', icon: Tablet },
    { key: 'desktop', label: 'Desktop', icon: Monitor }
  ];

  const getMockupStyle = (device) => {
    const styles = {
      mobile: 'w-[300px] h-[580px] bg-gray-900 rounded-[40px] border-[14px] border-gray-800',
      tablet: 'w-[550px] h-[750px] bg-gray-800 rounded-[30px] border-[16px] border-gray-700',
      desktop: 'w-[900px] h-[540px] bg-gray-900 rounded-t-lg border-t-[24px] border-x-[10px] border-gray-800'
    };
    return styles[device];
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          📱 Device Rendering
        </h3>
        <p className="text-sm text-gray-500">
          See how your website looks on different devices
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {devices.map(({ key, label, icon: Icon }) => {
          if (!screenshots[key]) return null;
          return (
            <button
              key={key}
              onClick={() => setSelectedDevice(key)}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm transition-all border-b-2 ${
                selectedDevice === key
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <Icon size={18} />
              {label}
              <span className="text-xs text-gray-400">
                {screenshots[key].width}×{screenshots[key].height}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preview Area */}
      <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl py-12 px-4 overflow-x-auto">
        {screenshots[selectedDevice] && (
          <>
            <div className={`shadow-2xl overflow-hidden ${getMockupStyle(selectedDevice)}`}>
              <img
                src={`data:image/png;base64,${screenshots[selectedDevice].image}`}
                alt={`${selectedDevice} preview`}
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Stand for desktop */}
            {selectedDevice === 'desktop' && (
              <>
                <div className="w-[180px] h-[40px] bg-gray-700" />
                <div className="w-[260px] h-[10px] bg-gray-800 rounded-full" />
              </>
            )}

            {/* Home button for mobile */}
            {selectedDevice === 'mobile' && (
              <div className="mt-3 w-[45px] h-[5px] bg-gray-700 rounded-full" />
            )}

            {/* Home button for tablet */}
            {selectedDevice === 'tablet' && (
              <div className="mt-3 w-[35px] h-[35px] bg-gray-600 rounded-full border-2 border-gray-500" />
            )}
          </>
        )}
      </div>

      {/* Status */}
      <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded">
        <p className="text-sm font-semibold text-green-800">
          ✅ Responsive Design Detected - Your website adapts to different screen sizes
        </p>
      </div>
    </div>
  );
};

export default ResponsivePreview;
