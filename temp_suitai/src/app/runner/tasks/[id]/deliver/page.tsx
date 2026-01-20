'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

interface DeliveryItem {
  id: string;
  name: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  items: DeliveryItem[];
  notes?: string;
  photoUrl?: string;
  status: string;
}

export default function DeliveryPage() {
  const params = useParams();
  const taskId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch task');
        }
        const data = await response.json();
        setTask(data);
        setNotes(data.notes || '');
        setPhotoUrl(data.photoUrl || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  // Toggle item completion
  const toggleItemCompletion = async (itemId: string, currentCompleted: boolean) => {
    try {
      const response = await fetch(
        `/api/tasks/${taskId}/items/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: !currentCompleted }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      // Update local state
      setTask((prevTask) => {
        if (!prevTask) return null;
        return {
          ...prevTask,
          items: prevTask.items.map((item) =>
            item.id === itemId ? { ...item, completed: !currentCompleted } : item
          ),
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  // Handle photo capture/selection
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local URL for preview
    const localUrl = URL.createObjectURL(file);
    setPhotoUrl(localUrl);

    // TODO: Upload file to server and get permanent URL
    // For now, we'll just store the local URL
  };

  // Handle notes update
  const handleUpdateNotes = async () => {
    if (!task) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      const updatedTask = await response.json();
      setTask(updatedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  // Handle completion (all items checked)
  const handleCompleteDelivery = async () => {
    if (!task) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          photoUrl: photoUrl || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete delivery');
      }

      const updatedTask = await response.json();
      setTask(updatedTask);
      // TODO: Navigate to success screen
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete delivery');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!task) {
    return <div className="p-4">Task not found</div>;
  }

  const allItemsCompleted = task.items.length > 0 && task.items.every((item) => item.completed);
  const completedCount = task.items.filter((item) => item.completed).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
          {task.description && (
            <p className="text-gray-600 mt-2">{task.description}</p>
          )}
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-blue-600">
              {completedCount} / {task.items.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${task.items.length > 0 ? (completedCount / task.items.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Items to Deliver</h2>
          <div className="space-y-3">
            {task.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItemCompletion(item.id, item.completed)}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
                <label
                  className={`ml-3 cursor-pointer flex-1 ${
                    item.completed ? 'line-through text-gray-400' : 'text-gray-900'
                  }`}
                  onClick={() => toggleItemCompletion(item.id, item.completed)}
                >
                  {item.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Capture (Optional) */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo (Optional)</h2>
          <div className="flex flex-col gap-4">
            {photoUrl && (
              <div className="relative">
                <img
                  src={photoUrl}
                  alt="Delivery photo"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setPhotoUrl(null)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-600 font-medium"
            >
              {photoUrl ? 'Change Photo' : 'Capture / Upload Photo'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoCapture}
              className="hidden"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this delivery..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
          <button
            onClick={handleUpdateNotes}
            disabled={saving}
            className="mt-3 w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>

        {/* Complete Button */}
        <button
          onClick={handleCompleteDelivery}
          disabled={!allItemsCompleted || saving}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
            allItemsCompleted
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {saving ? 'Processing...' : 'Complete Delivery'}
        </button>

        {!allItemsCompleted && (
          <p className="text-center text-gray-500 text-sm mt-3">
            Complete all items to finish delivery
          </p>
        )}
      </div>
    </div>
  );
}
