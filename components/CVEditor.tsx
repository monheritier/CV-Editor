import React from 'react';
import type { CVData, Experience, Education, Certification, Language, SkillCategory } from '../types';
import { BrainCircuit, Trash, User, Briefcase, GraduationCap, Award, Globe, Code, ChevronDown } from './Icons';

// Add global declarations for CDN scripts to satisfy TypeScript
declare const pdfjsLib: any;
declare const Tesseract: any;

interface CVEditorProps {
  data: CVData;
  setData: React.Dispatch<React.SetStateAction<CVData>>;
  onParseResume: (text: string) => void;
  isParsing: boolean;
  theme: string;
  setTheme: (theme: string) => void;
  font: string;
  setFont: (font: string) => void;
  template: string;
  setTemplate: (template: string) => void;
  fetchCompanyLogo: (index: number) => void;
}

const themes = [
  { name: 'blue', color: '#2563eb' },
  { name: 'teal', color: '#0d9488' },
  { name: 'purple', color: '#7c3aed' },
  { name: 'slate', color: '#475569' },
];

const fonts = [
  { name: 'Inter', value: 'inter' },
  { name: 'Roboto', value: 'roboto' },
  { name: 'Lato', value: 'lato' },
  { name: 'Merriweather', value: 'merriweather' },
];

const templates = [
    { name: 'Classic', value: 'classic' },
    { name: 'Modern', value: 'modern' },
];

const AccordionItem: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className="bg-white rounded-lg shadow-md mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 font-semibold text-lg text-gray-800"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <span>{title}</span>
                </div>
                <ChevronDown size={24} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-full' : 'max-h-0'}`}>
                <div className="p-4 border-t border-gray-200">
                    {children}
                </div>
            </div>
        </div>
    );
};


const CVEditor: React.FC<CVEditorProps> = ({ data, setData, onParseResume, isParsing, theme, setTheme, font, setFont, template, setTemplate, fetchCompanyLogo }) => {
  const [resumeText, setResumeText] = React.useState('');
  const [ocrStatus, setOcrStatus] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleParseClick = () => {
    if (resumeText.trim()) {
      onParseResume(resumeText);
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
        await handlePdfUpload(file);
    } else if (file.type === 'text/plain') {
        handleTxtUpload(file);
    } else {
        alert('Unsupported file type. Please upload a .txt or .pdf file.');
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleTxtUpload = (file: File) => {
    setOcrStatus('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setResumeText(text);
    };
    reader.readAsText(file);
  };

  const handlePdfUpload = async (file: File) => {
    if (typeof pdfjsLib === 'undefined' || typeof Tesseract === 'undefined') {
      alert('Required libraries for PDF processing are not loaded yet. Please try again in a moment.');
      return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
    setOcrStatus('Initializing PDF processing...');
    setResumeText('');
    
    try {
      const fileAsArrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(fileAsArrayBuffer).promise;
      const numPages = pdf.numPages;
      const numWorkers = Math.min(navigator.hardwareConcurrency || 2, numPages);

      setOcrStatus(`Initializing ${numWorkers} OCR workers...`);
      const scheduler = Tesseract.createScheduler();
      const workerPromises = Array.from({ length: numWorkers }, () => Tesseract.createWorker('eng'));
      const workers = await Promise.all(workerPromises);
      workers.forEach(worker => scheduler.addWorker(worker));
      
      let ocrPromises = [];
      for (let i = 1; i <= numPages; i++) {
        setOcrStatus(`Queueing page ${i}/${numPages} for OCR...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          ocrPromises.push(scheduler.addJob('recognize', canvas));
        }
      }

      setOcrStatus('Recognizing text across all pages...');
      const results = await Promise.all(ocrPromises);
      await scheduler.terminate();

      const fullText = results.map(result => result.data.text).join('\n\n');
      setResumeText(fullText);
      setOcrStatus('');
    } catch (error) {
      console.error('Error processing PDF:', error);
      setOcrStatus('Error processing PDF. Please try again.');
      setTimeout(() => setOcrStatus(''), 5000);
    }
  };

  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    setData(prev => {
        const newData = JSON.parse(JSON.stringify(prev));
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
    });
  };

  const handleArrayChange = <T,>(section: keyof CVData, index: number, field: keyof T, value: any) => {
    setData(prev => {
      const newArray = [...(prev[section] as any[])] as T[];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };
  
  const addArrayItem = (section: keyof CVData, newItem: any) => {
    setData(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), newItem]
    }));
  };

  const removeArrayItem = (section: keyof CVData, index: number) => {
    setData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_, i) => i !== index)
    }));
  };

  const handleSkillCategoryChange = (catIndex: number, value: string) => {
    const newSkills = [...data.skills];
    newSkills[catIndex] = { ...newSkills[catIndex], name: value };
    setData(prev => ({ ...prev, skills: newSkills }));
  };

  const handleSkillChange = (catIndex: number, skillIndex: number, value: string) => {
      const newSkills = JSON.parse(JSON.stringify(data.skills));
      newSkills[catIndex].skills[skillIndex] = value;
      setData(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkill = (catIndex: number) => {
      const newSkills = JSON.parse(JSON.stringify(data.skills));
      newSkills[catIndex].skills.push('New Skill');
      setData(prev => ({ ...prev, skills: newSkills }));
  };

  const removeSkill = (catIndex: number, skillIndex: number) => {
      const newSkills = JSON.parse(JSON.stringify(data.skills));
      newSkills[catIndex].skills.splice(skillIndex, 1);
      setData(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkillCategory = () => {
      addArrayItem('skills', { name: 'New Category', skills: ['New Skill'] });
  };

  const removeSkillCategory = (catIndex: number) => {
      removeArrayItem('skills', catIndex);
  };

  const isProcessing = isParsing || !!ocrStatus;

  return (
    <div className="w-full lg:w-2/5 p-4 sm:p-8 bg-gray-100 h-screen overflow-y-auto print-hidden">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Resume Editor</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4 text-blue-700 flex items-center gap-2">
            <BrainCircuit size={20} />
            Parse with AI
        </h3>
        <p className="text-sm text-gray-600 mb-4">
            Upload a PDF or TXT file, or paste your resume content below. The AI will populate the fields for you.
        </p>
        <textarea
          className="w-full p-2 border rounded-md h-40 mb-4"
          placeholder="Paste your resume here, or upload a file..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          disabled={isProcessing}
        />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <input ref={fileInputRef} type="file" accept=".txt,.pdf" onChange={handleFileChange} disabled={isProcessing} className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50" />
            <button onClick={handleParseClick} disabled={isProcessing || !resumeText} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto">
                {isParsing ? 'Parsing...' : 'Parse Resume'}
            </button>
        </div>
         {ocrStatus && (
            <div className="mt-4 text-sm text-center sm:text-left text-blue-600 animate-pulse">{ocrStatus}</div>
        )}
      </div>

      <AccordionItem title="Appearance" icon={<div className="w-5 h-5 rounded-full" style={{background: 'linear-gradient(45deg, #2563eb, #7c3aed, #0d9488)'}} />}>
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                <div className="flex space-x-3">
                    {themes.map(t => (
                        <button key={t.name} onClick={() => setTheme(t.name)} className={`w-8 h-8 rounded-full border-2 ${theme === t.name ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`} style={{ backgroundColor: t.color }} title={t.name.charAt(0).toUpperCase() + t.name.slice(1)} />
                    ))}
                </div>
            </div>
             <div>
                <label htmlFor="font-select" className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
                <select id="font-select" value={font} onChange={e => setFont(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                    {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <select id="template-select" value={template} onChange={e => setTemplate(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                    {templates.map(t => <option key={t.value} value={t.value}>{t.name}</option>)}
                </select>
            </div>
        </div>
      </AccordionItem>
      
      <div className={`mt-6 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}>
        <AccordionItem title="Personal Details" icon={<User size={20}/>} defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={data.name} onChange={handleSimpleChange} placeholder="Full Name" className="p-2 border rounded" />
              <input name="title" value={data.title} onChange={handleSimpleChange} placeholder="Job Title" className="p-2 border rounded" />
              <input name="contact.email" value={data.contact.email} onChange={handleSimpleChange} placeholder="Email" className="p-2 border rounded" />
              <input name="contact.phone" value={data.contact.phone} onChange={handleSimpleChange} placeholder="Phone" className="p-2 border rounded" />
              <input name="contact.location" value={data.contact.location} onChange={handleSimpleChange} placeholder="Location" className="p-2 border rounded" />
              <input name="contact.github" value={data.contact.github} onChange={handleSimpleChange} placeholder="GitHub URL" className="p-2 border rounded" />
              <input name="contact.linkedin" value={data.contact.linkedin} onChange={handleSimpleChange} placeholder="LinkedIn URL" className="p-2 border rounded md:col-span-2" />
            </div>
            <textarea name="summary" value={data.summary} onChange={handleSimpleChange} placeholder="Summary" className="w-full mt-4 p-2 border rounded h-24" />
        </AccordionItem>

        <AccordionItem title="Professional Experience" icon={<Briefcase size={20}/>}>
            <div className="space-y-4">
                {data.experience.map((job, index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50/80 relative">
                        <button onClick={() => removeArrayItem('experience', index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1"><Trash size={16} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input value={job.role} onChange={e => handleArrayChange<Experience>('experience', index, 'role', e.target.value)} placeholder="Role" className="p-2 border rounded" />
                            <input value={job.company} onBlur={() => fetchCompanyLogo(index)} onChange={e => handleArrayChange<Experience>('experience', index, 'company', e.target.value)} placeholder="Company" className="p-2 border rounded" />
                            <input value={job.period} onChange={e => handleArrayChange<Experience>('experience', index, 'period', e.target.value)} placeholder="Period (e.g., Oct 2025 – Present)" className="p-2 border rounded" />
                            <input value={job.location} onChange={e => handleArrayChange<Experience>('experience', index, 'location', e.target.value)} placeholder="Location" className="p-2 border rounded" />
                        </div>
                        <textarea
                            value={job.description.join('\n')}
                            onChange={e => handleArrayChange<Experience>('experience', index, 'description', e.target.value.split('\n'))}
                            placeholder="Description (one bullet point per line)..."
                            className="w-full mt-3 p-2 border rounded h-24"
                        />
                    </div>
                ))}
                <button onClick={() => addArrayItem('experience', { role: '', company: '', period: '', location: '', description: [''], logoUrl: '' })} className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                    + Add Experience
                </button>
            </div>
        </AccordionItem>

        <AccordionItem title="Education" icon={<GraduationCap size={20}/>}>
            <div className="space-y-4">
                {data.education.map((edu, index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50/80 relative">
                        <button onClick={() => removeArrayItem('education', index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1"><Trash size={16} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input value={edu.degree} onChange={e => handleArrayChange<Education>('education', index, 'degree', e.target.value)} placeholder="Degree" className="p-2 border rounded" />
                            <input value={edu.university} onChange={e => handleArrayChange<Education>('education', index, 'university', e.target.value)} placeholder="University" className="p-2 border rounded" />
                            <input value={edu.period} onChange={e => handleArrayChange<Education>('education', index, 'period', e.target.value)} placeholder="Period (e.g., 2021-2023)" className="p-2 border rounded" />
                        </div>
                        <input value={edu.thesis} onChange={e => handleArrayChange<Education>('education', index, 'thesis', e.target.value)} placeholder="Thesis Title" className="w-full mt-3 p-2 border rounded" />
                    </div>
                ))}
                <button onClick={() => addArrayItem('education', { degree: '', university: '', period: '', thesis: '' })} className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                    + Add Education
                </button>
            </div>
        </AccordionItem>

        <AccordionItem title="Certifications" icon={<Award size={20}/>}>
            <div className="space-y-4">
                {data.certifications.map((cert, index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50/80 relative">
                        <button onClick={() => removeArrayItem('certifications', index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1"><Trash size={16} /></button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input value={cert.name} onChange={e => handleArrayChange<Certification>('certifications', index, 'name', e.target.value)} placeholder="Certification Name" className="p-2 border rounded md:col-span-2" />
                            <input value={cert.link} onChange={e => handleArrayChange<Certification>('certifications', index, 'link', e.target.value)} placeholder="Link to Certificate" className="p-2 border rounded" />
                            <input value={cert.logoUrl} onChange={e => handleArrayChange<Certification>('certifications', index, 'logoUrl', e.target.value)} placeholder="Logo Image URL" className="p-2 border rounded" />
                        </div>
                    </div>
                ))}
                <button onClick={() => addArrayItem('certifications', { name: '', link: '', logoUrl: '' })} className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                    + Add Certification
                </button>
            </div>
        </AccordionItem>

        <AccordionItem title="Languages" icon={<Globe size={20}/>}>
             <div className="space-y-4">
                {data.languages.map((lang, index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50/80 relative">
                        <button onClick={() => removeArrayItem('languages', index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1"><Trash size={16} /></button>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <input value={lang.name} onChange={e => handleArrayChange<Language>('languages', index, 'name', e.target.value)} placeholder="Language" className="p-2 border rounded" />
                            <input value={lang.level} onChange={e => handleArrayChange<Language>('languages', index, 'level', e.target.value)} placeholder="Level (e.g., B2)" className="p-2 border rounded" />
                            <div className="col-span-2">
                                <label className="text-sm text-gray-600">Proficiency: {lang.proficiency}%</label>
                                <input type="range" min="0" max="100" step="5" value={lang.proficiency} onChange={e => handleArrayChange<Language>('languages', index, 'proficiency', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                            </div>
                            <input value={lang.icon.split('/').pop()?.split('.')[0]} onChange={e => handleArrayChange<Language>('languages', index, 'icon', `https://flagcdn.com/w20/${e.target.value.toLowerCase()}.png`)} placeholder="2-letter country code" className="p-2 border rounded col-span-2" />
                        </div>
                    </div>
                ))}
                <button onClick={() => addArrayItem('languages', { name: '', level: '', proficiency: 50, icon: '' })} className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm">
                    + Add Language
                </button>
            </div>
        </AccordionItem>
        
        <AccordionItem title="Skills" icon={<Code size={20}/>}>
          <div className="space-y-4">
            {data.skills.map((category, catIndex) => (
              <div key={catIndex} className="p-3 border rounded-md bg-gray-50/80">
                <div className="flex items-center mb-2">
                  <input
                    value={category.name}
                    onChange={(e) => handleSkillCategoryChange(catIndex, e.target.value)}
                    placeholder="Category Name"
                    className="p-2 border rounded w-full font-medium"
                  />
                  <button onClick={() => removeSkillCategory(catIndex)} className="ml-2 text-gray-500 hover:text-red-600 p-1 transition-colors flex-shrink-0">
                    <Trash size={18} />
                  </button>
                </div>
                <div className="pl-4 space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skillIndex} className="flex items-start">
                      <textarea
                        value={skill}
                        onChange={(e) => handleSkillChange(catIndex, skillIndex, e.target.value)}
                        placeholder="Skill"
                        className="p-2 border rounded w-full text-sm"
                        rows={1}
                        style={{ resize: 'vertical' }}
                      />
                      <button onClick={() => removeSkill(catIndex, skillIndex)} className="ml-2 mt-2 text-gray-500 hover:text-red-600 p-1 transition-colors flex-shrink-0">
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addSkill(catIndex)} className="text-sm text-blue-600 hover:underline pt-1">
                    + Add Skill
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addSkillCategory} className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm w-full">
            + Add Skill Category
          </button>
        </AccordionItem>
      </div>
    </div>
  );
};

export default CVEditor;