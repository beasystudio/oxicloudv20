import { useState } from 'react';
import { TopNavigation } from '@/components/TopNavigation';
import { AuthorityProjectList } from '@/components/authority/AuthorityProjectList';
import { AuthorityValidationView } from '@/components/authority/AuthorityValidationView';

export interface SubmittedProject {
  id: string;
  projectId: string;
  applicant: string;
  applicantCompany: string;
  projectName: string;
  location: string;
  submissionDate: string;
  calculationStatus: 'valid' | 'needs_clarification' | 'exceeds_threshold';
  legalDecision: 'below_threshold' | 'conditional' | 'exceeds_threshold';
  natura2000Site: string;
  natura2000Code: string;
  distanceToSite: number;
  kdwValue: number;
  overallImpactPercent: number;
  engineVersion: string;
  datasetVersion: string;
  legalFrameworkVersion: string;
  calculatedAt: string;
}

// Mock submitted projects for validation
const mockSubmittedProjects: SubmittedProject[] = [
  {
    id: 'sub-001',
    projectId: 'PRJ-2025-001',
    applicant: 'Jan Vermeersch',
    applicantCompany: 'GDesign Architects BVBA',
    projectName: 'Residentie Zonnewende',
    location: 'Tervuursesteenweg 45, 3001 Heverlee',
    submissionDate: '2025-01-15',
    calculationStatus: 'valid',
    legalDecision: 'below_threshold',
    natura2000Site: 'Dijlevallei',
    natura2000Code: 'BE2400014',
    distanceToSite: 850,
    kdwValue: 14.0,
    overallImpactPercent: 0.42,
    engineVersion: 'OxiCloud v2.1.0',
    datasetVersion: 'VITO-EF-2025-Q1',
    legalFrameworkVersion: 'Stikstofdecreet v1.2',
    calculatedAt: '2025-01-14T14:32:00Z'
  },
  {
    id: 'sub-002',
    projectId: 'PRJ-2025-002',
    applicant: 'Marie Claessens',
    applicantCompany: 'BURO+ Architecture',
    projectName: 'Industrieterrein Noord Fase 2',
    location: 'Havenstraat 120, 2000 Antwerpen',
    submissionDate: '2025-01-18',
    calculationStatus: 'exceeds_threshold',
    legalDecision: 'exceeds_threshold',
    natura2000Site: 'Scheldevallei',
    natura2000Code: 'BE2301336',
    distanceToSite: 320,
    kdwValue: 8.5,
    overallImpactPercent: 1.87,
    engineVersion: 'OxiCloud v2.1.0',
    datasetVersion: 'VITO-EF-2025-Q1',
    legalFrameworkVersion: 'Stikstofdecreet v1.2',
    calculatedAt: '2025-01-17T09:15:00Z'
  },
  {
    id: 'sub-003',
    projectId: 'PRJ-2025-003',
    applicant: 'Peter Janssens',
    applicantCompany: 'Immobel SA',
    projectName: 'Mixed-Use Development Leuven',
    location: 'Bondgenotenlaan 88, 3000 Leuven',
    submissionDate: '2025-01-20',
    calculationStatus: 'needs_clarification',
    legalDecision: 'conditional',
    natura2000Site: 'Dijlevallei',
    natura2000Code: 'BE2400014',
    distanceToSite: 1200,
    kdwValue: 14.0,
    overallImpactPercent: 0.95,
    engineVersion: 'OxiCloud v2.1.0',
    datasetVersion: 'VITO-EF-2025-Q1',
    legalFrameworkVersion: 'Stikstofdecreet v1.2',
    calculatedAt: '2025-01-19T16:45:00Z'
  }
];

const AuthorityDashboard = () => {
  const [selectedProject, setSelectedProject] = useState<SubmittedProject | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <div className="container mx-auto p-6">
        {selectedProject ? (
          <AuthorityValidationView 
            project={selectedProject} 
            onBack={() => setSelectedProject(null)} 
          />
        ) : (
          <AuthorityProjectList 
            projects={mockSubmittedProjects} 
            onSelectProject={setSelectedProject} 
          />
        )}
      </div>
    </div>
  );
};

export default AuthorityDashboard;
