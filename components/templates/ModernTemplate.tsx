import React from 'react';
import type { CVData } from '../../types';
import { Briefcase, Loader, Building } from '../Icons';
import EditableField from '../EditableField';

interface TemplateProps {
  data: CVData;
  setDataFromPath: (path: string, value: any) => void;
  fetchCompanyLogo: (index: number) => void;
}

const ModernTemplate: React.FC<TemplateProps> = ({ data, setDataFromPath, fetchCompanyLogo }) => {
  return (
    <div className="p-8">
      {/* Header */}
      <header className="text-center mb-8 border-b pb-6">
        <EditableField as="h1" className="text-4xl cv-text-primary mb-2 font-bold" value={data.name} onUpdate={(v) => setDataFromPath('name', v)} placeholder="Your Name" />
        <EditableField as="p" className="text-xl text-gray-600 mb-4" value={data.title} onUpdate={(v) => setDataFromPath('title', v)} placeholder="Your Title" />
        <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700">
          <EditableField as="a" href={`mailto:${data.contact.email}`} className="flex items-center gap-2 hover:cv-text-primary" value={data.contact.email} onUpdate={(v) => setDataFromPath('contact.email', v)} placeholder="Email" />
          <EditableField as="a" href={`tel:${data.contact.phone}`} className="flex items-center gap-2 hover:cv-text-primary" value={data.contact.phone} onUpdate={(v) => setDataFromPath('contact.phone', v)} placeholder="Phone" />
          <EditableField as="span" className="flex items-center gap-2" value={data.contact.location} onUpdate={(v) => setDataFromPath('contact.location', v)} placeholder="Location" />
          <EditableField as="a" href={data.contact.github} className="flex items-center gap-2 hover:cv-text-primary" value={data.contact.github.replace('https://', '')} onUpdate={(v) => setDataFromPath('contact.github', v)} placeholder="GitHub" />
          <EditableField as="a" href={data.contact.linkedin} className="flex items-center gap-2 hover:cv-text-primary" value={data.contact.linkedin.replace('https://', '')} onUpdate={(v) => setDataFromPath('contact.linkedin', v)} placeholder="LinkedIn" />
        </div>
      </header>

      <main className="grid md:grid-cols-3 gap-10">
        {/* Left Column (Experience & Education) */}
        <div className="md:col-span-2">
          <section className="mb-8">
            <h2 className="uppercase tracking-wide font-bold cv-text-primary border-b-2 pb-2 mb-4">Summary</h2>
            <EditableField as="p" className="text-gray-700" value={data.summary} onUpdate={(v) => setDataFromPath('summary', v)} isTextarea placeholder="Professional summary..." />
          </section>

          <section className="mb-8">
            <h2 className="uppercase tracking-wide font-bold cv-text-primary border-b-2 pb-2 mb-4">Professional Experience</h2>
            <div className="space-y-6">
              {data.experience.map((job, index) => (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <EditableField as="h3" className="font-semibold text-lg" value={job.role} onUpdate={(v) => setDataFromPath(`experience.${index}.role`, v)} placeholder="Job Role"/>
                    <EditableField className="text-sm text-gray-600 text-right whitespace-nowrap ml-4" value={job.period} onUpdate={(v) => setDataFromPath(`experience.${index}.period`, v)} placeholder="Date Range"/>
                  </div>
                   <div className="flex justify-between items-baseline mb-2">
                        <EditableField className="font-medium cv-text-primary" value={job.company} onUpdate={(v) => setDataFromPath(`experience.${index}.company`, v)} onBlur={() => fetchCompanyLogo(index)} placeholder="Company Name"/>
                        <EditableField className="text-sm text-gray-600" value={job.location} onUpdate={(v) => setDataFromPath(`experience.${index}.location`, v)} placeholder="Location" />
                   </div>
                  <ul className="text-sm space-y-1 text-gray-700 list-disc list-inside">
                     {job.description.map((desc, dIndex) => (
                        <li key={dIndex} className="flex items-start gap-1">
                            <EditableField isTextarea value={desc} onUpdate={(v) => {
                               const newDescription = [...job.description];
                               newDescription[dIndex] = v;
                               setDataFromPath(`experience.${index}.description`, newDescription);
                            }} className="w-full" placeholder="Responsibility or achievement..." />
                        </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

           <section>
            <h2 className="uppercase tracking-wide font-bold cv-text-primary border-b-2 pb-2 mb-4">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <EditableField as="h3" className="font-semibold" value={edu.degree} onUpdate={(v) => setDataFromPath(`education.${index}.degree`, v)} placeholder="Degree"/>
                    <EditableField as="span" className="text-sm text-gray-600 ml-4 whitespace-nowrap" value={edu.period} onUpdate={(v) => setDataFromPath(`education.${index}.period`, v)} placeholder="Date Range"/>
                  </div>
                  <EditableField as="p" className="font-medium cv-text-primary" value={edu.university} onUpdate={(v) => setDataFromPath(`education.${index}.university`, v)} placeholder="University"/>
                  {edu.thesis && <EditableField isTextarea className="text-sm text-gray-600 italic mt-1" value={`Thesis: ${edu.thesis}`} onUpdate={(v) => setDataFromPath(`education.${index}.thesis`, v.replace('Thesis: ', ''))} />}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Skills, Languages, Certs) */}
        <div className="md:col-span-1">
           <section className="mb-8">
            <h2 className="uppercase tracking-wide font-bold cv-text-primary border-b-2 pb-2 mb-4">Skills</h2>
            <div className="space-y-4">
              {data.skills.map((category, index) => (
                <div key={index}>
                  <EditableField as="h3" className="font-semibold mb-2" value={category.name} onUpdate={(v) => setDataFromPath(`skills.${index}.name`, v)} placeholder="Skill Category"/>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, sIndex) => (
                       <EditableField key={sIndex} className="text-xs cv-bg-primary-light cv-text-primary font-medium px-2 py-1 rounded" value={skill} onUpdate={(v) => {
                           const newSkills = [...category.skills];
                           newSkills[sIndex] = v;
                           setDataFromPath(`skills.${index}.skills`, newSkills);
                       }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="uppercase tracking-wide font-bold cv-text-primary border-b-2 pb-2 mb-4">Languages</h2>
            <div className="space-y-3">
              {data.languages.map((lang, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm">
                    <EditableField value={lang.name} onUpdate={(v) => setDataFromPath(`languages.${index}.name`, v)} />
                    <EditableField className="text-gray-600" value={lang.level} onUpdate={(v) => setDataFromPath(`languages.${index}.level`, v)} />
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1">
                    <div className="h-1.5 rounded-full cv-lang-bar-fill" style={{ width: `${lang.proficiency}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="uppercase tracking-wide font-bold cv-text-primary border-b-2 pb-2 mb-4">Certifications</h2>
            <div className="space-y-2">
              {data.certifications.map((cert, index) => (
                <a key={index} href={cert.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-gray-700 hover:cv-text-primary">
                  <img src={cert.logoUrl} alt={`${cert.name} logo`} className="w-5 h-5 object-contain flex-shrink-0" />
                  <EditableField as="span" value={cert.name} onUpdate={(v) => setDataFromPath(`certifications.${index}.name`, v)} />
                </a>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ModernTemplate;
