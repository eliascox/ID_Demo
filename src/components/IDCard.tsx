import React, { useEffect, useRef, useState } from 'react';
import { Student, IDTemplate } from '../types';

interface AutoShrinkTextProps {
  text: string;
  maxFontSize: number;
  className?: string;
  style?: React.CSSProperties;
}

const AutoShrinkText: React.FC<AutoShrinkTextProps> = ({ text, maxFontSize, className, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxFontSize);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    let currentFontSize = maxFontSize;
    textRef.current.style.fontSize = `${currentFontSize}px`;

    while (textRef.current.offsetWidth > containerWidth && currentFontSize > 4) {
      currentFontSize -= 0.5;
      textRef.current.style.fontSize = `${currentFontSize}px`;
    }
    setFontSize(currentFontSize);
  }, [text, maxFontSize]);

  return (
    <div ref={containerRef} className={`w-full whitespace-nowrap px-0.5 ${className}`} style={style}>
      <span ref={textRef} style={{ fontSize: `${fontSize}px`, display: 'inline-block', lineHeight: '1.2' }}>{text}</span>
    </div>
  );
};

interface IDCardProps {
  student: Student;
  template: IDTemplate;
  id?: string;
  hideContent?: boolean;
}

export const IDCard: React.FC<IDCardProps> = ({ student, template, id, hideContent }) => {
  const cardStyle: React.CSSProperties = {
    width: `${template.cardWidth}mm`,
    height: `${template.cardHeight}mm`,
    backgroundColor: 'white',
    border: '1px solid #dddddd',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Hind Siliguri', sans-serif",
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
  };

  return (
    <div id={id} style={{ ...cardStyle, color: '#0f172a' }} className="id-card-container">
      {template.backgroundImage && (
        <img 
          src={template.backgroundImage} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-fill z-0"
          style={{ imageRendering: 'auto' }}
          referrerPolicy="no-referrer"
        />
      )}

      {/* Watermark Logo */}
      {template.watermarkImage && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
          style={{ 
            opacity: template.watermarkOpacity || 0.1,
            transform: `translate(${(template.watermarkLeftOffset || 0) * 4}px, ${(template.watermarkTopOffset || 0) * 4}px)`
          }}
        >
          <img 
            src={template.watermarkImage} 
            alt="Watermark" 
            style={{ 
              width: `${template.watermarkSize || 40}mm`,
              height: 'auto',
              maxHeight: '80%'
            }}
            className="object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {!hideContent && (
        <>
          {/* Left Bar Text - Vertical (as seen in design) */}
      {template.showLeftBarText !== false && template.leftBarText && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center z-20"
          style={{ 
            backgroundColor: template.leftBarColor || template.primaryColor,
            color: '#ffffff',
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontSize: '9px',
            fontWeight: '900',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          {template.leftBarText}
        </div>
      )}

      {/* Header Section - Fixed Height to prevent shifting */}
      <div 
        className={`relative h-[65px] flex-shrink-0 flex flex-col items-center justify-center z-10 ${template.showLeftBarText !== false ? 'ml-6' : 'px-2'}`}
        style={{ 
          backgroundColor: template.backgroundImage ? 'transparent' : template.primaryColor, 
          color: template.backgroundImage ? '#1e293b' : '#ffffff' 
        }}
      >
        <div className="flex items-center gap-2 w-full px-2">
          {template.showSchoolLogo !== false && template.schoolLogo && (
            <img 
              src={template.schoolLogo} 
              alt="Logo" 
              className="h-10 w-10 object-contain rounded-full p-[1px] shrink-0 translate-y-[2px]"
              style={{ backgroundColor: '#ffffff' }}
              referrerPolicy="no-referrer"
            />
          )}
          <div className="text-left flex-1 min-w-0 flex flex-col justify-center">
            <div className="min-h-[14px]">
              {template.showSchoolName !== false && (
                <AutoShrinkText 
                  text={template.schoolName} 
                  maxFontSize={template.schoolNameSize || 11} 
                  className="font-bold leading-none" 
                  style={{ color: template.schoolNameColor || (template.backgroundImage ? '#1e293b' : '#ffffff') }}
                />
              )}
            </div>
            <div className="min-h-[10px]">
              {template.showSchoolAddress !== false && (
                <p 
                  className="opacity-90 leading-tight mt-0" 
                  style={{ 
                    color: template.schoolAddressColor || (template.backgroundImage ? '#475569' : '#ffffff'),
                    fontSize: `${template.schoolAddressSize || 7}px`
                  }}
                >
                  {template.schoolAddress}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className={`relative flex-1 pb-4 pt-1 flex flex-col justify-start text-[9px] leading-tight z-10 ${template.showLeftBarText !== false ? 'ml-6 px-3' : 'px-4'}`}>
        {/* Photo Section */}
        <div 
          className="flex justify-center relative" 
          style={{ top: `${(template.photoTopOffset || -6) * 4}px` }}
        >
          <div className="relative">
            {/* Background shade for PDF visibility */}
            <div 
              className="absolute inset-0 rounded-full blur-[1px]"
              style={{ 
                width: `${(template.photoSize || 24) + 2}px`, 
                height: `${(template.photoSize || 24) + 2}px`,
                margin: '-1px',
                zIndex: -1,
                backgroundColor: 'rgba(203, 213, 225, 0.4)' // Equivalent to slate-300/40
              }}
            />
            <div 
              className="rounded-full overflow-hidden" 
              style={{ 
                width: `${template.photoSize || 24}px`,
                height: `${template.photoSize || 24}px`,
                border: '3px solid #ffffff',
                backgroundColor: '#f1f5f9', 
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                flexShrink: 0
              }}
            >
              {student.photo ? (
                <img 
                  src={student.photo} 
                  alt={student.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: '#cbd5e1' }}>PHOTO</div>
              )}
            </div>
          </div>
        </div>

        {/* Student Data Grid */}
        <div 
          className="space-y-0 mb-1 relative"
          style={{ 
            top: `${(template.studentInfoTopOffset || 6) * 4}px`,
            left: `${(template.studentInfoLeftOffset || 0) * 4}px`,
            fontSize: `${template.studentInfoFontSize || 9}px`
          }}
        >
          <div className="grid grid-cols-[40px_6px_1fr] items-center py-0">
            <span className="font-bold">নাম</span>
            <span className="font-bold">:</span>
            <div className="font-black min-w-0">
              <AutoShrinkText text={student.name} maxFontSize={(template.studentInfoFontSize || 9) + 2} />
            </div>
          </div>
          
          <div className="grid grid-cols-[40px_6px_1fr] items-center">
            <span className="font-bold">শ্রেণি</span>
            <span className="font-bold">:</span>
            <div className="font-bold min-w-0">
              <AutoShrinkText text={student.class} maxFontSize={template.studentInfoFontSize || 9} />
            </div>
          </div>

          {student.group && (
            <div className="grid grid-cols-[40px_6px_1fr] items-center">
              <span className="font-bold">বিভাগ</span>
              <span className="font-bold">:</span>
              <div className="font-bold min-w-0">
                <AutoShrinkText text={student.group} maxFontSize={template.studentInfoFontSize || 9} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-[40px_6px_1fr] items-center">
            <span className="font-bold">পিতা</span>
            <span className="font-bold">:</span>
            <div className="font-bold min-w-0">
              <AutoShrinkText text={student.fatherName || ''} maxFontSize={template.studentInfoFontSize || 9} />
            </div>
          </div>

          <div className="grid grid-cols-[40px_6px_1fr] items-center">
            <span className="font-bold">ঠিকানা</span>
            <span className="font-bold">:</span>
            <div className="font-bold min-w-0">
              <AutoShrinkText text={student.address || ''} maxFontSize={template.studentInfoFontSize || 9} />
            </div>
          </div>

          <div className="grid grid-cols-[40px_6px_1fr] items-center">
            <span className="font-bold">মোবাইল</span>
            <span className="font-bold">:</span>
            <div className="font-bold min-w-0">
              <AutoShrinkText text={student.phone || ''} maxFontSize={template.studentInfoFontSize || 9} />
            </div>
          </div>

          <div className="grid grid-cols-[40px_6px_1fr] items-center">
            <span className="font-bold">রক্ত</span>
            <span className="font-bold">:</span>
            <div className="font-bold min-w-0" style={{ color: '#dc2626' }}>
              <AutoShrinkText text={student.bloodGroup || ''} maxFontSize={template.studentInfoFontSize || 9} />
            </div>
          </div>

          <div className="grid grid-cols-[40px_6px_1fr] items-center">
            <span className="font-bold">আইডি</span>
            <span className="font-bold">:</span>
            <div className="font-bold min-w-0">
              <AutoShrinkText text={student.studentId} maxFontSize={template.studentInfoFontSize || 9} />
            </div>
          </div>
        </div>

        {/* Footer - Absolutely positioned at bottom to prevent shifting */}
        <div 
          className="absolute bottom-2 left-0 right-0 flex justify-between items-end h-8 px-4 z-20"
          style={{ 
            marginLeft: template.showLeftBarText !== false ? '24px' : '0px',
            paddingRight: template.showLeftBarText !== false ? '12px' : '16px'
          }}
        >
          <div className="text-[6px] font-bold pb-1" style={{ color: '#dc2626' }}>
            {template.expiryDate && <div>মেয়াদ: {template.expiryDate}</div>}
          </div>
          <div 
            className="relative flex flex-col items-center min-w-[60px] max-w-[70px]"
            style={{ marginBottom: `${(template.principalTextBottomOffset || 1) * 4}px` }}
          >
            {template.principalSignature && (
              <div 
                className="absolute w-full flex items-center justify-center pointer-events-none"
                style={{ 
                  bottom: `${(template.signatureTopOffset || 2) * 4}px`,
                  height: `${template.signatureSize || 8}px`
                }}
              >
                <img 
                  src={template.principalSignature} 
                  alt="Signature" 
                  className="h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <div className="flex flex-col items-center w-full z-10">
              <div className="font-bold w-full text-center">
                <AutoShrinkText 
                  text="প্রধান শিক্ষক" 
                  maxFontSize={template.principalFontSize || 8} 
                  className="px-0" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )}
      
      {/* Bottom Border Line */}
      {!hideContent && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-2 z-20" 
          style={{ backgroundColor: template.primaryColor }}
        />
      )}
    </div>
  );
};

export const IDCardBack: React.FC<IDCardProps> = ({ template, id, hideContent }) => {
  const cardStyle: React.CSSProperties = {
    width: `${template.cardWidth}mm`,
    height: `${template.cardHeight}mm`,
    backgroundColor: 'white',
    border: '1px solid #dddddd',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Hind Siliguri', sans-serif",
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
  };

  return (
    <div id={id} style={cardStyle} className="id-card-container">
      {template.backPartImage && (
        <img 
          src={template.backPartImage} 
          alt="Back Background" 
          className="absolute inset-0 w-full h-full object-fill z-0"
          style={{ imageRendering: 'auto' }}
          referrerPolicy="no-referrer"
        />
      )}
      {!hideContent && (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center z-10">
          {!template.backPartImage && (
            <>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: '#f1f5f9' }}
              >
                <span className="text-xs" style={{ color: '#94a3b8' }}>BACK</span>
              </div>
              <h3 className="text-sm font-bold mb-2" style={{ color: '#0f172a' }}>{template.schoolName}</h3>
              <p className="text-[10px]" style={{ color: '#64748b' }}>Please upload a back part image in settings to replace this default view.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
