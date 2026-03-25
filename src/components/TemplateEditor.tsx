import React, { useState } from 'react';
import { IDTemplate } from '../types';
import { Settings, Image as ImageIcon, Palette, Type, Calendar, Download, Upload as UploadIcon, Save, CheckCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite handles this import
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface TemplateEditorProps {
  template: IDTemplate;
  onChange: (template: IDTemplate) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onChange }) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleImageUpload = async (field: 'schoolLogo' | 'principalSignature' | 'backgroundImage' | 'backPartImage' | 'watermarkImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      try {
        const reader = new FileReader();
        reader.onload = async (evt) => {
          const typedarray = new Uint8Array(evt.target?.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          const page = await pdf.getPage(1);
          
          // Use very high scale for HD quality
          const viewport = page.getViewport({ scale: 6 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas: canvas
            }).promise;
            
            const imgData = canvas.toDataURL('image/png', 1.0);
            onChange({ ...template, [field]: imgData });
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (err) {
        console.error('PDF conversion failed:', err);
        alert('Failed to process PDF file. Please try an image instead.');
      }
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        onChange({ ...template, [field]: evt.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const handleSave = () => {
    setSaveStatus('saving');
    // The actual saving is handled by App.tsx useEffect, but we simulate a status here
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const exportTemplate = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "id_template.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        // Merge with current template to ensure all fields are present
        onChange({ ...template, ...imported });
      } catch (err) {
        alert('Invalid template file');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input to allow re-importing the same file
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">ID Card Template</h2>
              <p className="text-sm text-slate-500 font-medium">Customize the look and feel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg ${
                saveStatus === 'saved' 
                  ? 'bg-emerald-500 text-white shadow-emerald-100' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {saveStatus === 'saved' ? <CheckCircle size={20} /> : <Save size={20} />}
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save Changes'}
            </button>
            <div className="w-px h-8 bg-slate-200 mx-1" />
            <button 
              onClick={exportTemplate}
              className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Export Template"
            >
              <Download size={22} />
            </button>
            <label className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer" title="Import Template">
              <UploadIcon size={22} />
              <input type="file" className="hidden" accept=".json" onChange={importTemplate} />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">School Name</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={template.schoolName}
                  onChange={(e) => onChange({ ...template, schoolName: e.target.value })}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="Enter school name"
                />
                <div className="relative group">
                  <input 
                    type="color" 
                    value={template.schoolNameColor || '#ffffff'}
                    onChange={(e) => onChange({ ...template, schoolNameColor: e.target.value })}
                    className="h-[50px] w-[50px] rounded-2xl cursor-pointer border-2 border-slate-200 p-1 bg-white shadow-sm"
                    title="School Name Color"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Address</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={template.schoolAddress}
                  onChange={(e) => onChange({ ...template, schoolAddress: e.target.value })}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="Enter school address"
                />
                <div className="relative group">
                  <input 
                    type="color" 
                    value={template.schoolAddressColor || '#ffffff'}
                    onChange={(e) => onChange({ ...template, schoolAddressColor: e.target.value })}
                    className="h-[50px] w-[50px] rounded-2xl cursor-pointer border-2 border-slate-200 p-1 bg-white shadow-sm"
                    title="School Address Color"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 flex items-center gap-1">
                <Calendar size={12} /> Expiry Date (মেয়াদ)
              </label>
              <input 
                type="text" 
                value={template.expiryDate || ''}
                onChange={(e) => onChange({ ...template, expiryDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                placeholder="e.g. 31 Dec 2025"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Primary Theme Color</label>
              <div className="flex gap-3">
                <div className="relative group">
                  <input 
                    type="color" 
                    value={template.primaryColor}
                    onChange={(e) => onChange({ ...template, primaryColor: e.target.value })}
                    className="h-[50px] w-[50px] rounded-2xl cursor-pointer border-2 border-slate-200 p-1 bg-white shadow-sm"
                  />
                </div>
                <input 
                  type="text" 
                  value={template.primaryColor}
                  onChange={(e) => onChange({ ...template, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-sm uppercase"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Left Bar Text</label>
              <input 
                type="text" 
                value={template.leftBarText || ''}
                onChange={(e) => onChange({ ...template, leftBarText: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                placeholder="e.g. IDENTITY CARD"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Left Bar Color</label>
              <div className="flex gap-3">
                <div className="relative group">
                  <input 
                    type="color" 
                    value={template.leftBarColor || template.primaryColor}
                    onChange={(e) => onChange({ ...template, leftBarColor: e.target.value })}
                    className="h-[50px] w-[50px] rounded-2xl cursor-pointer border-2 border-slate-200 p-1 bg-white shadow-sm"
                  />
                </div>
                <input 
                  type="text" 
                  value={template.leftBarColor || template.primaryColor}
                  onChange={(e) => onChange({ ...template, leftBarColor: e.target.value })}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono text-sm uppercase"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Card Size (mm)</label>
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <input 
                    type="number" 
                    value={template.cardWidth}
                    onChange={(e) => onChange({ ...template, cardWidth: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Width</span>
                </div>
                <span className="text-slate-300 font-bold">×</span>
                <div className="flex-1 relative">
                  <input 
                    type="number" 
                    value={template.cardHeight}
                    onChange={(e) => onChange({ ...template, cardHeight: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">Height</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Front Background</label>
              <label className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all group">
                <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                  <ImageIcon size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" /> 
                  {template.backgroundImage ? 'Change Background' : 'Upload (IMG/PDF)'}
                </div>
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleImageUpload('backgroundImage', e)} />
                {template.backgroundImage && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      onChange({ ...template, backgroundImage: undefined });
                    }}
                    className="text-[10px] font-black text-red-500 uppercase tracking-wider hover:bg-red-50 px-2 py-1 rounded-md"
                  >
                    Remove
                  </button>
                )}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">School Logo</label>
              <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all group">
                {template.schoolLogo ? (
                  <div className="relative h-full p-4">
                    <img src={template.schoolLogo} alt="Logo" className="h-full object-contain" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={32} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Upload Logo</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload('schoolLogo', e)} />
              </label>
            </div>
            <div className="space-y-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Principal Signature</label>
              <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all group">
                {template.principalSignature ? (
                  <div className="relative h-full p-4">
                    <img src={template.principalSignature} alt="Signature" className="h-full object-contain" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={32} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Upload Signature</p>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload('principalSignature', e)} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Layout & Sizing Controls */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Layout & Sizing</h2>
            <p className="text-sm text-slate-500 font-medium">Fine-tune positions and sizes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {/* School Name & Address Size */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Name Size</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.schoolNameSize || 11}px</span>
              </div>
              <input 
                type="range" min="6" max="24" step="0.5"
                value={template.schoolNameSize || 11}
                onChange={(e) => onChange({ ...template, schoolNameSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">School Address Size</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.schoolAddressSize || 7}px</span>
              </div>
              <input 
                type="range" min="4" max="14" step="0.5"
                value={template.schoolAddressSize || 7}
                onChange={(e) => onChange({ ...template, schoolAddressSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Photo Position & Size */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo Position (Vertical)</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.photoTopOffset || -6}</span>
              </div>
              <input 
                type="range" min="-15" max="15" step="0.5"
                value={template.photoTopOffset || -6}
                onChange={(e) => onChange({ ...template, photoTopOffset: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo Size</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.photoSize || 24}px</span>
              </div>
              <input 
                type="range" min="10" max="100" step="1"
                value={template.photoSize || 24}
                onChange={(e) => onChange({ ...template, photoSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Student Info Position */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info Position (Vertical)</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.studentInfoTopOffset || 6}</span>
              </div>
              <input 
                type="range" min="0" max="25" step="0.5"
                value={template.studentInfoTopOffset || 6}
                onChange={(e) => onChange({ ...template, studentInfoTopOffset: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info Position (Horizontal)</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.studentInfoLeftOffset || 0}</span>
              </div>
              <input 
                type="range" min="-10" max="10" step="0.5"
                value={template.studentInfoLeftOffset || 0}
                onChange={(e) => onChange({ ...template, studentInfoLeftOffset: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info Font Size</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.studentInfoFontSize || 9}px</span>
              </div>
              <input 
                type="range" min="6" max="14" step="0.5"
                value={template.studentInfoFontSize || 9}
                onChange={(e) => onChange({ ...template, studentInfoFontSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Signature Position & Size */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signature Position</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.signatureTopOffset || 2}</span>
              </div>
              <input 
                type="range" min="0" max="15" step="0.5"
                value={template.signatureTopOffset || 2}
                onChange={(e) => onChange({ ...template, signatureTopOffset: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signature Size</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.signatureSize || 8}px</span>
              </div>
              <input 
                type="range" min="4" max="20" step="0.5"
                value={template.signatureSize || 8}
                onChange={(e) => onChange({ ...template, signatureSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Text Position</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.principalTextBottomOffset || 1}</span>
              </div>
              <input 
                type="range" min="0" max="10" step="0.5"
                value={template.principalTextBottomOffset || 1}
                onChange={(e) => onChange({ ...template, principalTextBottomOffset: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal Text Size</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.principalFontSize || 8}px</span>
              </div>
              <input 
                type="range" min="4" max="16" step="0.5"
                value={template.principalFontSize || 8}
                onChange={(e) => onChange({ ...template, principalFontSize: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Watermark Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Watermark Settings</h2>
            <p className="text-sm text-slate-500 font-medium">Add a background logo/watermark</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Watermark Image</label>
              <div className="flex items-center gap-4">
                {template.watermarkImage ? (
                  <div className="relative group">
                    <img 
                      src={template.watermarkImage} 
                      alt="Watermark" 
                      className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-slate-50 p-2"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => onChange({ ...template, watermarkImage: undefined })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group">
                    <UploadIcon size={20} className="text-slate-400 group-hover:text-indigo-600" />
                    <input 
                      type="file" accept="image/*,application/pdf" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload('watermarkImage', e)}
                    />
                  </label>
                )}
                <div className="flex-1">
                  <p className="text-xs text-slate-500 font-medium mb-2">Upload your school logo as a watermark</p>
                  <label className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    <UploadIcon size={14} className="mr-2" />
                    {template.watermarkImage ? 'Change Image' : 'Upload Image'}
                    <input 
                      type="file" accept="image/*,application/pdf" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload('watermarkImage', e)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Watermark Size</label>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.watermarkSize || 40}mm</span>
                </div>
                <input 
                  type="range" min="10" max="100" step="1"
                  value={template.watermarkSize || 40}
                  onChange={(e) => onChange({ ...template, watermarkSize: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Watermark Opacity</label>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{Math.round((template.watermarkOpacity || 0.1) * 100)}%</span>
                </div>
                <input 
                  type="range" min="0.01" max="1" step="0.01"
                  value={template.watermarkOpacity || 0.1}
                  onChange={(e) => onChange({ ...template, watermarkOpacity: Number(e.target.value) })}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Watermark Position (Vertical)</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.watermarkTopOffset || 0}</span>
              </div>
              <input 
                type="range" min="-50" max="50" step="0.5"
                value={template.watermarkTopOffset || 0}
                onChange={(e) => onChange({ ...template, watermarkTopOffset: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Watermark Position (Horizontal)</label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{template.watermarkLeftOffset || 0}</span>
              </div>
              <input 
                type="range" min="-30" max="30" step="0.5"
                value={template.watermarkLeftOffset || 0}
                onChange={(e) => onChange({ ...template, watermarkLeftOffset: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Back Part Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Palette size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Back Part Design</h2>
            <p className="text-sm text-slate-500 font-medium">Upload a sample image for the back side</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={template.showSchoolLogo !== false}
                  onChange={(e) => onChange({ ...template, showSchoolLogo: e.target.checked })}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                />
                <CheckCircle className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Show Logo</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={template.showSchoolName !== false}
                  onChange={(e) => onChange({ ...template, showSchoolName: e.target.checked })}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                />
                <CheckCircle className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Show Name</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={template.showSchoolAddress !== false}
                  onChange={(e) => onChange({ ...template, showSchoolAddress: e.target.checked })}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                />
                <CheckCircle className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Show Address</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={template.showLeftBarText !== false}
                  onChange={(e) => onChange({ ...template, showLeftBarText: e.target.checked })}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                />
                <CheckCircle className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Show Bar Text</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={template.includeBackPart || false}
                  onChange={(e) => onChange({ ...template, includeBackPart: e.target.checked })}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-indigo-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 transition-all"
                />
                <CheckCircle className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-black text-indigo-900 uppercase tracking-tight">Include Back Part in PDF</span>
            </label>
            
            {template.includeBackPart && (
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Back Part Count:</span>
                <input 
                  type="number" 
                  value={template.backPartPrintCount || 1}
                  onChange={(e) => onChange({ ...template, backPartPrintCount: Number(e.target.value) })}
                  className="w-20 px-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm font-bold text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-500/10"
                  min="1"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Back Part Image (Sample)</label>
            <label className="flex flex-col items-center justify-center w-full h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer hover:bg-indigo-50/30 hover:border-indigo-300 transition-all group overflow-hidden">
              {template.backPartImage ? (
                <div className="relative w-full h-full p-4">
                  <img src={template.backPartImage} alt="Back Part" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <div className="px-4 py-2 bg-white rounded-xl shadow-xl text-[10px] font-black text-indigo-600 uppercase tracking-widest">Click to Change</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                    <UploadIcon className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={32} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Back Part (Image/PDF)</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleImageUpload('backPartImage', e)} />
            </label>
            {template.backPartImage && (
              <button 
                onClick={() => onChange({ ...template, backPartImage: undefined })}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Remove Back Part Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
