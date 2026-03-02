import { useState, useCallback } from 'react';
import './styles.css';

interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MED' | 'HIGH';
  createdAt: number;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialColumns: Column[] = [
  {
    id: 'todo',
    title: 'BACKLOG',
    tasks: [
      { id: generateId(), title: 'DEFINE PROJECT SCOPE', priority: 'HIGH', createdAt: Date.now() - 100000 },
      { id: generateId(), title: 'RESEARCH COMPETITORS', priority: 'MED', createdAt: Date.now() - 90000 },
      { id: generateId(), title: 'CREATE WIREFRAMES', priority: 'LOW', createdAt: Date.now() - 80000 },
    ],
  },
  {
    id: 'progress',
    title: 'IN PROGRESS',
    tasks: [
      { id: generateId(), title: 'BUILD PROTOTYPE', priority: 'HIGH', createdAt: Date.now() - 70000 },
      { id: generateId(), title: 'USER INTERVIEWS', priority: 'MED', createdAt: Date.now() - 60000 },
    ],
  },
  {
    id: 'done',
    title: 'COMPLETE',
    tasks: [
      { id: generateId(), title: 'INITIAL PLANNING', priority: 'LOW', createdAt: Date.now() - 50000 },
    ],
  },
];

function App() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<{ task: Task; sourceColumnId: string } | null>(null);
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'LOW' | 'MED' | 'HIGH'>('MED');

  const handleDragStart = useCallback((task: Task, columnId: string) => {
    setDraggedTask({ task, sourceColumnId: columnId });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetColumnId: string) => {
    if (!draggedTask) return;

    const { task, sourceColumnId } = draggedTask;

    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    setColumns(prev => prev.map(col => {
      if (col.id === sourceColumnId) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== task.id) };
      }
      if (col.id === targetColumnId) {
        return { ...col, tasks: [...col.tasks, task] };
      }
      return col;
    }));

    setDraggedTask(null);
  }, [draggedTask]);

  const handleAddTask = (columnId: string) => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: generateId(),
      title: newTaskTitle.toUpperCase(),
      priority: newTaskPriority,
      createdAt: Date.now(),
    };

    setColumns(prev => prev.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, newTask] };
      }
      return col;
    }));

    setNewTaskTitle('');
    setNewTaskPriority('MED');
    setNewTaskColumn(null);
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    setColumns(prev => prev.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
      }
      return col;
    }));
  };

  const getPriorityLabel = (priority: 'LOW' | 'MED' | 'HIGH') => {
    switch (priority) {
      case 'HIGH': return '!!!';
      case 'MED': return '!!';
      case 'LOW': return '!';
    }
  };

  const totalTasks = columns.reduce((acc, col) => acc + col.tasks.length, 0);
  const completedTasks = columns.find(c => c.id === 'done')?.tasks.length || 0;

  return (
    <div className="min-h-screen bg-[#e8e4df] relative overflow-x-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* Header */}
      <header className="border-b-4 border-black bg-[#1a1a1a] relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-mono text-3xl md:text-5xl font-bold text-[#f5f2ed] tracking-tighter leading-none">
                KANBAN<span className="text-[#ff6b35]">_</span>BOARD
              </h1>
              <p className="font-mono text-xs md:text-sm text-[#888] mt-1 tracking-wider">
                TASK MANAGEMENT SYSTEM v1.0.0
              </p>
            </div>
            <div className="flex gap-4 md:gap-6 font-mono text-xs md:text-sm">
              <div className="border-2 border-[#444] bg-[#2a2a2a] px-3 md:px-4 py-2">
                <span className="text-[#888]">TOTAL:</span>{' '}
                <span className="text-[#f5f2ed] font-bold">{totalTasks}</span>
              </div>
              <div className="border-2 border-[#444] bg-[#2a2a2a] px-3 md:px-4 py-2">
                <span className="text-[#888]">DONE:</span>{' '}
                <span className="text-[#4ade80] font-bold">{completedTasks}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {columns.map((column, colIndex) => (
            <div
              key={column.id}
              className="column-container"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
              style={{ animationDelay: `${colIndex * 0.1}s` }}
            >
              {/* Column header */}
              <div className={`border-4 border-black p-3 md:p-4 ${
                column.id === 'todo' ? 'bg-[#fff9c4]' :
                column.id === 'progress' ? 'bg-[#ff6b35]' :
                'bg-[#4ade80]'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-sm md:text-base font-bold tracking-wider text-black">
                    [{column.title}]
                  </h2>
                  <span className="font-mono text-xs md:text-sm font-bold bg-black text-white px-2 py-1">
                    {column.tasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks container */}
              <div className="border-4 border-t-0 border-black bg-[#f5f2ed] min-h-[300px] md:min-h-[400px]">
                <div className="p-3 md:p-4 space-y-3">
                  {column.tasks.map((task, taskIndex) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task, column.id)}
                      className="task-card group"
                      style={{ animationDelay: `${(colIndex * 0.1) + (taskIndex * 0.05)}s` }}
                    >
                      <div className="border-3 border-black bg-white p-3 md:p-4 cursor-grab active:cursor-grabbing hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] transition-all duration-150">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-mono text-xs md:text-sm font-medium text-black leading-tight flex-1">
                            {task.title}
                          </p>
                          <button
                            onClick={() => handleDeleteTask(column.id, task.id)}
                            className="opacity-0 group-hover:opacity-100 font-mono text-xs bg-black text-white w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all"
                            aria-label="Delete task"
                          >
                            X
                          </button>
                        </div>
                        <div className="mt-2 md:mt-3 flex items-center justify-between">
                          <span className={`font-mono text-xs font-bold px-2 py-0.5 border-2 border-black ${
                            task.priority === 'HIGH' ? 'bg-red-500 text-white' :
                            task.priority === 'MED' ? 'bg-yellow-400 text-black' :
                            'bg-gray-300 text-black'
                          }`}>
                            {getPriorityLabel(task.priority)}
                          </span>
                          <span className="font-mono text-[10px] text-gray-500">
                            #{task.id.slice(0, 4).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add task form */}
                  {newTaskColumn === column.id ? (
                    <div className="border-3 border-black border-dashed bg-[#e8e4df] p-3 md:p-4 animate-fade-in">
                      <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="TASK DESCRIPTION..."
                        className="w-full font-mono text-xs md:text-sm bg-white border-2 border-black p-2 md:p-3 focus:outline-none focus:ring-2 focus:ring-[#ff6b35] placeholder:text-gray-400"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTask(column.id);
                          if (e.key === 'Escape') setNewTaskColumn(null);
                        }}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(['LOW', 'MED', 'HIGH'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => setNewTaskPriority(p)}
                            className={`font-mono text-xs px-2 md:px-3 py-1 border-2 border-black transition-all ${
                              newTaskPriority === p
                                ? p === 'HIGH' ? 'bg-red-500 text-white' :
                                  p === 'MED' ? 'bg-yellow-400 text-black' :
                                  'bg-gray-300 text-black'
                                : 'bg-white text-black hover:bg-gray-100'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleAddTask(column.id)}
                          className="flex-1 font-mono text-xs md:text-sm font-bold bg-black text-white py-2 md:py-3 hover:bg-[#ff6b35] transition-colors"
                        >
                          [ADD]
                        </button>
                        <button
                          onClick={() => setNewTaskColumn(null)}
                          className="font-mono text-xs md:text-sm font-bold bg-white text-black border-2 border-black px-3 md:px-4 py-2 md:py-3 hover:bg-gray-100 transition-colors"
                        >
                          [X]
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewTaskColumn(column.id)}
                      className="w-full font-mono text-xs md:text-sm font-bold text-gray-500 border-3 border-black border-dashed p-3 md:p-4 hover:border-solid hover:bg-white hover:text-black transition-all"
                    >
                      + ADD TASK
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 md:mt-12 border-4 border-black bg-[#1a1a1a] p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 font-mono text-xs md:text-sm text-[#888]">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 md:w-10 md:h-10 border-2 border-[#444] flex items-center justify-center text-[#f5f2ed]">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </span>
              <span>DRAG TO MOVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 md:w-10 md:h-10 border-2 border-[#444] flex items-center justify-center text-[#f5f2ed] font-bold">+</span>
              <span>CLICK TO ADD</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 md:w-10 md:h-10 border-2 border-[#444] flex items-center justify-center text-[#f5f2ed] font-bold">X</span>
              <span>HOVER TO DELETE</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-8 pb-6">
        <p className="text-center font-mono text-[10px] md:text-xs text-gray-500 tracking-wider">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export default App;
