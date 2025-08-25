import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Template {
  title: string;
  category: string;
  file_url: string;
  preview_type: 'pdf' | 'docx';
  description?: string;
  file_size?: number;
  language?: 'english' | 'tamil' | 'both';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting template scraping from tnreginet.gov.in...');

    // First, try to scrape from the actual TN registration website
    let scrapedTemplates: Template[] = [];
    
    try {
      const response = await fetch('https://tnreginet.gov.in/portal/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        scrapedTemplates = await parseTemplatesFromHTML(doc);
        console.log(`Scraped ${scrapedTemplates.length} templates from website`);
      }
    } catch (error) {
      console.log('Could not scrape website directly, using predefined templates:', error);
    }

    // If scraping failed or returned no results, use comprehensive predefined templates based on the screenshot
    const predefinedTemplates: Template[] = [
      // Draft Document Models
      {
        title: "Sales Document / Dry Document",
        category: "Draft Document Models",
        file_url: "templates/sales-document.pdf",
        preview_type: "pdf",
        description: "Sales document template for property transactions",
        language: "both"
      },
      {
        title: "Handbook of Right Documents",
        category: "Draft Document Models",
        file_url: "templates/handbook-right-documents.pdf",
        preview_type: "pdf",
        description: "Comprehensive handbook for right documents",
        language: "both"
      },
      {
        title: "Credit Approval Document",
        category: "Draft Document Models",
        file_url: "templates/credit-approval.pdf",
        preview_type: "pdf",
        description: "Credit approval documentation template",
        language: "both"
      },
      {
        title: "Transaction Document",
        category: "Draft Document Models",
        file_url: "templates/transaction-document.pdf",
        preview_type: "pdf",
        description: "Transaction document template for registrations",
        language: "both"
      },
      {
        title: "Previous Document",
        category: "Draft Document Models",
        file_url: "templates/previous-document.pdf",
        preview_type: "pdf",
        description: "Previous document template for reference",
        language: "both"
      },
      {
        title: "Lease Document",
        category: "Draft Document Models",
        file_url: "templates/lease-document.pdf",
        preview_type: "pdf",
        description: "Lease agreement document template",
        language: "both"
      },
      {
        title: "Claim for Pre-build",
        category: "Draft Document Models",
        file_url: "templates/claim-prebuild.pdf",
        preview_type: "pdf",
        description: "Pre-build claim documentation",
        language: "both"
      },
      {
        title: "Oral Agreement Document",
        category: "Draft Document Models",
        file_url: "templates/oral-agreement.pdf",
        preview_type: "pdf",
        description: "Oral agreement documentation template",
        language: "both"
      },
      {
        title: "Construction Agreement Document",
        category: "Draft Document Models",
        file_url: "templates/construction-agreement.pdf",
        preview_type: "pdf",
        description: "Construction agreement template",
        language: "both"
      },
      {
        title: "Troubleshooting Document",
        category: "Draft Document Models",
        file_url: "templates/troubleshooting-document.pdf",
        preview_type: "pdf",
        description: "Troubleshooting document template",
        language: "both"
      },
      {
        title: "General Authority Document",
        category: "Draft Document Models",
        file_url: "templates/general-authority.pdf",
        preview_type: "pdf",
        description: "General authority documentation",
        language: "both"
      },
      {
        title: "Special Deed Document Under Writs",
        category: "Draft Document Models",
        file_url: "templates/special-deed-writs.pdf",
        preview_type: "pdf",
        description: "Special deed document under writs functionalization",
        language: "both"
      },
      {
        title: "General Authority Registered Split",
        category: "Draft Document Models",
        file_url: "templates/general-authority-split.pdf",
        preview_type: "pdf",
        description: "General authority for registered property split",
        language: "both"
      },
      {
        title: "Southwest Upper Practical Document",
        category: "Draft Document Models",
        file_url: "templates/southwest-practical.pdf",
        preview_type: "pdf",
        description: "Southwest upper practical document template",
        language: "both"
      },
      {
        title: "Development with Backlinks",
        category: "Draft Document Models",
        file_url: "templates/development-backlinks.pdf",
        preview_type: "pdf",
        description: "Development documentation with backlinks",
        language: "both"
      },
      {
        title: "Arrangement Settlement Cancellation Document",
        category: "Draft Document Models",
        file_url: "templates/arrangement-settlement.pdf",
        preview_type: "pdf",
        description: "Arrangement settlement cancellation template",
        language: "both"
      },
      {
        title: "Arrangement Settlement Document",
        category: "Draft Document Models",
        file_url: "templates/arrangement-settlement-doc.pdf",
        preview_type: "pdf",
        description: "Arrangement settlement documentation",
        language: "both"
      },
      {
        title: "Liability Trust Document",
        category: "Draft Document Models",
        file_url: "templates/liability-trust.pdf",
        preview_type: "pdf",
        description: "Liability trust document template",
        language: "both"
      },
      {
        title: "Cancellation Document or Sign",
        category: "Draft Document Models",
        file_url: "templates/cancellation-document.pdf",
        preview_type: "pdf",
        description: "Cancellation document or signature template",
        language: "both"
      },
      {
        title: "Sign Document",
        category: "Draft Document Models",
        file_url: "templates/sign-document.pdf",
        preview_type: "pdf",
        description: "Sign document template",
        language: "both"
      },
      {
        title: "Partnership Document",
        category: "Draft Document Models",
        file_url: "templates/partnership-document.pdf",
        preview_type: "pdf",
        description: "Partnership document template",
        language: "both"
      },
      {
        title: "Parties Document",
        category: "Draft Document Models",
        file_url: "templates/parties-document.pdf",
        preview_type: "pdf",
        description: "Parties document template",
        language: "both"
      },
      {
        title: "Joint Regulation Document",
        category: "Draft Document Models",
        file_url: "templates/joint-regulation.pdf",
        preview_type: "pdf",
        description: "Joint regulation document template",
        language: "both"
      },
      {
        title: "Common Document",
        category: "Draft Document Models",
        file_url: "templates/common-document.pdf",
        preview_type: "pdf",
        description: "Common document template for various uses",
        language: "both"
      },
      {
        title: "Tithe Document",
        category: "Draft Document Models",
        file_url: "templates/tithe-document.pdf",
        preview_type: "pdf",
        description: "Tithe document template",
        language: "both"
      },
      {
        title: "Release Document",
        category: "Draft Document Models",
        file_url: "templates/release-document.pdf",
        preview_type: "pdf",
        description: "Release document template",
        language: "both"
      },
      {
        title: "Document Authority Document",
        category: "Draft Document Models",
        file_url: "templates/document-authority.pdf",
        preview_type: "pdf",
        description: "Document authority template",
        language: "both"
      },
      {
        title: "Trademark Document",
        category: "Draft Document Models",
        file_url: "templates/trademark-document.pdf",
        preview_type: "pdf",
        description: "Trademark document template",
        language: "both"
      },
      {
        title: "Compatible Document (Engagement Document / Sustainable Compatible Document)",
        category: "Draft Document Models",
        file_url: "templates/compatible-document.pdf",
        preview_type: "pdf",
        description: "Compatible document for engagement and sustainability",
        language: "both"
      },

      // Miscellaneous
      {
        title: "Application for Village/Lane Existence / Certified Copy",
        category: "Miscellaneous",
        file_url: "templates/village-existence-application.pdf",
        preview_type: "pdf",
        description: "Application for village/lane existence certified copy",
        language: "both"
      },
      {
        title: "Appendix 1-I(a)",
        category: "Miscellaneous",
        file_url: "templates/appendix-1-ia.pdf",
        preview_type: "pdf",
        description: "Appendix 1-I(a) form template",
        language: "both"
      },
      {
        title: "Application for Payment of Impairment Damages Under Section 61 of the Stamp Act",
        category: "Miscellaneous",
        file_url: "templates/impairment-damages-application.pdf",
        preview_type: "pdf",
        description: "Application for payment of impairment damages under Stamp Act",
        language: "both"
      },

      // Hindu Marriage
      {
        title: "Application for Registration",
        category: "Hindu Marriage",
        file_url: "templates/hindu-marriage-registration.pdf",
        preview_type: "pdf",
        description: "Hindu marriage registration application",
        language: "both"
      },
      {
        title: "Application for Receipt of the Vital",
        category: "Hindu Marriage",
        file_url: "templates/hindu-marriage-vital-receipt.pdf",
        preview_type: "pdf",
        description: "Application for receipt of vital document in Hindu marriage",
        language: "both"
      },
      {
        title: "Request for Separate Registration",
        category: "Hindu Marriage",
        file_url: "templates/hindu-separate-registration.pdf",
        preview_type: "pdf",
        description: "Request for separate registration in Hindu marriage",
        language: "both"
      },
      {
        title: "Application for Registration in the Individual",
        category: "Hindu Marriage",
        file_url: "templates/hindu-individual-registration.pdf",
        preview_type: "pdf",
        description: "Hindu marriage individual registration application",
        language: "both"
      },
      {
        title: "Pledge to the India in the Individual",
        category: "Hindu Marriage",
        file_url: "templates/hindu-pledge-individual.pdf",
        preview_type: "pdf",
        description: "Pledge to India for individual in Hindu marriage",
        language: "both"
      },

      // Separate Special Marriage
      {
        title: "Motion of Separate / Special Marriage",
        category: "Separate Special Marriage",
        file_url: "templates/separate-special-marriage-motion.pdf",
        preview_type: "pdf",
        description: "Motion for separate/special marriage registration",
        language: "both"
      },
      {
        title: "Separate / Special Wedding Pledge",
        category: "Separate Special Marriage",
        file_url: "templates/separate-special-wedding-pledge.pdf",
        preview_type: "pdf",
        description: "Separate/special wedding pledge template",
        language: "both"
      },

      // Tamil Nadu Marriage Registration Act 2009
      {
        title: "Wedding Registration Form - I",
        category: "Tamil Nadu Marriage Registration Act 2009",
        file_url: "templates/tn-wedding-registration-form-1.pdf",
        preview_type: "pdf",
        description: "Tamil Nadu wedding registration form I under Act 2009",
        language: "both"
      },
      {
        title: "Wedding Registration Form - I (k)",
        category: "Tamil Nadu Marriage Registration Act 2009",
        file_url: "templates/tn-wedding-registration-form-1k.pdf",
        preview_type: "pdf",
        description: "Tamil Nadu wedding registration form I(k) under Act 2009",
        language: "both"
      },
      {
        title: "Wedding Registration Form - II",
        category: "Tamil Nadu Marriage Registration Act 2009",
        file_url: "templates/tn-wedding-registration-form-2.pdf",
        preview_type: "pdf",
        description: "Tamil Nadu wedding registration form II under Act 2009",
        language: "both"
      },
      {
        title: "Wedding Registration Form - VI",
        category: "Tamil Nadu Marriage Registration Act 2009",
        file_url: "templates/tn-wedding-registration-form-6.pdf",
        preview_type: "pdf",
        description: "Tamil Nadu wedding registration form VI under Act 2009",
        language: "both"
      },

      // Kural Marriage
      {
        title: "Application Form for Filter",
        category: "Kural Marriage",
        file_url: "templates/kural-marriage-filter-application.pdf",
        preview_type: "pdf",
        description: "Kural marriage application form for filter",
        language: "both"
      },

      // Association Registration
      {
        title: "Association Registration Form - I",
        category: "Association Registration",
        file_url: "templates/association-registration-form-1.pdf",
        preview_type: "pdf",
        description: "Association registration form I",
        language: "both"
      },
      {
        title: "Association Registration Form - II",
        category: "Association Registration",
        file_url: "templates/association-registration-form-2.pdf",
        preview_type: "pdf",
        description: "Association registration form II",
        language: "both"
      },
      {
        title: "Association Registration Form - VI",
        category: "Association Registration",
        file_url: "templates/association-registration-form-6.pdf",
        preview_type: "pdf",
        description: "Association registration form VI",
        language: "both"
      },
      {
        title: "Association Registration Form - VII",
        category: "Association Registration",
        file_url: "templates/association-registration-form-7.pdf",
        preview_type: "pdf",
        description: "Association registration form VII",
        language: "both"
      },
      {
        title: "Sub-Rules",
        category: "Association Registration",
        file_url: "templates/association-sub-rules.pdf",
        preview_type: "pdf",
        description: "Association registration sub-rules template",
        language: "both"
      },

      // Joint Company
      {
        title: "Indian Joint Intellectual Law Form",
        category: "Joint Company",
        file_url: "templates/indian-joint-intellectual-law.pdf",
        preview_type: "pdf",
        description: "Indian joint intellectual law form for companies",
        language: "both"
      }
    ];

    // Use scraped templates if available, otherwise use predefined ones
    const allTemplates = scrapedTemplates.length > 0 ? scrapedTemplates : predefinedTemplates;

    // Create a simple dummy PDF for templates that don't have real files
    const createDummyPDF = async (title: string): Promise<string> => {
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(${title}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000373 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;

      const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
      
      try {
        const { data, error } = await supabaseClient.storage
          .from('templates')
          .upload(fileName, new Blob([pdfContent], { type: 'application/pdf' }), {
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.log(`Error uploading ${fileName}:`, error);
          return '';
        }

        const { data: urlData } = supabaseClient.storage
          .from('templates')
          .getPublicUrl(fileName);

        return urlData.publicUrl;
      } catch (error) {
        console.log(`Error creating dummy PDF for ${title}:`, error);
        return '';
      }
    };

    // Helper function to parse templates from HTML (if scraping is successful)
    async function parseTemplatesFromHTML(doc: any): Promise<Template[]> {
      const templates: Template[] = [];
      
      try {
        // Look for the table with template information
        const rows = doc.querySelectorAll('table tr');
        
        for (const row of rows) {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 4) {
            const titleCell = cells[1];
            const englishCell = cells[2];
            const tamilCell = cells[3];
            
            if (titleCell && titleCell.textContent) {
              const title = titleCell.textContent.trim();
              
              // Extract PDF links if available
              const englishLink = englishCell?.querySelector('a[href$=".pdf"]')?.getAttribute('href');
              const tamilLink = tamilCell?.querySelector('a[href$=".pdf"]')?.getAttribute('href');
              
              if (englishLink || tamilLink) {
                // Determine category based on row grouping or table structure
                let category = "Miscellaneous";
                const previousRows = Array.from(rows).slice(0, Array.from(rows).indexOf(row));
                
                for (let i = previousRows.length - 1; i >= 0; i--) {
                  const prevRow = previousRows[i];
                  const categoryCell = prevRow.querySelector('td[colspan]');
                  if (categoryCell) {
                    category = categoryCell.textContent?.trim() || "Miscellaneous";
                    break;
                  }
                }
                
                templates.push({
                  title: title,
                  category: category,
                  file_url: englishLink || tamilLink || '',
                  preview_type: 'pdf',
                  description: `${title} - Official template from TN Registration Department`,
                  language: (englishLink && tamilLink) ? 'both' : (englishLink ? 'english' : 'tamil')
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error parsing HTML:', error);
      }
      
      return templates;
    }

    // Generate sample PDF content for templates
    const generateSamplePDF = (title: string, category: string) => {
      return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 200
>>
stream
BT
/F1 12 Tf
50 750 Td
(${title}) Tj
0 -30 Td
(Category: ${category}) Tj
0 -50 Td
(This is a sample template document.) Tj
0 -30 Td
(Please customize this template according to your needs.) Tj
0 -30 Td
([Template content would go here]) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000108 00000 n 
0000000245 00000 n 
0000000497 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
576
%%EOF`;
    };

    // Insert templates into database and create sample files
    let insertedCount = 0;
    let skippedCount = 0;

    for (const template of allTemplates) {
      // Check if template already exists
      const { data: existingTemplate } = await supabaseClient
        .from('templates')
        .select('id')
        .eq('title', template.title)
        .single();

      if (existingTemplate) {
        console.log(`Template "${template.title}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create sample file content
      let fileContent: Uint8Array;
      let contentType: string;

      if (template.preview_type === 'pdf') {
        const pdfContent = generateSamplePDF(template.title, template.category);
        fileContent = new TextEncoder().encode(pdfContent);
        contentType = 'application/pdf';
      } else {
        // Simple DOCX placeholder - in reality you'd generate proper DOCX
        const docxContent = `Sample DOCX Template: ${template.title}\n\nCategory: ${template.category}\n\nThis is a sample template document. Please customize this template according to your needs.`;
        fileContent = new TextEncoder().encode(docxContent);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }

      // Upload file to storage
      const fileName = `${template.title.toLowerCase().replace(/\s+/g, '-')}.${template.preview_type}`;
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('templates')
        .upload(fileName, fileContent, {
          contentType,
          upsert: true
        });

      if (uploadError) {
        console.error(`Error uploading file for "${template.title}":`, uploadError);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('templates')
        .getPublicUrl(fileName);

      // Insert template record
      const { error: insertError } = await supabaseClient
        .from('templates')
        .insert({
          title: template.title,
          category: template.category,
          file_url: publicUrl,
          preview_type: template.preview_type,
          description: template.description,
          file_size: fileContent.length,
          is_active: true
        });

      if (insertError) {
        console.error(`Error inserting template "${template.title}":`, insertError);
        continue;
      }

      console.log(`Successfully added template: ${template.title}`);
      insertedCount++;
    }

    const result = {
      success: true,
      message: `Template population completed. Inserted: ${insertedCount}, Skipped: ${skippedCount}`,
      inserted: insertedCount,
      skipped: skippedCount
    };

    console.log('Template scraping result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-templates function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});