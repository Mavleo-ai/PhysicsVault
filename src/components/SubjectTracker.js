"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, BookOpen, Plus, X } from "lucide-react";

export default function SubjectTracker({ studyData, onUpdate }) {
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");

  const subjects = studyData.subjects || [];

  const toggleChapter = (subjectId, chapter) => {
    const newData = { ...studyData };
    const subject = newData.subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    const idx = subject.completedChapters.indexOf(chapter);
    if (idx === -1) {
      subject.completedChapters.push(chapter);
      subject.chaptersCompleted = subject.completedChapters.length;
      // Award XP for chapter completion
      newData.stats.xp += 15;
    } else {
      subject.completedChapters.splice(idx, 1);
      subject.chaptersCompleted = subject.completedChapters.length;
    }

    onUpdate(newData);
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const newData = { ...studyData };
    const colors = ["#f43f5e", "#06b6d4", "#eab308", "#10b981", "#ec4899"];
    const icons = ["📚", "🔬", "💻", "🎯", "📊"];
    const idx = newData.subjects.length;

    newData.subjects.push({
      id: newSubjectName.toLowerCase().replace(/\s+/g, "_"),
      name: newSubjectName.trim(),
      color: colors[idx % colors.length],
      icon: icons[idx % icons.length],
      chaptersTotal: 0,
      chaptersCompleted: 0,
      hoursStudied: 0,
      chapters: [],
      completedChapters: [],
    });

    onUpdate(newData);
    setNewSubjectName("");
    setShowAddSubject(false);
  };

  const getProgressPercent = (subject) => {
    if (subject.chaptersTotal === 0) return 0;
    return Math.round((subject.chaptersCompleted / subject.chaptersTotal) * 100);
  };

  return (
    <div className="glass-panel border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/5">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.15em] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-orange-400" />
          SUBJECT TRACKER
        </span>
        <button
          onClick={() => setShowAddSubject(!showAddSubject)}
          className="text-[9px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1 border border-amber-500/20"
        >
          <Plus className="w-3 h-3" />
          ADD
        </button>
      </div>
 
      {/* Add Subject Input */}
      {showAddSubject && (
        <div className="flex gap-2 p-3 bg-white/3 border border-white/5 rounded-xl animate-in">
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
            placeholder="Subject name..."
            className="flex-1 bg-transparent text-xs text-white placeholder:text-zinc-600 outline-none font-mono"
            autoFocus
          />
          <button
            onClick={addSubject}
            className="px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg hover:bg-amber-500/30 transition-all cursor-pointer"
          >
            Add
          </button>
          <button
            onClick={() => setShowAddSubject(false)}
            className="p-1 text-zinc-500 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Subject List */}
      <div className="space-y-3">
        {subjects.map((subject) => {
          const isExpanded = expandedSubject === subject.id;
          const percent = getProgressPercent(subject);

          return (
            <div key={subject.id} className="space-y-2">
              {/* Subject Row */}
              <button
                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                className="w-full flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl transition-all cursor-pointer group"
              >
                <span className="text-lg">{subject.icon}</span>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white font-semibold">{subject.name}</span>
                    <span className="text-[10px] font-mono font-bold" style={{ color: subject.color }}>
                      {percent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percent}%`,
                        background: `linear-gradient(90deg, ${subject.color}, ${subject.color}88)`,
                        boxShadow: `0 0 8px ${subject.color}44`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {subject.chaptersCompleted}/{subject.chaptersTotal} chapters
                    </span>
                    <span className="text-[9px] text-zinc-600 font-mono">
                      {subject.hoursStudied}h studied
                    </span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                )}
              </button>

              {/* Expanded Chapter Checklist */}
              {isExpanded && subject.chapters.length > 0 && (
                <div className="ml-4 space-y-1 pl-4 border-l border-white/5">
                  {subject.chapters.map((chapter, idx) => {
                    const isCompleted = subject.completedChapters.includes(chapter);
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleChapter(subject.id, chapter)}
                        className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-left transition-all cursor-pointer ${
                          isCompleted
                            ? "bg-white/[0.02] text-zinc-500"
                            : "hover:bg-white/[0.03] text-zinc-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2
                            className="w-3.5 h-3.5 flex-shrink-0"
                            style={{ color: subject.color }}
                          />
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                        )}
                        <span
                          className={`text-[11px] font-medium ${
                            isCompleted ? "line-through opacity-50" : ""
                          }`}
                        >
                          {chapter}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
