import React, { useState } from 'react';
import type { CVData } from '../types';
import { Printer, Loader } from './Icons';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';

// Add global declaration for html2pdf library from CDN
declare const html2pdf: any;

interface CVPreviewProps {
  data: CVData;
  theme: string;
  font: string;
  template: string;
  setDataFromPath: (path: string, value: any) => void;
  fetchCompanyLogo: (index: number) => void;
}

const CVPreview: React.FC<CVPreviewProps> = ({ data, theme, font, template, setDataFromPath, fetchCompanyLogo }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = () => {
    if (typeof html2pdf === 'undefined') {
      alert('PDF generation library is not loaded yet. Please try again in a moment.');
      return;
    }

    const element = document.getElementById('resume-preview-content');
    if (!element) {
        console.error("Resume preview element not found!");
        alert("Could not find resume content to download.");
        return;
    }

    setIsDownloading(true);
    
    const sanitizedFilename = (data.name || 'resume').replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const opt = {
      margin:       [0.5, 0.2, 0.5, 0.2], // [top, left, bottom, right] in cm
      filename:     `${sanitizedFilename}_cv.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().catch((err: any) => {
      console.error("PDF generation failed:", err);
      alert("Sorry, there was an error generating the PDF.");
    }).finally(() => {
      setIsDownloading(false);
    });
  };

  const renderTemplate = () => {
    const props = { data, setDataFromPath, fetchCompanyLogo };
    switch (template) {
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'classic':
      default:
        return <ClassicTemplate {...props} />;
    }
  }

  return (
    <div className="w-full lg:w-3/5 print-container">
      {/* Download Button */}
      <div className="max-w-5xl mx-auto mb-4 print-hidden">
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-wait w-48"
        >
          {isDownloading ? (
            <>
              <Loader size={20} />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Printer size={20} />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      <div id="resume-preview-content" className={`max-w-5xl mx-auto bg-white shadow-lg print-shadow-none ${theme ? `theme-${theme}` : 'theme-blue'} ${font ? `font-${font}` : 'font-inter'}`}>
        {renderTemplate()}
      </div>
    </div>
  );
};

export default CVPreview;