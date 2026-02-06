"use client";

import { useState, useEffect } from "react";
import { engineService } from "@/engine/core/engineService";
import { Button, Card, Badge, GradientText } from "@/components/ui";
import { formatDuration } from "@/engine/utils/engineHelpers";

export default function MemoryPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadMemoryData();
  }, []);

  const loadMemoryData = () => {
    try {
      const allTasks = engineService.getTaskMemory();
      setTasks(allTasks.slice(0, 20)); // Show recent 20 tasks
      setStats(engineService.getMemoryStats());
    } catch (err) {
      console.error("Memory load error:", err);
    }
  };

  const clearMemory = () => {
    if (confirm("คุณแน่ใจหรือไม่ที่จะล้างข้อมูลทั้งหมด?")) {
      engineService.clearAllTasks();
      loadMemoryData();
      alert("ล้างข้อมูลสำเร็จ!");
    }
  };

  const exportMemory = () => {
    try {
      engineService.exportTasks();
      alert("Export ข้อมูลสำเร็จ!");
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการ Export");
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-20 pb-32 lg:pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
            <Badge variant="purple">💾 Neural Memory</Badge>
            <h1 className="text-5xl md:text-7xl font-black leading-none">
              <GradientText>TASK HISTORY</GradientText>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              บันทึกทุกการทำงานของ Engine
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={clearMemory}
              className="flex-1 md:flex-none"
            >
              🗑️ ล้างข้อมูล
            </Button>
            <Button
              variant="orange"
              size="lg"
              onClick={exportMemory}
              className="flex-1 md:flex-none"
            >
              📥 Export
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card
            gradient
            className="bg-linear-to-br from-orange-400 to-pink-500 text-center p-8 space-y-4"
          >
            <div className="text-5xl">📊</div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-90 mb-2">
                Total Tasks
              </p>
              <p className="text-4xl font-black">{stats?.total || 0}</p>
            </div>
          </Card>

          <Card
            gradient
            className="bg-linear-to-br from-purple-400 to-pink-500 text-center p-8 space-y-4"
          >
            <div className="text-5xl">✅</div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-90 mb-2">
                Success
              </p>
              <p className="text-4xl font-black">
                {stats?.byOutcome?.success || 0}
              </p>
            </div>
          </Card>

          <Card
            gradient
            className="bg-linear-to-br from-cyan-400 to-blue-500 text-center p-8 space-y-4"
          >
            <div className="text-5xl">📝</div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-90 mb-2">
                Categories
              </p>
              <p className="text-4xl font-black">
                {Object.keys(stats?.byCategory || {}).length}
              </p>
            </div>
          </Card>

          <Card
            gradient
            className="bg-linear-to-br from-green-400 to-cyan-500 text-center p-8 space-y-4"
          >
            <div className="text-5xl">⚡</div>
            <div>
              <p className="text-xs uppercase tracking-widest opacity-90 mb-2">
                Avg Speed
              </p>
              <p className="text-4xl font-black">
                {formatDuration(stats?.avgDuration || 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Task Timeline */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Timeline History
            </h3>
          </div>

          <div className="space-y-4">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <Card key={task.id} className="hover:shadow-2xl transition-all">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                        task.outcome === "success"
                          ? "bg-green-100 text-green-500"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {task.outcome === "success" ? "✓" : "✗"}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="orange">{task.category}</Badge>
                        <span className="text-xs text-slate-400 font-mono">
                          #{task.id.substring(0, 8)}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(task.createdAt).toLocaleString("th-TH")}
                        </span>
                      </div>

                      <h3 className="text-xl font-black">{task.goal}</h3>
                      <p className="text-slate-600">{task.summary}</p>

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-bold"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-right border-t md:border-t-0 md:border-l border-orange-100 pt-4 md:pt-0 md:pl-6">
                      <p className="text-xs text-slate-400 mb-2">Duration</p>
                      <p className="text-2xl font-black text-orange-500">
                        {formatDuration(task.durationMs || 0)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-20 text-center space-y-6">
                <div className="text-8xl opacity-30">📭</div>
                <div>
                  <p className="text-xl font-bold text-slate-600 mb-2">
                    ยังไม่มีข้อมูล
                  </p>
                  <p className="text-slate-400">
                    เริ่มสร้าง UI เพื่อบันทึกประวัติการทำงาน
                  </p>
                </div>
              </Card>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
