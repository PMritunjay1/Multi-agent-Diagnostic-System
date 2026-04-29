
import { Agent, MedicalSpecialty } from './types';

export const SPECIALIST_AGENTS: Agent[] = [
  { name: MedicalSpecialty.Cardiologist, description: "Analyzes heart and blood vessel conditions." },
  { name: MedicalSpecialty.Pulmonologist, description: "Focuses on the respiratory system." },
  { name: MedicalSpecialty.Neurologist, description: "Diagnoses and treats nervous system disorders." },
  { name: MedicalSpecialty.Gastroenterologist, description: "Specializes in the digestive system." },
  { name: MedicalSpecialty.Endocrinologist, description: "Deals with hormones and glands." },
  { name: MedicalSpecialty.Immunologist, description: "Manages immune system disorders." },
  { name: MedicalSpecialty.Nephrologist, description: "Focuses on kidney health." },
  { name: MedicalSpecialty.Hematologist, description: "Studies blood, and blood-forming organs." },
  { name: MedicalSpecialty.Oncologist, description: "Treats cancer and tumors." },
  { name: MedicalSpecialty.Radiologist, description: "Interprets medical images." },
  { name: MedicalSpecialty.Psychologist, description: "Assesses mental and emotional health." },
];
