"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, Circle, ListTodo, Filter } from "lucide-react";

const PRIORITIES = {
  high: { label: "High", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
  medium: { label: "Med", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  low: { label: "Low", color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)" },
};

const FILTERS = ["all", "active", "completed"];

export default function TaskManager({ studyData, onUpdate }) {
  const [newTask, setNewTask] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newSubject, setNewSubject] = useState("");
  const [filter, setFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const tasks = studyData.tasks || [];

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const addTask = () => {
    if (!newTask.trim()) return;
    const newData = { ...studyData };
    newData.tasks = [
      {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        priority: newPriority,
        subject: newSubject,
        createdAt: new Date().toISOString(),
      },
      ...newData.tasks,
    ];
    onUpdate(newData);
    setNewTask("");
  };

  const toggleTask = (taskId) => {
    const newData = { ...studyData };
    const task = newData.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    if (task.completed) {
      task.completedAt = new Date().toISOString();
      newData.stats.xp += 10; // XP_REWARDS.TASK_COMPLETE
      newData.stats.tasksCompleted += 1;
    } else {
      // Undo completion
      delete task.completedAt;
      newData.stats.xp = Math.max(0, newData.stats.xp - 10);
      newData.stats.tasksCompleted = Math.max(0, newData.stats.tasksCompleted - 1);
    }

    onUpdate(newData);
  };

  const deleteTask = (taskId) => {
    const newData = { ...studyData };
    newData.tasks = newData.tasks.filter((t) => t.id !== taskId);
    onUpdate(newData);
    setDeletingId(null);
  };

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-5 space-y-4 flex flex-col" style={{ maxHeight: "520px" }}>
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-violet-400" />
          TASK MANAGER
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {activeCount} active
          </span>
          <span className="text-[9px] font-mono text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
            {completedCount} done
          </span>
        </div>
      </div>

      {/* Add Task */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a task..."
            className="flex-1 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/30 transition-colors font-medium"
          />
          <button
            onClick={addTask}
            disabled={!newTask.trim()}
            className="px-3 py-2.5 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-400 hover:bg-violet-500/25 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Priority + Subject Row */}
        <div className="flex gap-2">
          {/* Priority Selector */}
          <div className="flex gap-1 bg-black/30 p-0.5 rounded-lg border border-white/5">
            {Object.entries(PRIORITIES).map(([key, p]) => (
              <button
                key={key}
                onClick={() => setNewPriority(key)}
                className={`px-2 py-1 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  newPriority === key
                    ? "text-white"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
                style={newPriority === key ? {
                  backgroundColor: p.bg,
                  color: p.color,
                  border: `1px solid ${p.color}33`,
                } : { border: "1px solid transparent" }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Subject Tag */}
          <select
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="flex-1 bg-black/30 border border-white/5 rounded-lg px-2 py-1 text-[9px] text-zinc-400 font-mono outline-none cursor-pointer"
          >
            <option value="">No subject</option>
            {studyData.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-black/30 p-0.5 rounded-lg border border-white/5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-2 py-1.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              filter === f
                ? "bg-white/5 text-white border border-white/10"
                : "text-zinc-600 hover:text-zinc-400 border border-transparent"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
            <ListTodo className="w-8 h-8 mb-2 opacity-30" />
            <span className="text-[10px] font-mono">
              {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
            </span>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const priority = PRIORITIES[task.priority] || PRIORITIES.medium;
            const subject = studyData.subjects.find((s) => s.id === task.subject);

            return (
              <div
                key={task.id}
                className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all group ${
                  task.completed
                    ? "bg-white/[0.01] border-white/[0.03] opacity-50"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 cursor-pointer flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-600 hover:text-zinc-400 transition-colors" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs font-medium block ${
                      task.completed
                        ? "line-through text-zinc-600"
                        : "text-zinc-200"
                    }`}
                  >
                    {task.text}
                  </span>
                  <div className="flex items-center gap-2 mt-1.5">
                    {/* Priority dot */}
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: priority.color }}
                    />
                    <span className="text-[8px] font-mono text-zinc-600 uppercase">
                      {priority.label}
                    </span>
                    {subject && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-[8px] font-mono" style={{ color: subject.color }}>
                          {subject.icon} {subject.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete */}
                {deletingId === task.id ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-[8px] font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded cursor-pointer hover:bg-red-500/20"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="text-[8px] font-mono text-zinc-500 bg-white/5 px-2 py-1 rounded cursor-pointer hover:bg-white/10"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all cursor-pointer flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
