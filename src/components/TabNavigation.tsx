import { useState, useEffect } from 'react';

type TabType = 'spectrum' | 'recordings' | 'config' | 'about';

interface TabNavigationProps {
  children: (activeTab: TabType) => React.ReactNode;
}

export const TabNavigation = ({ children }: TabNavigationProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('spectrum');

  // Load previously selected tab from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab') as TabType;
    if (savedTab && ['spectrum', 'recordings', 'config', 'about'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange('spectrum')}
          className={`flex-1 py-4 px-6 text-center font-semibold transition ${
            activeTab === 'spectrum'
              ? 'bg-blue-500 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📊 Spectrum
        </button>
        <button
          onClick={() => handleTabChange('recordings')}
          className={`flex-1 py-4 px-6 text-center font-semibold transition ${
            activeTab === 'recordings'
              ? 'bg-blue-500 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎙️ Recordings
        </button>
        <button
          onClick={() => handleTabChange('config')}
          className={`flex-1 py-4 px-6 text-center font-semibold transition ${
            activeTab === 'config'
              ? 'bg-blue-500 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ⚙️ Config/Test
        </button>
        <button
          onClick={() => handleTabChange('about')}
          className={`flex-1 py-4 px-6 text-center font-semibold transition ${
            activeTab === 'about'
              ? 'bg-blue-500 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ℹ️ About
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {children(activeTab)}
      </div>
    </div>
  );
};
