
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  const systemSettings = [
    {
      category: "General",
      settings: [
        { name: "System Name", value: "Akra Legal Case Management", type: "text" },
        { name: "Time Zone", value: "EST (UTC-5)", type: "select" },
        { name: "Date Format", value: "MM/DD/YYYY", type: "select" },
        { name: "Language", value: "English (US)", type: "select" }
      ]
    },
    {
      category: "Security",
      settings: [
        { name: "Two-Factor Authentication", value: true, type: "toggle" },
        { name: "Password Expiry (days)", value: "90", type: "number" },
        { name: "Session Timeout (minutes)", value: "30", type: "number" },
        { name: "Failed Login Attempts", value: "3", type: "number" }
      ]
    },
    {
      category: "Notifications",
      settings: [
        { name: "Email Notifications", value: true, type: "toggle" },
        { name: "SMS Notifications", value: false, type: "toggle" },
        { name: "Browser Notifications", value: true, type: "toggle" },
        { name: "Case Update Alerts", value: true, type: "toggle" }
      ]
    },
    {
      category: "Backup & Storage",
      settings: [
        { name: "Auto Backup", value: true, type: "toggle" },
        { name: "Backup Frequency", value: "Daily", type: "select" },
        { name: "Storage Limit (GB)", value: "100", type: "number" },
        { name: "Data Retention (years)", value: "7", type: "number" }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Reset to Defaults</Button>
          <Button className="legal-gradient">Save Changes</Button>
        </div>
      </div>

      {systemSettings.map((section, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{section.category}</span>
              <Badge variant="outline">{section.settings.length} settings</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {section.settings.map((setting, settingIndex) => (
                <div key={settingIndex}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-medium">{setting.name}</label>
                    </div>
                    <div className="w-64">
                      {setting.type === 'toggle' ? (
                        <div className="flex items-center space-x-2">
                          <Switch checked={setting.value as boolean} />
                          <span className="text-sm text-gray-600">
                            {setting.value ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ) : setting.type === 'text' || setting.type === 'number' ? (
                        <Input 
                          type={setting.type} 
                          value={setting.value as string} 
                          className="w-full"
                        />
                      ) : (
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value={setting.value as string}>{setting.value}</option>
                        </select>
                      )}
                    </div>
                  </div>
                  {settingIndex < section.settings.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Version</p>
              <p className="text-sm text-gray-600">1.0.0</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-sm text-gray-600">January 12, 2024</p>
            </div>
            <div>
              <p className="text-sm font-medium">Database Status</p>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Server Status</p>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Storage Used</p>
              <p className="text-sm text-gray-600">45.2 GB / 100 GB</p>
            </div>
            <div>
              <p className="text-sm font-medium">Active Users</p>
              <p className="text-sm text-gray-600">4 online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
