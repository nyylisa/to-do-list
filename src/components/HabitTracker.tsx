import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Habit {
  id: string;
  name: string;
  color: string;
  streak: number;
  completedDates: string[];
  createdAt: number;
}

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitName, setHabitName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#1976D2');

  const habitColor = { primary: '#388E3C', light: '#E8F5E9', dark: '#1B5E20' };
  const colors = ['#1976D2', '#D32F2F', '#388E3C', '#F57C00', '#7B1FA2', '#0097A7'];

  // Load habits from Supabase
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setHabits(data.map((h: any) => ({
        id: h.id,
        name: h.name,
        color: h.color,
        streak: h.streak,
        completedDates: h.completed_dates || [],
        createdAt: new Date(h.created_at).getTime()
      })));
    }
  };

  const addHabit = async () => {
    if (habitName.trim() === '') return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newHabit = {
      user_id: user.id,
      name: habitName.trim(),
      color: selectedColor,
      streak: 0,
      completed_dates: [],
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('habits').insert([newHabit]);
    
    if (!error) {
      setHabitName('');
      loadHabits();
    }
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) loadHabits();
  };

  const toggleHabit = async (habitId: string, dateStr: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(dateStr);
    let newDates: string[];

    if (isCompleted) {
      newDates = habit.completedDates.filter(d => d !== dateStr);
    } else {
      newDates = [...habit.completedDates, dateStr];
    }

    // Update locally immediately (optimistic UI)
    setHabits(habits.map(h => 
      h.id === habitId ? { ...h, completedDates: newDates } : h
    ));

    // Update Supabase
    await supabase
      .from('habits')
      .update({ completed_dates: newDates })
      .eq('id', habitId);
  };

  // Helper to get last 7 days (Your original logic)
  const getDaysArray = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d,
        label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
        fullDate: d.toISOString().split('T')[0]
      });
    }
    return days;
  };

  const weekDays = getDaysArray();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ borderTop: '4px solid #388E3C' }}>
      <h3 className="text-2xl mb-6" style={{ color: '#1B5E20' }}>
        Habit Tracker
      </h3>

      {/* Add Habit Section */}
      <div className="space-y-4 mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder="Enter a new habit..."
            className="flex-1 px-4 py-3 rounded-lg border-2 outline-none transition-colors"
            style={{
              borderColor: '#388E3C',
              color: '#1B5E20',
            }}
          />
          <button
            onClick={addHabit}
            className="px-6 py-3 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#388E3C' }}
          >
            <Plus size={20} />
            Add
          </button>
        </div>

        {/* Color Selection */}
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full transition-transform ${
                selectedColor === color ? 'scale-110 ring-2 ring-offset-2 ring-gray-300' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#90A4AE' }}>
          <p className="text-lg">No habits being tracked. Start building one today!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="p-6 rounded-xl border transition-shadow hover:shadow-md"
              style={{ borderColor: habitColor.light }}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xl font-medium" style={{ color: habit.color }}>
                  {habit.name}
                </h4>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                  style={{ color: '#D32F2F' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const isCompleted = habit.completedDates.includes(day.fullDate);
                  const isToday = day.fullDate === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={day.fullDate}
                      onClick={() => toggleHabit(habit.id, day.fullDate)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 transition-all ${
                        isToday ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-60'
                      }`}
                      style={{
                        backgroundColor: isCompleted ? habit.color : habitColor.light,
                        border: isToday ? `3px solid ${habit.color}` : 'none',
                        boxShadow: isToday && isCompleted ? `0 4px 12px ${habit.color}40` : 'none',
                      }}
                    >
                      <span className="text-xs mb-1" style={{ color: isCompleted ? 'white' : habitColor.dark }}>
                        {day.label}
                      </span>
                      {isCompleted ? (
                        <Check size={20} color="white" />
                      ) : (
                        <X size={20} style={{ color: '#90A4AE' }} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 text-sm text-center px-4 py-2 rounded-lg" style={{ 
                backgroundColor: habitColor.light,
                color: habitColor.dark,
              }}>
                Total completions: <span style={{ color: habit.color }}>{habit.completedDates.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}