import { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'shopping' | 'other';
  dueDate?: string;
}

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState<'work' | 'personal' | 'shopping' | 'other'>('personal');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  // 1. Load Tasks from Supabase
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database columns (snake_case) to your app (camelCase)
      const formattedTasks = (data || []).map((task: any) => ({
        id: task.id,
        text: task.text,
        completed: task.completed,
        createdAt: new Date(task.created_at).getTime(),
        priority: task.priority,
        category: task.category,
        dueDate: task.due_date || undefined,
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Add Task to Supabase
  const addTask = async () => {
    if (inputValue.trim() === '') return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please sign in to add tasks");
        return;
      }

      const newTask = {
        text: inputValue.trim(),
        completed: false,
        priority,
        category,
        due_date: dueDate || null,
        user_id: user.id,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('tasks').insert([newTask]);

      if (error) throw error;
      
      // Clear inputs and reload
      setInputValue('');
      setDueDate('');
      loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // 3. Toggle Completion
  const toggleTask = async (id: string, currentCompleted: boolean) => {
    // Optimistic Update (update UI instantly)
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !currentCompleted } : t));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentCompleted })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling task:', error);
      loadTasks(); // Revert on error
    }
  };

  // 4. Delete Task
  const deleteTask = async (id: string) => {
    // Optimistic Update
    setTasks(tasks.filter(t => t.id !== id));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      loadTasks();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#D32F2F';
      case 'medium': return '#F57C00';
      case 'low': return '#388E3C';
      default: return '#1976D2';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ borderTop: '4px solid #1976D2' }}>
      <h3 className="text-2xl mb-6" style={{ color: '#0D47A1' }}>
        My Tasks
      </h3>

      {/* Add Task Section */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a new task..."
            className="flex-1 px-4 py-3 rounded-lg border-2 outline-none transition-colors"
            style={{
              borderColor: '#1976D2',
              color: '#0D47A1',
            }}
          />
          <button
            onClick={addTask}
            className="px-6 py-3 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1976D2' }}
          >
            <Plus size={20} />
            Add
          </button>
        </div>

        {/* Priority, Category, and Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm mb-1" style={{ color: '#0D47A1' }}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-3 py-2 rounded-lg border-2 outline-none"
              style={{ borderColor: '#1976D2', color: '#0D47A1' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#0D47A1' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'work' | 'personal' | 'shopping' | 'other')}
              className="w-full px-3 py-2 rounded-lg border-2 outline-none"
              style={{ borderColor: '#1976D2', color: '#0D47A1' }}
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="shopping">Shopping</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#0D47A1' }}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 outline-none"
              style={{ borderColor: '#1976D2', color: '#0D47A1' }}
            />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all' ? 'text-white' : ''}`}
          style={{
            backgroundColor: filter === 'all' ? '#1976D2' : '#E3F2FD',
            color: filter === 'all' ? 'white' : '#0D47A1',
          }}
        >
          All ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'active' ? 'text-white' : ''}`}
          style={{
            backgroundColor: filter === 'active' ? '#1976D2' : '#E3F2FD',
            color: filter === 'active' ? 'white' : '#0D47A1',
          }}
        >
          Active ({tasks.filter(t => !t.completed).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg transition-colors ${filter === 'completed' ? 'text-white' : ''}`}
          style={{
            backgroundColor: filter === 'completed' ? '#1976D2' : '#E3F2FD',
            color: filter === 'completed' ? 'white' : '#0D47A1',
          }}
        >
          Completed ({tasks.filter(t => t.completed).length})
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12" style={{ color: '#90A4AE' }}>
            <p className="text-lg">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12" style={{ color: '#90A4AE' }}>
            <p className="text-lg">
              {filter === 'all' && 'No tasks yet. Add one to get started!'}
              {filter === 'active' && 'No active tasks. Great job!'}
              {filter === 'completed' && 'No completed tasks yet.'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-lg border transition-colors hover:shadow-md"
              style={{
                borderColor: task.completed ? '#90A4AE' : '#E3F2FD',
                backgroundColor: task.completed ? '#F5F5F5' : 'white',
                borderLeftWidth: '4px',
                borderLeftColor: getPriorityColor(task.priority),
              }}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id, task.completed)}
                  className="w-5 h-5 cursor-pointer accent-[#1976D2] mt-1"
                />

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`${task.completed ? 'line-through' : ''}`}
                      style={{
                        color: task.completed ? '#90A4AE' : '#0D47A1',
                      }}
                    >
                      {task.text}
                    </span>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0"
                      style={{ color: '#D32F2F' }}
                      aria-label="Delete task"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Task Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {/* Priority Badge */}
                    <span
                      className="px-2 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority.toUpperCase()}
                    </span>

                    {/* Category Badge */}
                    <span
                      className="px-2 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: '#1976D2' }}
                    >
                      {getCategoryLabel(task.category)}
                    </span>

                    {/* Due Date */}
                    {task.dueDate && (
                      <span
                        className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                          isOverdue(task.dueDate) && !task.completed ? 'text-white' : ''
                        }`}
                        style={{
                          backgroundColor: isOverdue(task.dueDate) && !task.completed ? '#D32F2F' : '#E3F2FD',
                          color: isOverdue(task.dueDate) && !task.completed ? 'white' : '#0D47A1',
                        }}
                      >
                        {isOverdue(task.dueDate) && !task.completed && <AlertCircle size={12} />}
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {tasks.length > 0 && (
        <div className="mt-6 pt-4 border-t flex justify-between" style={{ borderColor: '#E3F2FD', color: '#0D47A1' }}>
          <span>Total: {tasks.length}</span>
          <span>Completed: {tasks.filter(t => t.completed).length}</span>
          <span>Active: {tasks.filter(t => !t.completed).length}</span>
        </div>
      )}
    </div>
  );
}