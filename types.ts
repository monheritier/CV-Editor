export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
}

export interface Language {
  name: string;
  level: string;
  icon: string;
  proficiency: number; // 0-100
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface Certification {
  name: string;
  link: string;
  logoUrl: string;
}

export interface Education {
  degree: string;
  university: string;
  period: string;
  thesis: string;
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  description: string[];
  logoUrl: string;
  isLogoLoading?: boolean;
}

export interface CVData {
  name: string;
  title: string;
  summary: string;
  contact: ContactInfo;
  languages: Language[];
  skills: SkillCategory[];
  certifications: Certification[];
  education: Education[];
  experience: Experience[];
}