import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Student } from '../types';
import { User, Camera, Trash2, Edit2, X, Check, Plus, Users, Save } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  onUpdate: (student: Student) => void;
  onDelete: (id: string) => void;
}

export const StudentList: React.FC<StudentListProps & { onAdd?: (student: Student) => void }> = ({ students, onUpdate, onDelete, onAdd }) => {
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    name: '',
    studentId: '',
    class: '',
    roll: '',
    fatherName: '',
    motherName: '',
    address: '',
    phone: '',
    group: '',
    session: '',
    bloodGroup: '',
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd) {
      const student: Student = {
        ...newStudent as Student,
        id: Math.random().toString(36).substr(2, 9),
      };
      onAdd(student);
      setIsAdding(false);
      setNewStudent({
        name: '',
        studentId: '',
        class: '',
        roll: '',
        fatherName: '',
        motherName: '',
        address: '',
        phone: '',
        group: '',
        session: '',
        bloodGroup: '',
      });
    }
  };

  const handlePhotoUpload = (student: Student, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      onUpdate({ ...student, photo: evt.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      onUpdate(editingStudent);
      setEditingStudent(null);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Student Records</h2>
          <p className="text-sm text-slate-500 font-medium">Manage student information and photos</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-sm shadow-lg shadow-indigo-100 active:scale-95"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] uppercase tracking-[0.15em] text-slate-400 font-black">
              <th className="px-8 py-5">Photo</th>
              <th className="px-8 py-5">Student Info</th>
              <th className="px-8 py-5">Class/Roll</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                      <Users size={32} />
                    </div>
                    <p className="text-slate-400 font-medium italic">No students imported yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="relative group w-14 h-16">
                      <div className="w-full h-full rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-200">
                        {student.photo ? (
                          <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="text-slate-300" size={24} />
                        )}
                      </div>
                      <label className="absolute inset-0 flex items-center justify-center bg-indigo-600/60 opacity-0 group-hover:opacity-100 rounded-xl cursor-pointer transition-all duration-300 backdrop-blur-[2px]">
                        <Camera className="text-white" size={20} />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*" 
                          onChange={(e) => handlePhotoUpload(student, e)} 
                        />
                      </label>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-black text-slate-900 text-base">{student.name}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {student.studentId}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-md uppercase">Class {student.class}</span>
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-md uppercase">Roll {student.roll}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingStudent(student)}
                        className="p-2.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                        title="Edit Student"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button 
                        onClick={() => onDelete(student.id)}
                        className="p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                        title="Delete Student"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add New Student</h3>
                <p className="text-sm text-slate-500 font-medium">Enter the student details below</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Father's Name</label>
                  <input 
                    type="text" 
                    value={newStudent.fatherName}
                    onChange={(e) => setNewStudent({ ...newStudent, fatherName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="Father's name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Mother's Name</label>
                  <input 
                    type="text" 
                    value={newStudent.motherName}
                    onChange={(e) => setNewStudent({ ...newStudent, motherName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="Mother's name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Address</label>
                  <input 
                    type="text" 
                    value={newStudent.address}
                    onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Student ID</label>
                  <input 
                    type="text" 
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    placeholder="e.g. 2025001"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Class</label>
                    <input 
                      type="text" 
                      value={newStudent.class}
                      onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="Class"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Roll</label>
                    <input 
                      type="text" 
                      value={newStudent.roll}
                      onChange={(e) => setNewStudent({ ...newStudent, roll: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="Roll"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Group / Session</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={newStudent.group}
                      onChange={(e) => setNewStudent({ ...newStudent, group: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="Group"
                    />
                    <input 
                      type="text" 
                      value={newStudent.session}
                      onChange={(e) => setNewStudent({ ...newStudent, session: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="Session"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Mobile / Blood</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={newStudent.phone}
                      onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="Phone"
                    />
                    <input 
                      type="text" 
                      value={newStudent.bloodGroup}
                      onChange={(e) => setNewStudent({ ...newStudent, bloodGroup: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="Blood"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Student Photo</label>
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-200 border-dashed">
                    <div className="w-20 h-24 rounded-2xl bg-white overflow-hidden flex items-center justify-center border-2 border-white shadow-md ring-1 ring-slate-200 shrink-0">
                      {newStudent.photo ? (
                        <img src={newStudent.photo} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-slate-200" size={32} />
                      )}
                    </div>
                    <label className="flex-1 flex flex-col items-center justify-center h-24 bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                      <div className="flex flex-col items-center justify-center">
                        <Camera className="w-8 h-8 mb-1 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Click to upload photo</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              setNewStudent({ ...newStudent, photo: evt.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Plus size={20} />
                  Add Student
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Edit Student</h3>
                <p className="text-sm text-slate-500 font-medium">Update student information</p>
              </div>
              <button onClick={() => setEditingStudent(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Father's Name</label>
                  <input 
                    type="text" 
                    value={editingStudent.fatherName || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fatherName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Mother's Name</label>
                  <input 
                    type="text" 
                    value={editingStudent.motherName || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, motherName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Address</label>
                  <input 
                    type="text" 
                    value={editingStudent.address || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Student ID</label>
                  <input 
                    type="text" 
                    value={editingStudent.studentId}
                    onChange={(e) => setEditingStudent({ ...editingStudent, studentId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Class</label>
                    <input 
                      type="text" 
                      value={editingStudent.class}
                      onChange={(e) => setEditingStudent({ ...editingStudent, class: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Roll</label>
                    <input 
                      type="text" 
                      value={editingStudent.roll}
                      onChange={(e) => setEditingStudent({ ...editingStudent, roll: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Group / Session</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={editingStudent.group || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, group: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    />
                    <input 
                      type="text" 
                      value={editingStudent.session || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, session: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Mobile / Blood</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={editingStudent.phone || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="Phone"
                    />
                    <input 
                      type="text" 
                      value={editingStudent.bloodGroup || ''}
                      onChange={(e) => setEditingStudent({ ...editingStudent, bloodGroup: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="Blood"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Student Photo</label>
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-200 border-dashed">
                    <div className="w-20 h-24 rounded-2xl bg-white overflow-hidden flex items-center justify-center border-2 border-white shadow-md ring-1 ring-slate-200 shrink-0">
                      {editingStudent.photo ? (
                        <img src={editingStudent.photo} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="text-slate-200" size={32} />
                      )}
                    </div>
                    <label className="flex-1 flex flex-col items-center justify-center h-24 bg-white border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                      <div className="flex flex-col items-center justify-center">
                        <Camera className="w-8 h-8 mb-1 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Click to change photo</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              setEditingStudent({ ...editingStudent, photo: evt.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save size={20} />
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
