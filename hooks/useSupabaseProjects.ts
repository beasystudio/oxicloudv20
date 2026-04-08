/**
 * Hook for managing projects with Supabase
 * Provides full CRUD operations and NOx workflow integration
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Project, Contact as ProjectContact } from '@/types/project';
import { 
  getNoxDataByProjectId, 
  initializeNoxProject, 
  saveNoxPreEstimation,
  generateNoxPrice,
  setNoxAwaitingPayment,
  processNoxPayment,
  saveNoxDetailedCalculation,
  markNoxReportDelivered,
  createQuote,
  markQuoteSent,
  type NoxProjectData
} from '@/lib/supabaseNoxStore';
import type { PreEstimationData, DetailedCalculationData, OxiCloudProjectStatus } from '@/types/oxicloud';

export interface NoxProject extends Project {
  noxData?: NoxProjectData;
}

export function useSupabaseProjects() {
  const [projects, setProjects] = useState<NoxProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all projects with NOx data
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProjects([]);
        return;
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch NOx data for all projects
      const projectsWithNox: NoxProject[] = await Promise.all(
        (projectsData || []).map(async (project) => {
          const noxData = await getNoxDataByProjectId(project.id);
          return { ...project, noxData: noxData || undefined };
        })
      );

      setProjects(projectsWithNox);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Create a new project
  const createProject = async (projectData: {
    name: string;
    project_number: string;
    status: string;
    project_type?: string;
    address?: string;
    lat?: number;
    lng?: number;
    overview?: string;
  }): Promise<Project | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Project Created',
        description: `${data.name} has been created successfully.`,
      });

      await fetchProjects();
      return data;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Add contact to project
  const addProjectContact = async (
    projectId: string,
    contact: {
      firm_name: string;
      contact_person: string;
      contact_type: string;
      email?: string;
      phone?: string;
      mobile?: string;
      address?: string;
    }
  ): Promise<ProjectContact | null> => {
    try {
      const { data, error } = await supabase
        .from('project_contacts')
        .insert({
          project_id: projectId,
          ...contact,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Contact Added',
        description: `${contact.contact_person} has been added to the project.`,
      });

      return data;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Get project contacts
  const getProjectContacts = async (projectId: string): Promise<ProjectContact[]> => {
    try {
      const { data, error } = await supabase
        .from('project_contacts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching project contacts:', err);
      return [];
    }
  };

  // Start NOx workflow for a project
  const startNoxWorkflow = async (projectId: string): Promise<NoxProjectData | null> => {
    try {
      const noxData = await initializeNoxProject(projectId);
      await fetchProjects();
      return noxData;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Submit pre-estimation
  const submitPreEstimation = async (
    projectId: string,
    data: PreEstimationData
  ): Promise<NoxProjectData | null> => {
    try {
      await saveNoxPreEstimation(projectId, data);
      const result = await generateNoxPrice(projectId);
      await fetchProjects();
      return result;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Send quote to client
  const sendQuote = async (
    projectId: string,
    endClient: { name: string; email: string },
    companyId: string
  ): Promise<string | null> => {
    try {
      // Get the price data
      const noxData = await getNoxDataByProjectId(projectId);
      if (!noxData?.price_data) throw new Error('No price data available');

      // Create quote in database
      const quoteNumber = await createQuote({
        projectId,
        amount: noxData.price_data.basePrice,
        vatAmount: noxData.price_data.vat,
        totalAmount: noxData.price_data.totalPrice,
        clientContactName: endClient.name,
        clientContactEmail: endClient.email,
        companyId,
      });

      if (!quoteNumber) throw new Error('Failed to create quote');

      // Mark quote as sent
      await markQuoteSent(quoteNumber);
      await setNoxAwaitingPayment(projectId);
      await fetchProjects();

      toast({
        title: 'Quote Sent',
        description: `Quote ${quoteNumber} has been sent to ${endClient.email}.`,
      });

      return quoteNumber;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Process payment
  const handlePayment = async (projectId: string, vatNumber?: string): Promise<boolean> => {
    try {
      await processNoxPayment(projectId, vatNumber);
      await fetchProjects();

      toast({
        title: 'Payment Processed',
        description: 'The calculation module is now unlocked.',
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Submit detailed calculation
  const submitDetailedCalculation = async (
    projectId: string,
    data: DetailedCalculationData
  ): Promise<NoxProjectData | null> => {
    try {
      const result = await saveNoxDetailedCalculation(projectId, data);
      await fetchProjects();

      toast({
        title: 'Calculation Complete',
        description: 'Your NOx assessment results are ready.',
      });

      return result;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Mark report as delivered
  const deliverReport = async (projectId: string): Promise<boolean> => {
    try {
      await markNoxReportDelivered(projectId);
      await fetchProjects();
      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Project Deleted',
        description: 'The project has been removed.',
      });

      await fetchProjects();
      return true;
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    deleteProject,
    addProjectContact,
    getProjectContacts,
    startNoxWorkflow,
    submitPreEstimation,
    sendQuote,
    handlePayment,
    submitDetailedCalculation,
    deliverReport,
  };
}
