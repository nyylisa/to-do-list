import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';

type TimerMode = 'work' | 'break';

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [completedSessions, setCompletedSessions] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const pomodoroColor = { primary: '#D32F2F', light: '#FFEBEE', dark: '#B71C1C' };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 0) {
            setMinutes((prevMinutes) => {
              if (prevMinutes === 0) {
                // Timer finished
                handleTimerComplete();
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'work') {
      setCompletedSessions(prev => prev + 1);
      setMode('break');
      setMinutes(breakDuration);
      setSeconds(0);
      // Play notification sound or show alert
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Work session complete!', {
          body: 'Time for a break!',
        });
      }
    } else {
      setMode('work');
      setMinutes(workDuration);
      setSeconds(0);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break time over!', {
          body: 'Ready to focus again?',
        });
      }
    }
  };

  const toggleTimer = () => {
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(mode === 'work' ? workDuration : breakDuration);
    setSeconds(0);
  };

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setMinutes(newMode === 'work' ? workDuration : breakDuration);
    setSeconds(0);
  };

  const totalSeconds = minutes * 60 + seconds;
  const maxSeconds = (mode === 'work' ? workDuration : breakDuration) * 60;
  const progress = ((maxSeconds - totalSeconds) / maxSeconds) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8" style={{ borderTop: `4px solid ${pomodoroColor.primary}` }}>
        <h2 className="text-3xl text-center mb-6 bg-clip-text text-transparent" style={{ 
          backgroundImage: `linear-gradient(135deg, ${pomodoroColor.primary}, ${pomodoroColor.dark})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Pomodoro Timer
        </h2>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => switchMode('work')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all shadow-md ${
              mode === 'work' ? 'text-white' : ''
            }`}
            style={{
              background: mode === 'work' 
                ? `linear-gradient(135deg, ${pomodoroColor.primary}, ${pomodoroColor.dark})` 
                : pomodoroColor.light,
              color: mode === 'work' ? 'white' : pomodoroColor.dark,
            }}
          >
            <Brain size={20} />
            Work
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all shadow-md ${
              mode === 'break' ? 'text-white' : ''
            }`}
            style={{
              background: mode === 'break' 
                ? `linear-gradient(135deg, #0097A7, #006064)` 
                : '#E0F7FA',
              color: mode === 'break' ? 'white' : '#006064',
            }}
          >
            <Coffee size={20} />
            Break
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          {/* Progress Circle */}
          <svg className="w-full h-auto" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={pomodoroColor.light}
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={pomodoroColor.primary}
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          
          {/* Time Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2" style={{ color: pomodoroColor.dark }}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </div>
              <div className="text-lg" style={{ color: '#90A4AE' }}>
                {mode === 'work' ? 'Focus Time' : 'Break Time'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center mb-6">
          <button
            onClick={toggleTimer}
            className="flex items-center gap-2 px-8 py-4 rounded-lg text-white hover:opacity-90 transition-all shadow-lg"
            style={{ background: `linear-gradient(135deg, ${pomodoroColor.primary}, ${pomodoroColor.dark})` }}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-8 py-4 rounded-lg border-2 hover:bg-gray-50 transition-colors"
            style={{ borderColor: pomodoroColor.primary, color: pomodoroColor.dark }}
          >
            <RotateCcw size={24} />
            Reset
          </button>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg" style={{ backgroundColor: pomodoroColor.light }}>
          <div>
            <label className="block text-sm mb-2" style={{ color: pomodoroColor.dark }}>
              Work Duration (min)
            </label>
            <input
              type="number"
              value={workDuration}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setWorkDuration(val);
                if (mode === 'work' && !isRunning) {
                  setMinutes(val);
                  setSeconds(0);
                }
              }}
              min="1"
              max="60"
              className="w-full px-3 py-2 rounded-lg border-2 outline-none"
              style={{ borderColor: pomodoroColor.primary, color: pomodoroColor.dark }}
            />
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: pomodoroColor.dark }}>
              Break Duration (min)
            </label>
            <input
              type="number"
              value={breakDuration}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setBreakDuration(val);
                if (mode === 'break' && !isRunning) {
                  setMinutes(val);
                  setSeconds(0);
                }
              }}
              min="1"
              max="30"
              className="w-full px-3 py-2 rounded-lg border-2 outline-none"
              style={{ borderColor: pomodoroColor.primary, color: pomodoroColor.dark }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="text-center p-4 rounded-lg" style={{ 
          background: `linear-gradient(135deg, ${pomodoroColor.light}, white)`,
          border: `2px solid ${pomodoroColor.primary}`,
        }}>
          <p className="text-lg" style={{ color: pomodoroColor.dark }}>
            Completed Sessions Today: <span className="text-2xl" style={{ color: pomodoroColor.primary }}>{completedSessions}</span>
          </p>
        </div>
      </div>
    </div>
  );
}