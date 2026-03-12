import { Project, Municipality } from './types';

// Projects across Flanders
export const projects: Project[] = [
  { id: 'p1', name: 'Nieuw Administratief Centrum', firmId: 'f5', firmName: 'BURO II', lat: 50.93, lng: 3.14, status: 'active', significance: 'large' },
  { id: 'p2', name: 'Ecowijk Dampoort', firmId: 'f2', firmName: 'ARCADIS', lat: 51.07, lng: 3.74, status: 'active', significance: 'large' },
  { id: 'p3', name: 'Renovatie Stadsbibliotheek', firmId: 'f1', firmName: 'Bureau Bouwtechniek', lat: 51.20, lng: 4.39, status: 'active', significance: 'medium' },
  { id: 'p4', name: 'Campus Universiteit Leuven', firmId: 'f10', firmName: 'B-architecten', lat: 50.86, lng: 4.68, status: 'active', significance: 'large' },
  { id: 'p5', name: 'Sociale Woningen Kiel', firmId: 'f1', firmName: 'Bureau Bouwtechniek', lat: 51.19, lng: 4.38, status: 'active', significance: 'medium' },
  { id: 'p6', name: 'Tech Park Zaventem', firmId: 'f6', firmName: 'Tractebel', lat: 50.88, lng: 4.47, status: 'active', significance: 'large' },
  { id: 'p7', name: 'Cultureel Centrum Brugge', firmId: 'f4', firmName: 'ANTEA GROUP', lat: 51.20, lng: 3.23, status: 'active', significance: 'medium' },
  { id: 'p8', name: 'Bedrijvenpark Hasselt', firmId: 'f3', firmName: 'Sweco', lat: 50.93, lng: 5.34, status: 'active', significance: 'large' },
  { id: 'p9', name: 'Residentie Park Aalst', firmId: 'f12', firmName: 'noAarchitecten', lat: 50.94, lng: 4.04, status: 'active', significance: 'medium' },
  { id: 'p10', name: 'Ziekenhuis Uitbreiding Kortrijk', firmId: 'f7', firmName: 'VK Architects', lat: 50.83, lng: 3.27, status: 'active', significance: 'large' },
  { id: 'p11', name: 'Kantoorgebouw Berchem', firmId: 'f1', firmName: 'Bureau Bouwtechniek', lat: 51.18, lng: 4.43, status: 'completed', significance: 'medium' },
  { id: 'p12', name: 'Appartementen Sint-Niklaas', firmId: 'f11', firmName: 'Robbrecht en Daem', lat: 51.16, lng: 4.14, status: 'completed', significance: 'small' },
  { id: 'p13', name: 'Museum Renovatie Gent', firmId: 'f2', firmName: 'ARCADIS', lat: 51.05, lng: 3.70, status: 'completed', significance: 'large' },
  { id: 'p14', name: 'School Herentals', firmId: 'f8', firmName: 'STRAMIEN', lat: 51.18, lng: 4.83, status: 'completed', significance: 'medium' },
  { id: 'p15', name: 'Woontoren Oostende', firmId: 'f13', firmName: 'Bovenbouw', lat: 51.23, lng: 2.92, status: 'completed', significance: 'medium' },
  { id: 'p16', name: 'Sportcomplex Genk', firmId: 'f15', firmName: '51N4E', lat: 50.97, lng: 5.50, status: 'completed', significance: 'large' },
  { id: 'p17', name: 'Retail Park Turnhout', firmId: 'f9', firmName: 'Crepain Binst', lat: 51.32, lng: 4.95, status: 'completed', significance: 'medium' },
  { id: 'p18', name: 'Woonproject Dendermonde', firmId: 'f14', firmName: 'De Smet Vermeulen', lat: 51.03, lng: 4.10, status: 'completed', significance: 'small' },
  { id: 'p19', name: 'Logistiek Centrum Mechelen', firmId: 'f8', firmName: 'STRAMIEN', lat: 51.01, lng: 4.48, status: 'completed', significance: 'large' },
  { id: 'p20', name: 'Gemeentehuis Vilvoorde', firmId: 'f6', firmName: 'Tractebel', lat: 50.93, lng: 4.43, status: 'completed', significance: 'medium' },
];

// Municipalities collaborating with OxiCloud
export const municipalities: Municipality[] = [
  { id: 'm1', name: 'Gemeente Aarschot', lat: 50.99, lng: 4.83, projectCount: 3, since: '2024' },
  { id: 'm2', name: 'Gemeente Leuven', lat: 50.88, lng: 4.70, projectCount: 8, since: '2023' },
  { id: 'm3', name: 'Stad Mechelen', lat: 51.03, lng: 4.48, projectCount: 5, since: '2024' },
  { id: 'm4', name: 'Gemeente Herentals', lat: 51.18, lng: 4.83, projectCount: 2, since: '2025' },
  { id: 'm5', name: 'Stad Turnhout', lat: 51.32, lng: 4.95, projectCount: 4, since: '2024' },
  { id: 'm6', name: 'Stad Hasselt', lat: 50.93, lng: 5.34, projectCount: 6, since: '2023' },
  { id: 'm7', name: 'Gemeente Mol', lat: 51.19, lng: 5.12, projectCount: 2, since: '2025' },
  { id: 'm8', name: 'Stad Gent', lat: 51.06, lng: 3.72, projectCount: 12, since: '2023' },
  { id: 'm9', name: 'Stad Brugge', lat: 51.21, lng: 3.22, projectCount: 4, since: '2024' },
  { id: 'm10', name: 'Stad Antwerpen', lat: 51.22, lng: 4.40, projectCount: 15, since: '2023' },
  { id: 'm11', name: 'Stad Kortrijk', lat: 50.83, lng: 3.27, projectCount: 3, since: '2024' },
  { id: 'm12', name: 'Gemeente Vilvoorde', lat: 50.93, lng: 4.43, projectCount: 2, since: '2025' },
];
