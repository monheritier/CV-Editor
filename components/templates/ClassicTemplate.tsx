import React from 'react';
import type { CVData } from '../../types';
import { Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Award, Code, Github, Linkedin, Loader, Building } from '../Icons';
import EditableField from '../EditableField';

interface TemplateProps {
  data: CVData;
  setDataFromPath: (path: string, value: any) => void;
  fetchCompanyLogo: (index: number) => void;
}

const ClassicTemplate: React.FC<TemplateProps> = ({ data, setDataFromPath, fetchCompanyLogo }) => {
  return (
    <>
      {/* Header */}
      <header className="cv-header text-white p-8">
        <EditableField as="h1" className="text-4xl mb-2 font-bold" value={data.name} onUpdate={(v) => setDataFromPath('name', v)} placeholder="Your Name" />
        <EditableField as="p" className="text-xl mb-6" value={data.title} onUpdate={(v) => setDataFromPath('title', v)} placeholder="Your Title" />
        <EditableField as="p" className="max-w-3xl mb-6 opacity-90" value={data.summary} onUpdate={(v) => setDataFromPath('summary', v)} placeholder="A brief professional summary..." isTextarea />

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {data.contact.email && (
            <div className="flex items-center gap-2">
              <Mail size={18} />
              <EditableField as="a" href={`mailto:${data.contact.email}`} className="hover:underline" value={data.contact.email} onUpdate={(v) => setDataFromPath('contact.email', v)} placeholder="your.email@example.com" />
            </div>
          )}
          {data.contact.phone && (
            <div className="flex items-center gap-2">
              <Phone size={18} />
              <EditableField as="a" href={`tel:${data.contact.phone}`} className="hover:underline" value={data.contact.phone} onUpdate={(v) => setDataFromPath('contact.phone', v)} placeholder="Your Phone" />
            </div>
          )}
          {data.contact.location && (
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <EditableField value={data.contact.location} onUpdate={(v) => setDataFromPath('contact.location', v)} placeholder="Your Location" />
            </div>
          )}
           {data.contact.github && (
            <div className="flex items-center gap-2">
              <Github size={18} />
              <EditableField as="a" href={data.contact.github} target="_blank" rel="noopener noreferrer" className="hover:underline print-header-link-white" value={data.contact.github.replace('https://', '')} onUpdate={(v) => setDataFromPath('contact.github', v.startsWith('https://') ? v : `https://${v}`)} placeholder="github.com/username" />
            </div>
          )}
          {data.contact.linkedin && (
            <div className="flex items-center gap-2">
              <Linkedin size={18} />
              <EditableField as="a" href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline print-header-link-white" value={data.contact.linkedin.replace('https://', '')} onUpdate={(v) => setDataFromPath('contact.linkedin', v.startsWith('https://') ? v : `https://${v}`)} placeholder="linkedin.com/in/username" />
            </div>
          )}
        </div>
      </header>

      <main className="grid md:grid-cols-3 md-grid-cols-3-print gap-8 p-8">
        {/* Left Column */}
        <div className="md:col-span-1 md-col-span-1-print space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4 cv-text-primary">
              <Globe size={20} />
              <h2 className="uppercase tracking-wide font-bold">Languages</h2>
            </div>
            <div className="space-y-4">
              {data.languages.map((lang, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={lang.icon} alt={`${lang.name} flag`} className="w-5 h-3 rounded-sm" />
                      <EditableField value={lang.name} onUpdate={(v) => setDataFromPath(`languages.${index}.name`, v)} />
                    </div>
                     <EditableField as="span" className="text-sm text-gray-600" value={lang.level} onUpdate={(v) => setDataFromPath(`languages.${index}.level`, v)} />
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                    <div className="h-2 rounded-full cv-lang-bar-fill" style={{ width: `${lang.proficiency}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 cv-text-primary">
              <Code size={20} />
              <h2 className="uppercase tracking-wide font-bold">Skills</h2>
            </div>
            <div className="space-y-4">
              {data.skills.map((category, index) => (
                <div key={index}>
                  <EditableField as="h3" className="text-sm mb-2 cv-text-primary font-semibold" value={category.name} onUpdate={(v) => setDataFromPath(`skills.${index}.name`, v)} />
                  <ul className="text-sm space-y-1 text-gray-700">
                    {category.skills.map((skill, sIndex) => (
                      <li key={sIndex} className="flex items-start gap-1">
                        <span>•</span>
                        <EditableField isTextarea value={skill} onUpdate={(v) => {
                           const newSkills = [...category.skills];
                           newSkills[sIndex] = v;
                           setDataFromPath(`skills.${index}.skills`, newSkills);
                        }} className="w-full" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 cv-text-primary">
              <Award size={20} />
              <h2 className="uppercase tracking-wide font-bold">Certifications</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.certifications.map((cert, index) => (
                <a key={index} href={cert.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1 text-xs cv-bg-primary-light cv-text-primary border rounded-full hover:opacity-80 transition">
                  <img src={cert.logoUrl} alt={`${cert.name} logo`} className="w-4 h-4 object-contain" />
                  <EditableField value={cert.name} onUpdate={(v) => setDataFromPath(`certifications.${index}.name`, v)} />
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 md-col-span-2-print space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4 cv-text-primary">
              <GraduationCap size={20} />
              <h2 className="uppercase tracking-wide font-bold">Education</h2>
            </div>
            <div className="space-y-6">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <EditableField as="h3" className="font-semibold text-gray-800" value={edu.degree} onUpdate={(v) => setDataFromPath(`education.${index}.degree`, v)} placeholder="Degree" />
                    <EditableField as="span" className="text-sm text-gray-600 ml-4 whitespace-nowrap" value={edu.period} onUpdate={(v) => setDataFromPath(`education.${index}.period`, v)} placeholder="Date Range" />
                  </div>
                  <EditableField as="p" className="cv-text-primary mb-2 font-medium" value={edu.university} onUpdate={(v) => setDataFromPath(`education.${index}.university`, v)} placeholder="University Name" />
                  <p className="text-sm text-gray-700 flex gap-1">
                    <span className="italic">Thesis:</span> 
                    <EditableField isTextarea className="flex-1" value={edu.thesis} onUpdate={(v) => setDataFromPath(`education.${index}.thesis`, v)} placeholder="Thesis title" />
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 cv-text-primary">
              <Briefcase size={20} />
              <h2 className="uppercase tracking-wide font-bold">Professional Experience</h2>
            </div>
            <div className="space-y-6">
              {data.experience.map((job, index) => (
                <div key={index}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 mt-1 flex items-center justify-center flex-shrink-0">
                        {job.isLogoLoading ? (
                            <Loader size={24} className="text-gray-400" />
                        ) : job.logoUrl ? (
                            <img src={job.logoUrl} alt={`${job.company} Logo`} className="w-10 h-10 object-contain" />
                        ) : (
                            <Building size={24} className="text-gray-400" />
                        )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <EditableField as="h3" className="font-semibold text-gray-800" value={job.role} onUpdate={(v) => setDataFromPath(`experience.${index}.role`, v)} placeholder="Job Role" />
                          <EditableField as="p" className="cv-text-primary font-medium" value={job.company} onUpdate={(v) => setDataFromPath(`experience.${index}.company`, v)} onBlur={() => fetchCompanyLogo(index)} placeholder="Company Name" />
                        </div>
                        <div className="text-sm text-gray-600 text-right whitespace-nowrap ml-4">
                          <EditableField as="p" className="text-right" value={job.period} onUpdate={(v) => setDataFromPath(`experience.${index}.period`, v)} placeholder="Date Range" />
                          <EditableField as="p" className="text-right" value={job.location} onUpdate={(v) => setDataFromPath(`experience.${index}.location`, v)} placeholder="Location" />
                        </div>
                      </div>
                      <ul className="text-sm space-y-1 text-gray-700 mt-2 ml-1">
                        {job.description.map((desc, dIndex) => (
                           <li key={dIndex} className="flex items-start gap-1">
                            <span>•</span>
                            <EditableField isTextarea value={desc} onUpdate={(v) => {
                               const newDescription = [...job.description];
                               newDescription[dIndex] = v;
                               setDataFromPath(`experience.${index}.description`, newDescription);
                            }} className="w-full" placeholder="Responsibility or achievement..." />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ClassicTemplate;