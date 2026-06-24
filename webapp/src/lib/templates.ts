export interface Template {
  id: string;
  name: string;
  description: string;
  columns: 'single' | 'two-column';
  style: 'classic' | 'modern' | 'minimal' | 'bold' | 'creative' | 'executive' | 'tech' | 'elegant' | 'compact' | 'sidebar';
  accentColor: string;
  preview?: string;
}

export const TEMPLATES: Template[] = [
  { id: 'classic', name: 'Classic', description: 'Timeless single-column layout, ATS-optimized', columns: 'single', style: 'classic', accentColor: '#1a1a2e' },
  { id: 'modern', name: 'Modern', description: 'Clean lines with bold section dividers', columns: 'single', style: 'modern', accentColor: '#2563eb' },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-clean whitespace-driven design', columns: 'single', style: 'minimal', accentColor: '#374151' },
  { id: 'executive', name: 'Executive', description: 'Premium two-column for senior professionals', columns: 'two-column', style: 'executive', accentColor: '#7c3aed' },
  { id: 'tech', name: 'Tech', description: 'Developer-friendly with skills matrix', columns: 'two-column', style: 'tech', accentColor: '#0891b2' },
  { id: 'creative', name: 'Creative', description: 'Bold typography for agencies and startups', columns: 'single', style: 'creative', accentColor: '#dc2626' },
  { id: 'elegant', name: 'Elegant', description: 'Serif typography, luxury feel', columns: 'single', style: 'elegant', accentColor: '#92400e' },
  { id: 'sidebar', name: 'Sidebar Pro', description: 'Dark sidebar with light content area', columns: 'two-column', style: 'sidebar', accentColor: '#1e293b' },
  { id: 'compact', name: 'Compact', description: 'Fits more on one page, precise layout', columns: 'single', style: 'compact', accentColor: '#166534' },
  { id: 'bold', name: 'Bold Statement', description: 'Large name, high-impact visual hierarchy', columns: 'single', style: 'bold', accentColor: '#be185d' },
];
