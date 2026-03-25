import React, { useState, useEffect, useRef } from 'react';
import { Student, IDTemplate } from './types';
import { IDCard, IDCardBack } from './components/IDCard';
import { ExcelImport } from './components/ExcelImport';
import { TemplateEditor } from './components/TemplateEditor';
import { StudentList } from './components/StudentList';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, Download, Trash2, Plus, Layout, Users, Settings as SettingsIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_TEMPLATE: IDTemplate = {
  schoolName: 'বরইতলী উচ্চ বিদ্যালয়',
  schoolAddress: 'বরইতলী,চকরিয়া।',
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  textColor: '#ffffff',
  schoolNameColor: '#ffffff',
  schoolAddressColor: '#ffffff',
  leftBarText: 'IDENTITY CARD',
  leftBarColor: '#1e40af',
  cardWidth: 53.975,
  cardHeight: 85.725,
  includeBackPart: false,
  backPartPrintCount: 1,
  showSchoolName: true,
  showSchoolAddress: true,
  showSchoolLogo: true,
  showLeftBarText: true,
  schoolNameSize: 11,
  schoolAddressSize: 7,
  photoTopOffset: -6,
  photoSize: 24,
  studentInfoTopOffset: 6,
  studentInfoLeftOffset: 0,
  studentInfoFontSize: 9,
  signatureTopOffset: 2,
  signatureSize: 8,
  principalTextBottomOffset: 1,
  principalFontSize: 8,
  watermarkSize: 40,
  watermarkOpacity: 0.1,
  watermarkTopOffset: 0,
  watermarkLeftOffset: 0,
};

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [template, setTemplate] = useState<IDTemplate>(DEFAULT_TEMPLATE);
  const [activeTab, setActiveTab] = useState<'students' | 'template' | 'preview'>('students');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackgroundOnly, setIsBackgroundOnly] = useState(false);
  const [backgroundPrintCount, setBackgroundPrintCount] = useState(10);
  const printRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const savedStudents = localStorage.getItem('id_maker_students');
    const savedTemplate = localStorage.getItem('id_maker_template');
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    else {
      // Initial sample data
      setStudents([{
        id: '1',
        name: 'জান্নাতুল ফেরদৌস রেশমি',
        fatherName: 'মোঃ মিনার',
        motherName: 'আয়েশা বেগম',
        address: 'চাঁদের বাপের পাড়া, বরইতলী',
        studentId: '২০২৫৬৪৮',
        class: '১০',
        roll: '৪৮',
        group: 'বিজ্ঞান',
        session: '২০২৩-২০২৪',
        phone: '০১৮৮১-৩৭৪৫৬',
        bloodGroup: 'A+'
      }]);
    }
    if (savedTemplate) setTemplate(JSON.parse(savedTemplate));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('id_maker_students', JSON.stringify(students));
    localStorage.setItem('id_maker_template', JSON.stringify(template));
  }, [students, template]);

  const handleImport = (newStudents: Student[]) => {
    setStudents([...students, ...newStudents]);
    setActiveTab('students');
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all student records?')) {
      setStudents([]);
    }
  };

  const generatePDF = async () => {
    if (!isBackgroundOnly && students.length === 0) return;
    setIsGenerating(true);

    // Wait for fonts to be fully loaded
    try {
      if ('fonts' in document) {
        await document.fonts.ready;
      }
    } catch (e) {
      console.warn('Font loading check failed, proceeding anyway');
    }

    // Small delay to ensure all cards in the hidden container are rendered
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = 297;
      const pageHeight = 210;
      
      // Portrait ID card size: 2.125 x 3.375 inches
      const cardW = template.cardWidth || 53.975;
      const cardH = template.cardHeight || 85.725;
      const includeBack = template.includeBackPart;
      const backCount = template.backPartPrintCount || 1;

      // Force 5x2 grid for 10 cards per page in landscape
      const cols = 5;
      const rows = 2;
      const perPage = 10;
      
      const horizontalGap = 2;
      const verticalGap = 5;
      
      // Calculate centering
      const totalWidth = cols * cardW + (cols - 1) * horizontalGap;
      const totalHeight = rows * cardH + (rows - 1) * verticalGap;
      const startX = (pageWidth - totalWidth) / 2;
      const startY = (pageHeight - totalHeight) / 2;

      // Create a list of all cards to print (front and optionally back)
      const allCards: { student?: Student; type: 'front' | 'back'; isBackgroundOnly?: boolean }[] = [];
      
      if (isBackgroundOnly) {
        for (let k = 0; k < backgroundPrintCount; k++) {
          allCards.push({ type: 'front', isBackgroundOnly: true });
          if (includeBack) {
            for (let b = 0; b < backCount; b++) {
              allCards.push({ type: 'back', isBackgroundOnly: true });
            }
          }
        }
      } else {
        students.forEach(student => {
          allCards.push({ student, type: 'front' });
          if (includeBack) {
            for (let k = 0; k < backCount; k++) {
              allCards.push({ student, type: 'back' });
            }
          }
        });
      }

      for (let i = 0; i < allCards.length; i += perPage) {
        if (i > 0) pdf.addPage();

        const pageCards = allCards.slice(i, i + perPage);
        
        for (let j = 0; j < pageCards.length; j++) {
          const cardInfo = pageCards[j];
          const col = j % cols;
          const row = Math.floor(j / cols);

          const x = startX + col * (cardW + horizontalGap);
          const y = startY + row * (cardH + verticalGap);

          let cardId = '';
          if (cardInfo.isBackgroundOnly) {
            cardId = cardInfo.type === 'front' ? 'print-bg-front' : 'print-bg-back';
          } else if (cardInfo.student) {
            cardId = cardInfo.type === 'front' ? `print-card-${cardInfo.student.id}` : `print-card-back-${cardInfo.student.id}`;
          }
          
          const cardEl = document.getElementById(cardId);
          
          if (cardEl) {
            const canvas = await html2canvas(cardEl, {
              scale: 6, // Very high scale for professional print quality
              useCORS: true,
              logging: false,
              backgroundColor: null,
              imageTimeout: 0,
            });
            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', x, y, cardW, cardH, undefined, 'NONE');
          }
        }
      }

      pdf.save(isBackgroundOnly ? 'id_card_backgrounds.pdf' : 'student_id_cards.pdf');
    } catch (error) {
      console.error('PDF Generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* Sidebar / Navigation */}
      <nav className="fixed top-0 left-0 h-full w-24 bg-white border-r border-slate-200 flex flex-col items-center py-10 gap-10 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-6 transform hover:rotate-6 transition-transform cursor-pointer">
          <FileText size={32} />
        </div>
        
        <div className="flex flex-col gap-4 w-full px-4">
          <button 
            onClick={() => setActiveTab('students')}
            className={`group relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            title="Students"
          >
            <Users size={24} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Students</span>
            {activeTab === 'students' && (
              <motion.div layoutId="activeTab" className="absolute -right-4 w-1 h-8 bg-indigo-600 rounded-l-full" />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('template')}
            className={`group relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${activeTab === 'template' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            title="Template"
          >
            <SettingsIcon size={24} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Design</span>
            {activeTab === 'template' && (
              <motion.div layoutId="activeTab" className="absolute -right-4 w-1 h-8 bg-indigo-600 rounded-l-full" />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('preview')}
            className={`group relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            title="Preview & Print"
          >
            <Layout size={24} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Preview</span>
            {activeTab === 'preview' && (
              <motion.div layoutId="activeTab" className="absolute -right-4 w-1 h-8 bg-indigo-600 rounded-l-full" />
            )}
          </button>
        </div>

        <div className="mt-auto pb-6">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
            <Users size={18} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-24 p-8 lg:p-12 max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md">v2.0</span>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">ID Card Maker</h1>
            </div>
            <p className="text-slate-500 font-medium">Professional identification system for educational institutions</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            {students.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Clear Data</span>
              </button>
            )}
            <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block" />
            <button 
              onClick={generatePDF}
              disabled={isGenerating || students.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 font-bold disabled:opacity-50 disabled:shadow-none whitespace-nowrap"
            >
              {isGenerating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download size={20} />
              )}
              {isGenerating ? 'Processing...' : 'Export PDF'}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'students' && (
            <motion.div 
              key="students"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-8">
                <ExcelImport onImport={handleImport} />
                
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Plus size={16} />
                    </div>
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-3xl font-black text-slate-900 leading-none mb-1">{students.length}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Students</div>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-3xl font-black text-slate-900 leading-none mb-1">{students.filter(s => s.photo).length}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">With Photo</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <StudentList 
                  students={students} 
                  onUpdate={handleUpdateStudent} 
                  onDelete={handleDeleteStudent} 
                  onAdd={(student) => setStudents([...students, student])}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'template' && (
            <motion.div 
              key="template"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-10"
            >
              <div className="xl:col-span-7">
                <TemplateEditor template={template} onChange={setTemplate} />
              </div>
              
              <div className="xl:col-span-5">
                <div className="sticky top-8 space-y-6">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-50 to-transparent" />
                    <p className="relative text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Real-time Preview</p>
                    
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-indigo-500/5 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <IDCard 
                        student={students[0] || { 
                          id: '1', 
                          name: 'জান্নাতুল ফেরদৌস রেশমি', 
                          fatherName: 'মোঃ মিনার',
                          motherName: 'আয়েশা বেগম',
                          address: 'চাঁদের বাপের পাড়া, বরইতলী',
                          studentId: '২০২৫৬৪৮', 
                          class: '১০', 
                          roll: '৪৮', 
                          group: 'বিজ্ঞান',
                          session: '২০২৩-২০২৪',
                          bloodGroup: 'A+'
                        }} 
                        template={template} 
                      />
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-4 w-full">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dimensions</p>
                        <p className="text-sm font-black text-slate-700">{template.cardWidth} x {template.cardHeight} mm</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Orientation</p>
                        <p className="text-sm font-black text-slate-700">Portrait</p>
                      </div>
                    </div>
                    
                    <p className="mt-8 text-sm text-slate-400 text-center font-medium leading-relaxed">
                      This is a live representation of your ID card. Changes to colors, logos, and layout will reflect here instantly.
                    </p>
                  </div>

                  <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                    <h4 className="text-lg font-bold mb-2">Pro Tip</h4>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      Use high-resolution PNG logos with transparent backgrounds for the best print quality.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="flex gap-5 text-slate-900">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <Printer className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest mb-1">Print Options</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Configure how you want to download your ID cards.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 items-center">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={isBackgroundOnly}
                        onChange={(e) => setIsBackgroundOnly(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      <span className="ml-3 text-sm font-bold text-slate-700">Print Background Only</span>
                    </label>
                  </div>

                  {isBackgroundOnly && (
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase ml-2">Copies:</span>
                      <input 
                        type="number" 
                        min="1" 
                        max="100"
                        value={backgroundPrintCount}
                        onChange={(e) => setBackgroundPrintCount(parseInt(e.target.value) || 1)}
                        className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {isBackgroundOnly ? (
                <div className="flex flex-col items-center gap-8 py-10">
                  <div className="flex flex-wrap justify-center gap-10">
                    <div className="flex flex-col items-center gap-3">
                      <IDCard 
                        student={students[0] || { id: '1', name: '', studentId: '', class: '' }} 
                        template={template} 
                        hideContent={true}
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Front Background</span>
                    </div>
                    {template.includeBackPart && (
                      <div className="flex flex-col items-center gap-3">
                        <IDCardBack 
                          student={students[0] || { id: '1', name: '', studentId: '', class: '' }} 
                          template={template} 
                          hideContent={true}
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Back Background</span>
                      </div>
                    )}
                  </div>
                  <div className="max-w-md text-center">
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                      You are in <strong>Background Only</strong> mode. This will generate a PDF with {backgroundPrintCount} copies of the blank ID card design.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {students.map(student => (
                    <React.Fragment key={student.id}>
                      <div className="flex flex-col items-center gap-2">
                        <IDCard 
                          student={student} 
                          template={template} 
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{student.name} (Front)</span>
                      </div>
                      {template.includeBackPart && (
                        <div className="flex flex-col items-center gap-2">
                          <IDCardBack 
                            student={student} 
                            template={template} 
                          />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{student.name} (Back)</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className="flex justify-center pt-10">
                <button 
                  onClick={generatePDF}
                  disabled={isGenerating || (!isBackgroundOnly && students.length === 0)}
                  className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 font-bold disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download size={24} />
                  )}
                  {isGenerating ? 'Generating PDF...' : isBackgroundOnly ? `Download ${backgroundPrintCount} Backgrounds (PDF)` : 'Download All ID Cards (PDF)'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Hidden container for high-quality capture */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        {/* Background only cards */}
        <IDCard 
          id="print-bg-front"
          student={students[0] || { id: '1', name: '', studentId: '', class: '' }} 
          template={template} 
          hideContent={true}
        />
        <IDCardBack 
          id="print-bg-back"
          student={students[0] || { id: '1', name: '', studentId: '', class: '' }} 
          template={template} 
          hideContent={true}
        />

        {students.map(student => (
          <React.Fragment key={`hidden-frag-${student.id}`}>
            <IDCard 
              key={`hidden-front-${student.id}`}
              id={`print-card-${student.id}`}
              student={student} 
              template={template} 
            />
            <IDCardBack 
              key={`hidden-back-${student.id}`}
              id={`print-card-back-${student.id}`}
              student={student} 
              template={template} 
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
