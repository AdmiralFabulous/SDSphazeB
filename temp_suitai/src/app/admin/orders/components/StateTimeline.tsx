interface StateHistoryItem {
  id: string;
  fromState: string;
  toState: string;
  reason?: string | null;
  createdAt: string;
}

interface StateTimelineProps {
  history: StateHistoryItem[];
}

export function StateTimeline({ history }: StateTimelineProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const stateColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const getStateColor = (state: string) => {
    return stateColors[state] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">State History</h2>

      {history.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No state changes recorded</p>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                {index < history.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-300 my-2"></div>
                )}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(item.fromState)}`}>
                    {item.fromState}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStateColor(item.toState)}`}>
                    {item.toState}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                {item.reason && (
                  <p className="text-sm text-gray-700 mt-1">{item.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
