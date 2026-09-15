import React, { useState } from 'react';
import { useSaanjh } from '../context/SaanjhContext';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  Kanban,
  List,
  Filter,
  Trash2,
  CheckCircle2,
  Calendar,
  User,
} from 'lucide-react';
import { Task } from '../types';

export const TasksPage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, events, activeEvent, setActiveEventId } = useSaanjh();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    eventId: activeEvent?.id || (events.length > 0 ? events[0].id : 'evt-demo-001'),
    department: 'Production',
    functionName: '',
    priority: 'HIGH',
    status: 'NOT_STARTED',
    owner: 'Ayush Mishra (Owner)',
    deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    notes: '',
  });

  const selectedEventForModal = events.find((e) => e.id === formData.eventId) || activeEvent;

  const departments = [
    'ALL',
    'Production',
    'Creative & Décor',
    'Catering & Khansamas',
    'Hospitality & Butlers',
    'Wardrobe & Styling',
    'Legal & Permissions',
  ];

  const filteredTasks = useMemo(() => {
    if (!activeEvent) return [];
    return tasks.filter((t) => {
      // Must match active event strictly
      if (t.eventId !== activeEvent.id) return false;
      // Demo tasks only belong to demo event
      if (!activeEvent.isDemo && t.isDemo) return false;
      if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
      if (filterDepartment !== 'ALL' && t.department !== filterDepartment) return false;
      return true;
    });
  }, [tasks, activeEvent, filterPriority, filterDepartment]);

  const kanbanStatuses: Task['status'][] = [
    'NOT_STARTED',
    'IN_PROGRESS',
    'WAITING_VENDOR',
    'WAITING_CLIENT',
    'APPROVAL',
    'DONE',
  ];

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const chosenEvt = events.find((e) => e.id === formData.eventId) || activeEvent;

    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      eventId: chosenEvt?.id || 'evt-demo-001',
      eventName: chosenEvt?.clientName || 'Royal Wedding',
      functionName: formData.functionName || 'General Celebration Duty',
      department: formData.department || 'Production',
      title: formData.title,
      owner: formData.owner || 'Ayush Mishra (Owner)',
      priority: (formData.priority as any) || 'HIGH',
      deadline: formData.deadline || new Date().toISOString().split('T')[0],
      status: (formData.status as any) || 'NOT_STARTED',
      notes: formData.notes || '',
      createdAt: new Date().toISOString(),
      isDemo: Boolean(chosenEvt?.isDemo),
    };

    addTask(newTask);
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      eventId: activeEvent?.id || (events.length > 0 ? events[0].id : 'evt-demo-001'),
      department: 'Production',
      functionName: '',
      priority: 'HIGH',
      status: 'NOT_STARTED',
      owner: 'Ayush Mishra (Owner)',
      deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
            Operational Task Force
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3B0D11]">
            Event Execution Matrix
          </h1>
          <p className="text-xs text-[#706E6B] mt-0.5">
            {tasks.filter((t) => t.status !== 'DONE').length} active operational duties assigned across departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="bg-[#F5F1E8] border border-[#DFD7C2] rounded-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#3B0D11] text-[#FBF9F5]'
                  : 'text-[#706E6B] hover:text-[#3B0D11]'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-[#3B0D11] text-[#FBF9F5]'
                  : 'text-[#706E6B] hover:text-[#3B0D11]'
              }`}
              title="Kanban Board"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#3B0D11] hover:bg-[#4A151B] text-[#FBF9F5] rounded-lg text-xs font-serif font-semibold flex items-center gap-1.5 border border-[#C5A059]/40 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-[#E6CA65]" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#FBF9F5] p-3 rounded-xl border border-[#DFD7C2]">
        <div className="flex items-center gap-2">
          <span className="text-[#706E6B] font-semibold uppercase text-[10px]">Celebration:</span>
          <select
            value={activeEvent?.id || ''}
            onChange={(e) => setActiveEventId(e.target.value)}
            className="bg-[#F5F1E8] border border-[#DFD7C2] text-[#3B0D11] rounded-md px-2.5 py-1 text-xs font-serif font-bold focus:outline-hidden cursor-pointer"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.clientName} (Slot {evt.commissionSlot}) - {evt.city}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          <span className="text-[#706E6B] font-semibold uppercase text-[10px]">Department:</span>
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDepartment(d)}
              className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                filterDepartment === d
                  ? 'bg-[#3B0D11] text-[#FBF9F5] font-semibold'
                  : 'bg-[#F5F1E8] text-[#706E6B] hover:bg-[#EAE3D2]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-[#FBF9F5] border-2 border-dashed border-[#DFD7C2] rounded-2xl p-12 text-center space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#3B0D11]">
            No tasks created yet for this event.
          </h3>
          <p className="text-xs text-[#706E6B] max-w-md mx-auto">
            No operational tasks have been scheduled for {activeEvent?.clientName || 'this celebration'} yet. Click &quot;Create Task&quot; above to schedule run-of-show or vendor deliverables.
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="bg-[#FBF9F5] border border-[#DFD7C2] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F1E8] text-[#3B0D11] font-serif uppercase tracking-wider text-[10px] border-b border-[#DFD7C2]">
                <tr>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Priority</th>
                  <th className="py-3 px-4 font-bold">Task Title & Scope</th>
                  <th className="py-3 px-4 font-bold">Department</th>
                  <th className="py-3 px-4 font-bold">Owner</th>
                  <th className="py-3 px-4 font-bold">Deadline</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFD7C2]">
                {filteredTasks.map((task) => {
                  const isDone = task.status === 'DONE';
                  const priorityBg =
                    task.priority === 'CRITICAL'
                      ? 'bg-[#B87A81]/20 text-[#3B0D11]'
                      : task.priority === 'HIGH'
                      ? 'bg-[#C5A059]/20 text-[#3B0D11]'
                      : 'bg-[#1E382B]/10 text-[#1E382B]';

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-[#F5F1E8]/50 transition-colors ${
                        isDone ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTask(task.id, { status: e.target.value as any })
                          }
                          className="bg-[#F5F1E8] border border-[#DFD7C2] rounded-md px-2 py-1 text-[11px] font-medium"
                        >
                          <option value="NOT_STARTED">Not Started</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="WAITING_VENDOR">Waiting Vendor</option>
                          <option value="WAITING_CLIENT">Waiting Client</option>
                          <option value="APPROVAL">Approval</option>
                          <option value="DONE">Done</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-sm ${priorityBg}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-serif font-bold text-sm block ${
                            isDone ? 'line-through text-[#706E6B]' : 'text-[#3B0D11]'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] text-[#706E6B] block mt-0.5">
                          Function: {task.functionName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#555]">{task.department}</td>
                      <td className="py-3 px-4 font-medium text-[#3B0D11]">{task.owner}</td>
                      <td className="py-3 px-4 text-[#706E6B] font-mono">{task.deadline}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-[#706E6B] hover:text-[#B87A81] rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {kanbanStatuses.map((status) => {
            const statusTasks = filteredTasks.filter((t) => t.status === status);
            const statusLabels: Record<Task['status'], string> = {
              NOT_STARTED: 'Not Started',
              IN_PROGRESS: 'In Progress',
              WAITING: 'Waiting',
              WAITING_VENDOR: 'Waiting Vendor',
              WAITING_CLIENT: 'Waiting Client',
              APPROVAL: 'Approval',
              DONE: 'Done',
            };

            return (
              <div
                key={status}
                className="bg-[#F5F1E8] border border-[#DFD7C2] rounded-xl p-3 flex flex-col space-y-3 min-w-[220px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#DFD7C2]">
                  <span className="font-serif font-bold text-xs text-[#3B0D11] uppercase tracking-wider">
                    {statusLabels[status]}
                  </span>
                  <span className="text-[10px] bg-[#3B0D11]/10 px-1.5 py-0.2 rounded-full font-bold text-[#3B0D11]">
                    {statusTasks.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {statusTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-[#FBF9F5] border border-[#DFD7C2] rounded-lg text-xs space-y-2 shadow-2xs hover:border-[#C5A059] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] uppercase font-bold text-[#C5A059]">
                          {t.department}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-sm ${
                            t.priority === 'CRITICAL'
                              ? 'bg-[#B87A81]/20 text-[#3B0D11]'
                              : 'bg-[#C5A059]/20 text-[#3B0D11]'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <p className="font-serif font-bold text-[#3B0D11] text-xs leading-snug">
                        {t.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-[#706E6B] pt-1 border-t border-[#DFD7C2]">
                        <span>{(t.owner ?? 'Team').split(' ')[0] || 'Team'}</span>
                        <span>{t.deadline || 'Pending'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FBF9F5] border-2 border-[#C5A059] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#3B0D11] pb-2 border-b border-[#DFD7C2]">
              Assign Operational Duty
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Celebration</label>
                  <select
                    value={formData.eventId}
                    onChange={(e) => {
                      const chosen = events.find((ev) => ev.id === e.target.value);
                      setFormData({
                        ...formData,
                        eventId: e.target.value,
                        functionName: chosen?.functions?.[0]?.name || 'General Celebration Duty',
                      });
                    }}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 font-serif text-xs font-bold text-[#3B0D11]"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.clientName} (Slot {evt.commissionSlot})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Milestone / Function</label>
                  <select
                    value={formData.functionName}
                    onChange={(e) => setFormData({ ...formData, functionName: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2 text-xs"
                  >
                    <option value="General Celebration Duty">General Celebration Duty</option>
                    {selectedEventForModal?.functions?.map((fn) => (
                      <option key={fn.id} value={fn.name}>
                        Day {fn.dayNumber}: {fn.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  placeholder="e.g. Confirm acoustic barrier rental for venue sound curfew"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  >
                    {departments.filter((d) => d !== 'ALL').map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Assigned Owner</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Deadline Date</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-[#F5F1E8] border border-[#DFD7C2] rounded-md p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7C2]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#706E6B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3B0D11] text-[#FBF9F5] rounded-md font-serif text-xs font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
