import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserCheck, Phone, Mail, Calendar, Award, DollarSign, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LawyerDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bar_number?: string;
  specialization?: string[];
  experience_years?: number;
  hourly_rate?: number;
  availability_status?: string;
  bio?: string;
}

interface CaseInfo {
  id: string;
  case_number: string;
  title: string;
  status: string;
}

const AssignedAdvocate = () => {
  const { user } = useAuth();
  const [lawyer, setLawyer] = useState<LawyerDetails | null>(null);
  const [cases, setCases] = useState<CaseInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssignedLawyer();
    }
  }, [user]);

  const fetchAssignedLawyer = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Debug: Current user ID:', user?.id);
      console.log('🔍 Debug: Current user email:', user?.email);
      
      // Force clear any caches and add more debugging
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, case_number, title, status, lawyer_id, client_id, created_at')
        .eq('client_id', user?.id);

      console.log('🔍 Debug: ALL Projects query result (including null lawyers):', projects);
      console.log('🔍 Debug: Projects query error:', projectsError);

      if (projectsError) {
        console.error('❌ Error fetching projects:', projectsError);
        toast.error('Failed to load cases: ' + projectsError.message);
        return;
      }

      // Filter projects with lawyers
      const projectsWithLawyers = projects?.filter(p => p.lawyer_id) || [];
      console.log('🔍 Debug: Projects with lawyers:', projectsWithLawyers);

      if (!projectsWithLawyers || projectsWithLawyers.length === 0) {
        console.log('🔍 Debug: No projects with lawyers found for user');
        setLoading(false);
        return;
      }

      // Get unique lawyer IDs from projects with lawyers
      const lawyerIds = [...new Set(projectsWithLawyers.map(p => p.lawyer_id).filter(Boolean))];
      console.log('🔍 Debug: Unique lawyer IDs:', lawyerIds);
      
      if (lawyerIds.length === 0) {
        console.log('🔍 Debug: No lawyer IDs found');
        setLoading(false);
        return;
      }

      // For now, get the first lawyer (you could modify this to handle multiple lawyers)
      const primaryLawyerId = lawyerIds[0];
      console.log('🔍 Debug: Primary lawyer ID:', primaryLawyerId);

      // Fetch lawyer profile information
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone')
        .eq('id', primaryLawyerId);

      console.log('🔍 Debug: Lawyer profile query result:', profileData);
      console.log('🔍 Debug: Lawyer profile query error:', profileError);

      if (profileError) {
        console.error('❌ Error fetching lawyer profile:', profileError);
        toast.error('Failed to load lawyer profile: ' + profileError.message);
        return;
      }

      if (!profileData || profileData.length === 0) {
        console.error('❌ No lawyer profile found for ID:', primaryLawyerId);
        toast.error('Lawyer profile not found');
        return;
      }

      const lawyerProfile = profileData[0]; // Get first result

      // Fetch advocate-specific information
      const { data: advocateData, error: advocateError } = await supabase
        .from('advocates')
        .select('bar_number, specialization, experience_years, hourly_rate, availability_status, bio')
        .eq('id', primaryLawyerId);

      console.log('🔍 Debug: Advocate data query result:', advocateData);
      console.log('🔍 Debug: Advocate data query error:', advocateError);

      if (advocateError) {
        console.error('❌ Error fetching advocate details:', advocateError);
        // Don't return here, just log the error and continue with basic profile
      }

      const advocateProfile = advocateData && advocateData.length > 0 ? advocateData[0] : {};

      // Combine the data
      const lawyerDetails: LawyerDetails = {
        ...lawyerProfile,
        ...advocateProfile
      };

      console.log('🔍 Debug: Final lawyer details:', lawyerDetails);
      setLawyer(lawyerDetails);
      setCases(projectsWithLawyers.filter(p => p.lawyer_id === primaryLawyerId).map(p => ({
        id: p.id,
        case_number: p.case_number,
        title: p.title,
        status: p.status
      })));

    } catch (error) {
      console.error('Error fetching lawyer details:', error);
      toast.error('Failed to load lawyer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Lawyer</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Lawyer</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>No Assigned Lawyer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don't have a lawyer assigned to your cases yet. Please contact our support team if you need assistance.
            </p>
            <Button>Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <UserCheck className="h-6 w-6" />
        <h1 className="text-3xl font-bold">My Lawyer</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lawyer Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              {lawyer.first_name} {lawyer.last_name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={lawyer.availability_status === 'available' ? 'default' : 'secondary'}>
                {lawyer.availability_status || 'Available'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{lawyer.email}</span>
              </div>
              {lawyer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{lawyer.phone}</span>
                </div>
              )}
            </div>

            {/* Professional Details */}
            <div className="space-y-2">
              {lawyer.bar_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span>Bar Number: {lawyer.bar_number}</span>
                </div>
              )}
              {lawyer.experience_years && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{lawyer.experience_years} years experience</span>
                </div>
              )}
              {lawyer.hourly_rate && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${lawyer.hourly_rate}/hour</span>
                </div>
              )}
            </div>

            {/* Specializations */}
            {lawyer.specialization && lawyer.specialization.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-1">
                  {lawyer.specialization.map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {lawyer.bio && (
              <div>
                <h4 className="font-medium text-sm mb-1">About</h4>
                <p className="text-sm text-muted-foreground">{lawyer.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cases Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Assigned Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cases.length > 0 ? (
              <div className="space-y-3">
                {cases.map((case_item) => (
                  <div key={case_item.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{case_item.case_number}</h4>
                      <Badge variant="outline" className="text-xs">
                        {case_item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{case_item.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No cases assigned yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button size="sm" variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Request Call
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignedAdvocate;