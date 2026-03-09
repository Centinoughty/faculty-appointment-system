interface TabNavigationProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
    return (
        <div className="flex px-4 bg-white border-b border-gray-100 pb-0">
            {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`
              flex-1 py-3 text-center text-sm font-semibold transition-colors relative
              ${isActive ? 'text-purple-700' : 'text-gray-500 hover:text-gray-700'}
            `}
                    >
                        {tab}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-700 rounded-t-full" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
