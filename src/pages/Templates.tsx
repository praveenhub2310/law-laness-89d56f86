import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Templates = () => {
  const templateCategories = [
    {
      title: "Legal Documents",
      templates: [
        { name: "Petition Template", description: "Standard petition format for civil cases" },
        { name: "Application Template", description: "General application template" },
        { name: "Notice Template", description: "Legal notice template" }
      ]
    },
    {
      title: "Court Forms",
      templates: [
        { name: "Vakalatnama", description: "Authorization to appear on behalf" },
        { name: "Affidavit Template", description: "Standard affidavit format" },
        { name: "Power of Attorney", description: "General power of attorney template" }
      ]
    },
    {
      title: "Contract Templates",
      templates: [
        { name: "Service Agreement", description: "Professional service agreement template" },
        { name: "Sale Agreement", description: "Property sale agreement template" },
        { name: "Rental Agreement", description: "Property rental agreement template" }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Document Templates</h1>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload Template
        </Button>
      </div>

      <div className="grid gap-6">
        {templateCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-xl">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.templates.map((template, templateIndex) => (
                  <div key={templateIndex} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">{template.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Templates;