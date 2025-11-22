import { useEffect } from 'react';
import { useAudioStore, TabType } from '../store/audioStore';

interface TabNavigationProps {
  children: (activeTab: TabType) => React.ReactNode;
}

export const TabNavigation = ({ children }: TabNavigationProps) => {
  const { activeTab, setActiveTab } = useAudioStore();

  // Load previously selected tab from localStorage on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab') as TabType;
    if (savedTab && ['spectrum', 'recordings', 'config', 'about'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, [setActiveTab]);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('spectrum')}
          className={`flex-1 py-4 px-6 text-center font-semibold transition ${
            activeTab === 'spectrum'
              ? 'bg-blue-500 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          📊 Spectrum
        </button>
        <button
          onClick={() => setActiveTab('recordings')}
          className={`flex-1 py-4 px-6 text-center font-semibold transition ${
            activeTab === 'recordings'
              ? 'bg-blue-500 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🎙️ Recordings
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex-1 py-4 px-6 text-center font-semibold transition ${
            activeTab === 'config'
              ? 'bg-blue-500 text-white border-b-2 border-blue-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          ⚙️ Config/Test
        </button>
        <button
          onClick={() => setActiveTab('about')}
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
