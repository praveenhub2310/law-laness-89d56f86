
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Mail, Phone, Calendar, Award, DollarSign, FileText, Save } from 'lucide-react';

const Profile = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [advocateData, setAdvocateData] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: '',
    specialization: [],
    hourly_rate: '',
    experience_years: '',
    bar_number: ''
  });

  useEffect(() => {
    if (userProfile) {
      setProfileData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        bio: '',
        specialization: [],
        hourly_rate: '',
        experience_years: '',
        bar_number: ''
      });
      fetchAdvocateData();
    }
  }, [userProfile]);

  const fetchAdvocateData = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('advocates')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching advocate data:', error);
        return;
      }

      if (data) {
        setAdvocateData(data);
        setProfileData(prev => ({
          ...prev,
          bio: data.bio || '',
          specialization: data.specialization || [],
          hourly_rate: data.hourly_rate ? data.hourly_rate.toString() : '',
          experience_years: data.experience_years ? data.experience_years.toString() : '',
          bar_number: data.bar_number || ''
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update advocates table
      const advocateUpdate = {
        bio: profileData.bio,
        specialization: profileData.specialization,
        hourly_rate: profileData.hourly_rate ? parseFloat(profileData.hourly_rate) : null,
        experience_years: profileData.experience_years ? parseInt(profileData.experience_years) : null,
        bar_number: profileData.bar_number
      };

      if (advocateData) {
        const { error: advocateError } = await supabase
          .from('advocates')
          .update(advocateUpdate)
          .eq('id', user.id);

        if (advocateError) throw advocateError;
      } else {
        const { error: advocateError } = await supabase
          .from('advocates')
          .insert({ id: user.id, ...advocateUpdate });

        if (advocateError) throw advocateError;
      }

      toast.success('Profile updated successfully');
      fetchAdvocateData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSpecialization = (spec: string) => {
    if (spec && !profileData.specialization.includes(spec)) {
      setProfileData(prev => ({
        ...prev,
        specialization: [...prev.specialization, spec]
      }));
    }
  };

  const removeSpecialization = (spec: string) => {
    setProfileData(prev => ({
      ...prev,
      specialization: prev.specialization.filter(s => s !== spec)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bar_number">Bar Number</Label>
              <Input
                id="bar_number"
                value={profileData.bar_number}
                onChange={(e) => setProfileData(prev => ({ ...prev, bar_number: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={profileData.experience_years}
                  onChange={(e) => setProfileData(prev => ({ ...prev, experience_years: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={profileData.hourly_rate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Specializations</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.specialization.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSpecialization(spec)}>
                    {spec} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => addSpecialization('Criminal Law')}>
                  + Criminal Law
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addSpecialization('Civil Law')}>
                  + Civil Law
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => addSpecialization('Family Law')}>
                  + Family Law
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Professional Bio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Tell us about your professional background, expertise, and approach to practicing law..."
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              rows={4}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
