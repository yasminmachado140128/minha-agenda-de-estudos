import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LayoutDashboard, 
  Plus, 
  Settings, 
  BookOpen, 
  Trash2, 
  Moon, 
  Sun,
  Timer as TimerIcon,
  ChevronRight,
  MoreVertical,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
type Priority = 'low' | 'medium' | 'high';
type Status = 'pending' | 'completed';
type TimerType = 'pomodoro' | 'shortBreak' | 'longBreak';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  subjectId: string;
  title: string;
  date: string;
  status: Status;
  priority: Priority;
}

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: 'Mathematics', color: '#3b82f6' },
  { id: '2', name: 'History', color: '#f59e0b' },
  { id: '3', name: 'Physics', color: '#10b981' },
];

const TIMER_CONFIGS: Record<TimerType, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export default function App() {
  // Persistence Utility
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  // State
  const [subjects, setSubjects] = useState<Subject[]>(() => getInitialState('subjects', DEFAULT_SUBJECTS));
  const [tasks, setTasks] = useState<Task[]>(() => getInitialState('tasks', []));
  const [isDarkMode, setIsDarkMode] = useState(() => getInitialState('darkMode', false));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'schedule' | 'timer'>('dashboard');
  
  // Timer State
  const [timerType, setTimerType] = useState<TimerType>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(TIMER_CONFIGS.pomodoro);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      // Optional: Play sound or notification
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const switchTimer = (type: TimerType) => {
    setTimerType(type);
    setTimeLeft(TIMER_CONFIGS[type]);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // Actions
  const addTask = (task: Omit<Task, 'id'>) => {
    setTasks(prev => [...prev, { ...task, id: crypto.randomUUID() }]);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addSubject = (name: string, color: string) => {
    setSubjects(prev => [...prev, { id: crypto.randomUUID(), name, color }]);
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTasks(prev => prev.filter(t => t.subjectId !== id));
  };

  // Derived Stats
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.length - completed;
    const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    return { completed, pending, completionRate };
  }, [tasks]);

  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 transition-colors duration-300 font-sans`}>
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 w-full lg:top-0 lg:left-0 lg:w-64 lg:h-full bg-white dark:bg-neutral-900 border-t lg:border-t-0 lg:border-r border-neutral-200 dark:border-neutral-800 z-50">
        <div className="p-6 hidden lg:block">
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            StudyPlan
          </h1>
        </div>

        <div className="flex lg:flex-col justify-around lg:justify-start lg:gap-2 p-4 lg:p-6">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<Calendar size={20} />} label="Schedule" />
          <NavButton active={activeTab === 'subjects'} onClick={() => setActiveTab('subjects')} icon={<BookOpen size={20} />} label="Subjects" />
          <NavButton active={activeTab === 'timer'} onClick={() => setActiveTab('timer')} icon={<TimerIcon size={20} />} label="Focus" />
          
          <div className="lg:mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="hidden lg:block font-medium">Theme</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-24 lg:pb-0 lg:pl-64 min-h-screen">
        <div className="max-w-5xl mx-auto p-6 lg:p-12">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <header>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back, Student</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">Track your progress and stay on top of your studies.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard label="Tasks Done" value={stats.completed} icon={<CheckCircle2 className="text-green-500" />} />
                  <StatCard label="Pending" value={stats.pending} icon={<Clock className="text-amber-500" />} />
                  <StatCard label="Completion" value={`${stats.completionRate}%`} icon={<BarChart3 className="text-indigo-500" />} />
                </div>

                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    Recent Tasks
                  </h3>
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        subject={subjects.find(s => s.id === task.subjectId)}
                        onToggle={() => toggleTaskStatus(task.id)}
                        onDelete={() => deleteTask(task.id)}
                      />
                    ))}
                    {tasks.length === 0 && <p className="text-neutral-500 italic p-8 text-center bg-neutral-100 dark:bg-neutral-900 rounded-2xl">No tasks yet. Start by adding one to your schedule!</p>}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div 
                key="schedule"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
                  <AddTaskModal subjects={subjects} onAdd={addTask} />
                </div>
                <div className="space-y-3">
                  {tasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      subject={subjects.find(s => s.id === task.subjectId)}
                      onToggle={() => toggleTaskStatus(task.id)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'timer' && (
              <motion.div 
                key="timer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center min-h-[60vh] space-y-12"
              >
                <div className="flex gap-4 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-full">
                  {(['pomodoro', 'shortBreak', 'longBreak'] as TimerType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => switchTimer(type)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${timerType === type ? 'bg-white dark:bg-neutral-800 shadow-sm' : 'text-neutral-500'}`}
                    >
                      {type.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  ))}
                </div>

                <div className="relative group">
                  <div className="absolute -inset-8 bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl rounded-full transition-opacity group-hover:opacity-100 opacity-50" />
                  <div className="relative text-[10rem] font-mono leading-none tracking-tighter tabular-nums flex flex-col items-center">
                    {formatTime(timeLeft)}
                  </div>
                </div>

                <div className="flex gap-6">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all ${isTimerRunning ? 'bg-neutral-200 dark:bg-neutral-800' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'}`}
                  >
                    {isTimerRunning ? 'Pause' : 'Start Focus Session'}
                  </button>
                  <button
                    onClick={() => { setIsTimerRunning(false); setTimeLeft(TIMER_CONFIGS[timerType]); }}
                    className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'subjects' && (
              <motion.div 
                key="subjects"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold tracking-tight">Subjects</h2>
                  <AddSubjectModal onAdd={addSubject} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map(subject => (
                    <div key={subject.id} className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                        <h4 className="font-semibold text-lg">{subject.name}</h4>
                      </div>
                      <button 
                        onClick={() => deleteSubject(subject.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Components
function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        active 
          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
          : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
      }`}
    >
      {icon}
      <span className="hidden lg:block font-medium">{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function TaskItem({ task, subject, onToggle, onDelete }: { task: Task; subject?: Subject; onToggle: () => void; onDelete: () => void; key?: string }) {
  return (
    <div className="group flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggle}
          className={`w-6 h-6 rounded-full border-2 transition-colors flex items-center justify-center ${
            task.status === 'completed' 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-neutral-300 dark:border-neutral-700'
          }`}
        >
          {task.status === 'completed' && <CheckCircle2 size={14} />}
        </button>
        <div>
          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-neutral-400' : ''}`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-3 mt-1 underline-offset-4">
            {subject && (
              <span className="text-xs flex items-center gap-1 font-medium" style={{ color: subject.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
                {subject.name}
              </span>
            )}
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={10} />
              {new Date(task.date).toLocaleDateString()}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
      </div>
      <button 
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-2 text-neutral-400 hover:text-red-500 transition-all"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const colors = {
    low: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
    medium: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    high: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
  };
  return (
    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${colors[priority]}`}>
      {priority}
    </span>
  );
}

function AddTaskModal({ subjects, onAdd }: { subjects: Subject[]; onAdd: (task: Omit<Task, 'id'>) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAdd({ title, subjectId, priority, date, status: 'pending' });
    setIsOpen(false);
    setTitle('');
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
      <Plus size={18} /> Add Task
    </button>
  );

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.form 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-neutral-900 p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6"
      >
        <h3 className="text-xl font-bold">New Task</h3>
        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <label className="font-bold text-neutral-400 uppercase text-[10px] tracking-widest">Title</label>
            <input 
              autoFocus
              className="w-full bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
              value={title} onChange={e => setTitle(e.target.value)} placeholder="What are we studying?"
            />
          </div>
          <div className="space-y-2">
            <label className="font-bold text-neutral-400 uppercase text-[10px] tracking-widest">Subject</label>
            <select 
              className="w-full bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
              value={subjectId} onChange={e => setSubjectId(e.target.value)}
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-bold text-neutral-400 uppercase text-[10px] tracking-widest">Priority</label>
              <select 
                className="w-full bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
                value={priority} onChange={e => setPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-bold text-neutral-400 uppercase text-[10px] tracking-widest">Date</label>
              <input 
                type="date"
                className="w-full bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
                value={date} onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => setIsOpen(false)} className="flex-1 p-3 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">Cancel</button>
          <button type="submit" className="flex-1 p-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700">Creation</button>
        </div>
      </motion.form>
    </div>
  );
}

function AddSubjectModal({ onAdd }: { onAdd: (name: string, color: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#ef4444', '#8b5cf6', '#06b6d4'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd(name, color);
    setIsOpen(false);
    setName('');
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white rounded-xl font-medium transition-colors">
      <Plus size={18} /> New Subject
    </button>
  );

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.form 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-neutral-900 p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6"
      >
        <h3 className="text-xl font-bold">Add Subject</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-bold text-neutral-400 uppercase text-[10px] tracking-widest">Name</label>
            <input 
              autoFocus
              className="w-full bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl focus:ring-2 ring-indigo-500 outline-none"
              value={name} onChange={e => setName(e.target.value)} placeholder="Biology, Art, etc"
            />
          </div>
          <div className="space-y-2">
            <label className="font-bold text-neutral-400 uppercase text-[10px] tracking-widest">Color</label>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => setIsOpen(false)} className="flex-1 p-3 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">Cancel</button>
          <button type="submit" className="flex-1 p-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700">Add</button>
        </div>
      </motion.form>
    </div>
  );
}
