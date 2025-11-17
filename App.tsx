import React, { useState } from 'react';
import type { CVData } from './types';
import CVEditor from './components/CVEditor';
import CVPreview from './components/CVPreview';
import { parseResumeWithGemini } from './services/geminiService';
import { findLogo } from './services/logoService';

const initialCVData: CVData = {
  name: "ALESSIO LEREDE",
  title: "ML/AI Engineer",
  summary: "I am a Data and AI Engineer with a passion for solving complex problems. I have a strong foundation in programming and data analysis, and I am eager to apply and expand my skills in innovative environments. Open to relocation and excited about new professional challenges.",
  contact: {
    email: "alessiolerede@gmail.com",
    phone: "+39 3466911560",
    location: "Wien, Austria",
    github: "https://github.com/monheritier",
    linkedin: "https://www.linkedin.com/in/alessio-lerede-6a9a75166/",
  },
  languages: [
    { name: "Italian", level: "Native", icon: "https://flagcdn.com/w20/it.png", proficiency: 100 },
    { name: "English", level: "B2", icon: "https://flagcdn.com/w20/gb.png", proficiency: 55 },
    { name: "Spanish", level: "C1", icon: "https://flagcdn.com/w20/es.png", proficiency: 75 },
    { name: "French", level: "B2", icon: "https://flagcdn.com/w20/fr.png", proficiency: 55 },
    { name: "German", level: "A2", icon: "https://flagcdn.com/w20/de.png", proficiency: 25 },
  ],
  skills: [
    { name: "AI & Data Science", skills: ["LLM Development & Generative AI", "<strong>Retrieval-Augmented Generation (RAG)</strong>", "<strong>LangChain</strong> Workflows & Agents", "<strong>Prompt Engineering</strong>", "Vector Databases (<strong>Supabase</strong>, <strong>Pinecone</strong>, <strong>Weaviate</strong>)", "Machine Learning & Deep Learning", "NLP & Computer Vision", "Speech-to-Text & Audio Processing", "Dialect & Language Classification", "<strong>Time Series Analysis</strong>", "GIS Analysis (<strong>ESRI ArcGIS</strong>, <strong>QGIS</strong>)", "<strong>Oracle DBMS Data Mining</strong>", "<strong>Oracle Analytics Cloud</strong>", "AI Platforms (<strong>Azure AI</strong>, <strong>Oracle Fusion AI</strong>, <strong>AWS AI</strong>)"] },
    { name: "MLOps & LLM Ops", skills: ["Model Deployment: <strong>FastAPI</strong>, <strong>Docker</strong>, <strong>Kubernetes</strong>", "Containerization & Registries: <strong>Docker Hub</strong>", "Local LLM Runtime: <strong>LM Studio</strong>", "Model Management: <strong>Model Context Protocol (MCP)</strong>", "Efficient LLM Inference: <strong>LoRA</strong>, <strong>QLoRA</strong>, <strong>ONNX</strong>, GGUF", "RAG & LLM Evaluation: <strong>RAGAS</strong>, DeepEval", "Enterprise LLM Agents", "Federated Learning & Privacy-Preserving ML"] },
    { name: "Programming & Data", skills: ["<strong>Python</strong> (Pandas, Scikit-learn, TensorFlow)", "MATLAB, Comsol Multiphysics", "SAS Analytics", "<strong>Oracle Data Integrator</strong>", "ETL Pipelines & Data Modeling", "Database Design", "<strong>Azure Cosmos DB</strong>", "Data Modeling Tools: Lucidchart", "UX Design & <strong>Figma</strong>"] },
    { name: "Healthcare Data Standards", skills: ["<strong>HL7 FHIR</strong>", "<strong>OpenEHR</strong>", "Interoperability Workflows", "Medical Signal Analysis (ECG, biosignals)"] },
    { name: "Software Development & Engineering", skills: ["React, HTML, CSS", "<strong>Oracle APEX</strong> (PL/SQL, Triggers, REST APIs)", "REST API Development", "Supabase, MongoDB, Oracle SQL", "Cloud Architecture (<strong>OCI</strong>, <strong>AWS</strong>, <strong>Azure</strong>)", "Kubernetes, Git, Agile"] },
  ],
  certifications: [
      { name: "Certified SAFe® 6 Agile Software Engineer", link: "https://www.credly.com/badges/f3086d0f-4625-4be3-b726-0b263885c31c", logoUrl: "https://media.licdn.com/dms/image/v2/D560BAQFNrAAstbjWhg/company-logo_200_200/B56Zj2xWqLIAAM-/0/1756486790137/scaled_agile_inc__logo?e=1764806400&v=beta&t=FubMv8Y9XXblImPxgqoMN1BHNOlZ9AnK06dtQrPVMFo" },
      { name: "Oracle Data Integrator 12c Specialist", link: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=B08F23039D6D1C0C991B1FC6B3B77D06CA35BB23CAD4BFBD9EE3AD1567B3837D", logoUrl: "https://logos-world.net/wp-content/uploads/2020/09/Oracle-Symbol.png" },
      { name: "Esri Spatial Data Science", link: "https://www.linkedin.com/in/alessio-lerede-6a9a75166/details/certifications/1761206734469/", logoUrl: "https://th.bing.com/th/id/R.2ab5a3ef0bdac4aa5ffff960efee87be?rik=Cf4RvNiodFAtEw&pid=ImgRaw&r=0" },
      { name: "OCI 2025 Data Science Professional", link: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=708AECDC43054576C748A89054CE83A968BFCE9A1E4C68A125D1E92AAFB7AC23", logoUrl: "https://logos-world.net/wp-content/uploads/2020/09/Oracle-Symbol.png" },
      { name: "Oracle APEX Developer Professional", link: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=D5055BBFC419069157C1FBB6C1005E719D2CA71985D6CB7DABA1F19ADC83F45F", logoUrl: "https://logos-world.net/wp-content/uploads/2020/09/Oracle-Symbol.png" },
      { name: "Oracle AI Vector Search Certified Professional", link: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=1E620B493FE3EC3E272A035C0ADA66B5AF30D638453E37EF2FE1E2E90B5C5FFC", logoUrl: "https://logos-world.net/wp-content/uploads/2020/09/Oracle-Symbol.png" },
      { name: "Oracle Cloud Infrastructure 2024 Generative AI Certified Professional", link: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=DF0D0DEA0AD0B83D80B00B636053CE206FDB050FC66FE2289C4B0730173156F5", logoUrl: "https://logos-world.net/wp-content/uploads/2020/09/Oracle-Symbol.png" },
      { name: "Foundational MATLAB", link: "https://www.credly.com/badges/122ae237-a014-4943-b72b-819e671ae9ec/linked_in_profile", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/21/Matlab_Logo.png" },
      { name: "Responsible AI — Google", link: "https://www.skills.google/public_profiles/fcf1e4b9-4a49-4e8b-bf8f-f0c33c9c4f0a/badges/8716360?utm_medium=social&utm_source=linkedin&utm_campaign=ql-social-share", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
      { name: "SAS Pharma", link: "https://www.credly.com/badges/873934a1-4651-433d-a6a4-d36ac6fda53d/linked_in_profile", logoUrl: "https://images.credly.com/images/269ad9cb-7729-43e4-bdfd-bedbcd1543ee/image.png" },
      { name: "Canva Essentials", link: "https://www.canva.com/design-school/certification-award/4c93f466-4036-43bc-a655-1b6bf3ce368a", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Canva_Logo.png" },
      { name: "Foundry & AIP Builder — Palantir", link: "https://verify.skilljar.com/c/gb27h9rury6s", logoUrl: "https://media.licdn.com/dms/image/v2/D4E0BAQFj435hYi7p1A/company-logo_200_200/B4EZXS7uMcHcAI-/0/1743000626250/palantir_technologies_logo?e=1764806400&v=beta&t=mBFXVeJK9RQayFC1Kr_etBf8QSkPBRL04WHnAgnZOm8" }
  ],
  education: [
    { degree: "Master's Degree of Bioengineering for Neuroscience", university: "University of Padua, Italy", period: "2021–2023", thesis: "Valutazione delle proprietà elettrochimiche di biosensori mediante spettroscopia di impedenza." },
    { degree: "Bachelor of Science in Bioengineering", university: "Politecnico di Bari, Italy", period: "2018–2021", thesis: "Sensore fotonico per la misura dell'emoglobina." },
  ],
  experience: [
    { role: "Machine Learning Researcher", company: "NTT DATA Europe & Latam", period: "Oct 2025 – Present", location: "Remote", description: ["Conduct ML research for a large <strong>European healthcare program</strong> (Germany, Switzerland, Italy)", "Develop predictive models and <strong>neural network architectures</strong> for medical imaging", "Implement <strong>GIS-based epidemiology workflows</strong> using Esri ArcGIS and QGIS", "Build <strong>ML pipelines</strong> supporting clinical record processing and interoperability", "Contribute to INAIL process re-engineering using <strong>Oracle SQL, ODI</strong> and modernizing legacy architectures"], logoUrl: "https://media.licdn.com/dms/image/v2/D4E0BAQG7jRpN_AlTzQ/company-logo_200_200/B4EZfDWLjTHgAI-/0/1751329061728/nttdata_logo?e=1764806400&v=beta&t=bWGuz_NapOigPYeihWgR-Ka7rSO9xsbWkMZm1KlYNKo" },
    { role: "Signal Processing Engineer - Freelancer", company: "DataMundi", period: "Nov 2024 – Present", location: "Remote", description: ["Developed <strong>audio signal detection</strong> and <strong>dialect classification</strong> models with Speech-to-Text and ML", "Worked on project SONOS for automatic recognition of <strong>Italian and German dialects</strong>", "Built <strong>deep-learning NLP pipelines</strong> and <strong>LangChain</strong> workflows", "Developed an end-to-end pipeline for <strong>AI-based event generation</strong>, including automated data-collection workflows, audio preprocessing, ML/NLP classification, and LLM-driven event synthesis for scalable production environments"], logoUrl: "https://media.licdn.com/dms/image/v2/D560BAQGoWOPO25JdJQ/company-logo_200_200/B56ZYlplDZHoAI-/0/1744388379540/datamundi_ai_logo?e=1764806400&v=beta&t=RGtX6BpnZFlbSkdhnub_5sye7ls4fMFxwi9AnRkhVuE" },
    { role: "Data & AI Engineer", company: "Deloitte", period: "Apr 2024 – Sep 2025", location: "Hybrid - Bari, Italy", description: ["Leveraged <strong>Oracle Analytics Cloud (OAC)</strong> and <strong>Oracle Cloud Infrastructure (OCI)</strong> to integrate ML workflows and deliver enterprise analytics", "Developed and deployed <strong>LLM-based AI Agents</strong> on AWS (Solaria Platform), using cloud-native AI automation", "Integrated <strong>PAIRD LLM chatbot</strong> across AWS and Azure; optimized <strong>prompt-engineering</strong> strategies for enterprise data querying", "Built enterprise applications with <strong>Oracle APEX</strong> (PL/SQL, REST APIs) and <strong>Oracle Data Integrator (ODI)</strong>, supporting ETL and hierarchical data modeling", "Implemented <strong>ARIMA/SARIMA</strong> forecasting models using Statsmodels and <strong>Oracle DBMS Data Mining</strong>, integrating predictions into automated OAC dashboards and AI Agents"], logoUrl: "https://media.licdn.com/dms/image/v2/C560BAQGNtpblgQpJoQ/company-logo_200_200/company-logo_200_200/0/1662120928214/deloitte_logo?e=1764806400&v=beta&t=tZTYc5LeMc062bku7xdB3aviV7uKcYYtp7G1Yaeepb4" },
    { role: "Junior Business Developer Intelligence", company: "Proxima Group – Next4B (Internship)", period: "Sep 2023 – Mar 2024", location: "Rome, Italy", description: ["Supported <strong>analytics workflows</strong> for insight generation and software enhancement", "Built dashboards and data transformations using <strong>SAS Analytics</strong>", "Collaborated within the Policlinico Gemelli data environment, preparing <strong>ML-ready datasets</strong>"], logoUrl: "https://media.licdn.com/dms/image/v2/D4D0BAQHM1gpfmeOj1w/company-logo_200_200/company-logo_200_200/0/1704276285332/proxima_group_pro_logo?e=1764806400&v=beta&t=KA0TEabBNQBMF63JVQjsb9nxlLthTYRrV4pWeLdVrLk" },
    { role: "Lab Analyst", company: "BIODEVICES LAB", period: "Feb 2023 – Oct 2023", location: "Padua, Italy", description: ["Explored <strong>biosensor configurations</strong> (2–3 electrodes) to optimize performance", "Conducted <strong>cyclic voltammetry</strong> and <strong>impedance spectroscopy (EIS)</strong>", "Simulated biosensor behavior using <strong>COMSOL Multiphysics</strong>"], logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg" },
    { role: "Matlab Student Ambassador", company: "MathWorks", period: "Nov 2021 – Jun 2023", location: "Padua, Italy", description: ["Promoted <strong>MATLAB</strong> tools through workshops and academic initiatives", "Organized events supporting <strong>MATLAB programming</strong> adoption", "Represented MathWorks in conferences and technical demonstrations", "Developed medical imaging models for <strong>tumor segmentation</strong> and retinal disease analysis using MATLAB toolboxes"], logoUrl: "https://media.licdn.com/dms/image/v2/C4D0BAQFSs_qwxqsJBg/company-logo_200_200/company-logo_200_200/0/1631312468202?e=1764806400&v=beta&t=89b7ce_3hhNUdw2wT5fHyS1dDxg0DKAax2VU9F1fC_U" }
  ],
};

function App() {
  const [cvData, setCvData] = useState<CVData>(initialCVData);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('blue');
  const [font, setFont] = useState('inter');
  const [template, setTemplate] = useState('classic');

  const setDataFromPath = (path: string, value: any) => {
    setCvData(prev => {
      // Use a deep copy to avoid direct state mutation.
      const newData = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const fetchCompanyLogo = async (experienceIndex: number) => {
    const companyName = cvData.experience[experienceIndex].company;
    if (!companyName) return;

    setDataFromPath(`experience.${experienceIndex}.isLogoLoading`, true);
    
    try {
      const logoUrl = await findLogo(companyName);
      setDataFromPath(`experience.${experienceIndex}.logoUrl`, logoUrl);
    } catch (error) {
      console.error("Logo fetch failed:", error);
      setDataFromPath(`experience.${experienceIndex}.logoUrl`, ''); // Set to empty for fallback
    } finally {
      setDataFromPath(`experience.${experienceIndex}.isLogoLoading`, false);
    }
  };

  const handleParseResume = async (text: string) => {
    setIsParsing(true);
    setError(null);
    try {
      const parsedData = await parseResumeWithGemini(text);
      // Ensure all arrays are initialized to prevent rendering errors
      parsedData.languages = parsedData.languages || [];
      parsedData.skills = parsedData.skills || [];
      parsedData.certifications = parsedData.certifications || [];
      parsedData.education = parsedData.education || [];
      parsedData.experience = parsedData.experience || [];
      setCvData(parsedData);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <CVEditor 
        data={cvData} 
        setData={setCvData} 
        onParseResume={handleParseResume} 
        isParsing={isParsing}
        theme={theme}
        setTheme={setTheme}
        font={font}
        setFont={setFont}
        template={template}
        setTemplate={setTemplate}
        fetchCompanyLogo={fetchCompanyLogo}
      />
      <main className="flex-1 p-4 lg:p-12 overflow-y-auto">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        <CVPreview 
          data={cvData} 
          theme={theme} 
          font={font} 
          template={template}
          setDataFromPath={setDataFromPath}
          fetchCompanyLogo={fetchCompanyLogo}
        />
      </main>
    </div>
  );
}

export default App;
