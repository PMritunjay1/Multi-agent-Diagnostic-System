import React from 'react';
import { MedicalSpecialty } from '../types';

const IconWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-8 h-8 ${className}`}
  >
    {children}
  </svg>
);

// Symmetrical Medical Cross Icon
export const LogoIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd" />
    </svg>
);

export const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);
  
export const ChevronUpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);

const CardiologistIcon = () => (
    <path fillRule="evenodd" d="M12.964 3.63a1.5 1.5 0 0 0-1.928 0C8.363 5.374 5.25 8.123 5.25 12.375c0 4.106 3.957 6.474 6.75 8.016 2.793-1.542 6.75-3.91 6.75-8.016 0-4.252-3.113-6.999-5.786-8.745Z" clipRule="evenodd" />
);

const PsychologistIcon = () => (
    <path d="M11.25 4.5A5.25 5.25 0 0 0 6 9.75v.75c-1.28.22-2.25 1.34-2.25 2.625v.75c0 1.285 1.043 2.328 2.328 2.453C7.03 17.69 8.62 19.5 11.25 19.5c2.63 0 4.22-1.81 5.172-3.118A2.5 2.5 0 0 0 18.75 13.5v-.75c0-1.285-.97-2.405-2.25-2.625v-.75A5.25 5.25 0 0 0 11.25 4.5Z" />
);

const PulmonologistIcon = () => (
    <path d="M18.375 5.25a2.25 2.25 0 0 1 2.25 2.25v9.75A2.25 2.25 0 0 1 18.375 19.5h-2.522a.75.75 0 0 1 0-1.5h2.522a.75.75 0 0 0 .75-.75V7.5a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 1-.75-.75V3.75a.75.75 0 0 1 .75-.75h2.25Zm-6.75 0h2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 0-.75.75v9a.75.75 0 0 0 .75.75h2.25a.75.75 0 0 1 0 1.5h-2.25a2.25 2.25 0 0 1-2.25-2.25v-9a2.25 2.25 0 0 1 2.25-2.25Zm-4.125 0h2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 0-.75.75v9.75a.75.75 0 0 0 .75.75h2.522a.75.75 0 0 1 0 1.5H5.625a2.25 2.25 0 0 1-2.25-2.25V7.5a2.25 2.25 0 0 1 2.25-2.25Z" />
);

const NeurologistIcon = () => (
    <path fillRule="evenodd" d="M11.91 4.84a1.23 1.23 0 0 1 1.257 1.126 1.23 1.23 0 0 1-1.257 1.126h-1.047a1.047 1.047 0 1 0 0 2.094h2.094a1.047 1.047 0 1 0 0-2.094h-1.047a.175.175 0 0 1 0-.349h1.047a2.322 2.322 0 1 0 0-4.643h-1.047a1.23 1.23 0 0 1-1.07-1.928A2.5 2.5 0 0 1 14.5 3c2.04 0 3.84 1.53 4.417 3.518A1.23 1.23 0 0 1 17.75 7.643a1.23 1.23 0 0 1-1.126-1.257A1.75 1.75 0 0 0 14.5 4.5c-.966 0-1.75.784-1.75 1.75v.23c0 .386.191.748.508 1.002a2.094 2.094 0 1 1 0 4.188v.175c0 .966.784 1.75 1.75 1.75s1.75-.784 1.75-1.75a1.23 1.23 0 1 1 2.46 0c0 2.4-1.97 4.375-4.375 4.375a4.375 4.375 0 0 1-4.375-4.375v-.175a2.094 2.094 0 1 1 0 -4.188c-.317-.254-.508-.616-.508-1.002v-3.08a.656.656 0 0 1 .656-.656h.656c.362 0 .656.294.656.656v2.333a.175.175 0 0 0 .175.175h.349a.175.175 0 0 0 .175-.175V5.5c0-.966-.784-1.75-1.75-1.75a2.5 2.5 0 0 0-2.42 1.928Z" clipRule="evenodd" />
);

const EndocrinologistIcon = () => (
    <>
        <path fillRule="evenodd" d="M12 5.25a.75.75 0 0 1 .75.75v.01a5.25 5.25 0 0 1 2.48 9.385A.75.75 0 0 1 14.25 16.5v.01a5.25 5.25 0 0 1-4.5 0v-.01a.75.75 0 0 1-1.02-.906 5.25 5.25 0 0 1 2.48-9.385v-.01a.75.75 0 0 1 .75-.75Zm.75 3.01a.75.75 0 0 0-1.5 0v5.48a.75.75 0 0 0 1.5 0v-5.48Z" clipRule="evenodd" />
        <path d="M12.98 2.24a.75.75 0 0 1 1.06 0l3 3a.75.75 0 1 1-1.06 1.06l-1.72-1.72v3.88a.75.75 0 0 1-1.5 0V5.58L11.03 7.3a.75.75 0 1 1-1.06-1.06l3-3ZM12 17.25a.75.75 0 0 1 .75.75v3.88l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V18a.75.75 0 0 1 .75-.75Z" />
    </>
);

const ImmunologistIcon = () => (
    <>
        <path fillRule="evenodd" d="M10.5 3.75a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.31L6.22 9.22a.75.75 0 0 1-1.06-1.06L9.19 4.19h-3.94a.75.75 0 1 1 0-1.5h4.5a.75.75 0 0 1 .75.75Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M3 8.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75H2.25a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75H3Zm18 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75H21Zm-6.75 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75h.75Zm-6 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75V9a.75.75 0 0 1 .75-.75h.75Z" clipRule="evenodd" />
    </>
);


const GastroenterologistIcon = () => (
    <path fillRule="evenodd" d="M10.273 4.88a.75.75 0 0 1 .363 1.134 6.75 6.75 0 0 1 0 11.972.75.75 0 1 1-.726 1.134 8.25 8.25 0 0 0 0-14.24.75.75 0 0 1 1.134-.363Zm3.454 0a.75.75 0 0 1 1.134.363 8.25 8.25 0 0 1 0 14.24.75.75 0 1 1-.726-1.134 6.75 6.75 0 0 0 0-11.972.75.75 0 0 1-.363-1.134Z" clipRule="evenodd" />
);

const NephrologistIcon = () => (
    <path d="M12.75 2.25a.75.75 0 0 0-1.5 0v.512c-1.353.11-2.651.488-3.834 1.107A1.5 1.5 0 0 0 6 5.43v10.14a1.5 1.5 0 0 0 1.416 1.492c1.183.618 2.481.995 3.834 1.107v.512a.75.75 0 0 0 1.5 0v-.512c1.353-.11 2.651-.488 3.834-1.107A1.5 1.5 0 0 0 18 15.57V5.43a1.5 1.5 0 0 0-1.416-1.492A9.998 9.998 0 0 0 12.75 2.762V2.25Z" />
);

const HematologistIcon = () => (
    <path fillRule="evenodd" d="M11.64 3.6a.75.75 0 0 1 .75.75v.01c0 1.34.445 2.645 1.22 3.72.775 1.075 1.89 2.055 1.89 3.42 0 2.4-1.95 4.35-4.35 4.35S6.8 14.22 6.8 11.82c0-1.365 1.115-2.345 1.89-3.42.775-1.075 1.22-2.38 1.22-3.72V4.35a.75.75 0 0 1 .75-.75h.98Z" clipRule="evenodd" />
);

const OncologistIcon = () => (
    <path fillRule="evenodd" d="M11.583 3.33a.75.75 0 0 1 .834.67l.034.205c.813 4.933-2.138 9.53-6.57 11.417a.75.75 0 0 1-.951-.628l-.053-.257C4.062 10.3 6.84 5.92 11.583 3.33ZM12.417 3.33c4.743 2.59 7.521 6.97 6.706 11.432l-.053.257a.75.75 0 0 1-.951.628c-4.432-1.886-7.383-6.484-6.57-11.417l.034-.205a.75.75 0 0 1 .834-.67Z" clipRule="evenodd" />
);

const RadiologistIcon = () => (
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-3.323 3.427a.75.75 0 0 1 .91 1.185l-1.956 2.347h1.494a.75.75 0 0 1 .102 1.493l-4.023.252a.75.75 0 0 1-.723-.882l.867-4.023a.75.75 0 0 1 1.185.91L5.94 9.19l2.737-3.513Z" clipRule="evenodd" />
);

const SpecialtyIcon: React.FC<{ specialty: MedicalSpecialty, className?: string }> = ({ specialty, className }) => {
  const icons: Record<MedicalSpecialty, React.ReactNode> = {
    [MedicalSpecialty.Cardiologist]: <CardiologistIcon />,
    [MedicalSpecialty.Psychologist]: <PsychologistIcon />,
    [MedicalSpecialty.Pulmonologist]: <PulmonologistIcon />,
    [MedicalSpecialty.Neurologist]: <NeurologistIcon />,
    [MedicalSpecialty.Endocrinologist]: <EndocrinologistIcon />,
    [MedicalSpecialty.Immunologist]: <ImmunologistIcon />,
    [MedicalSpecialty.Gastroenterologist]: <GastroenterologistIcon />,
    [MedicalSpecialty.Nephrologist]: <NephrologistIcon />,
    [MedicalSpecialty.Hematologist]: <HematologistIcon />,
    [MedicalSpecialty.Oncologist]: <OncologistIcon />,
    [MedicalSpecialty.Radiologist]: <RadiologistIcon />,
  };

  return <IconWrapper className={className}>{icons[specialty]}</IconWrapper>;
};

export default SpecialtyIcon;