import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedEntry {
  item_number?: string;
  case_number?: string;
  parties?: string;
  court_name?: string;
  court_room_number?: string;
  judge_name?: string;
  date?: string;
  time_slot?: string;
  hearing_type?: string;
  raw_text?: string;
}

interface CaseMatchResult {
  case_id?: string;
  confidence: number;
  matched_fields: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const uploadId = formData.get('uploadId') as string;

    if (!file || !uploadId) {
      throw new Error('File and uploadId are required');
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Update upload status to processing
    await supabase
      .from('cause_list_uploads')
      .update({ status: 'processing' })
      .eq('id', uploadId);

    let parsedEntries: ParsedEntry[] = [];

    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      parsedEntries = await parseCSV(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      parsedEntries = await parsePDF(file);
    } else {
      throw new Error('Unsupported file type. Please upload PDF or CSV files.');
    }

    console.log(`Parsed ${parsedEntries.length} entries from file`);

    // Get existing cases for mapping
    const { data: existingCases } = await supabase
      .from('projects')
      .select('id, case_number, title, client_id, lawyer_id');

    // Map parsed entries to existing cases
    const mappedEntries = await mapToExistingCases(parsedEntries, existingCases || []);
    
    // Insert parsed entries into cause_list table
    const insertData = mappedEntries.map(entry => ({
      ...entry,
      parsed_from_file: true,
      original_filename: file.name,
      status: 'scheduled' as const,
    }));

    const { data: insertedEntries, error: insertError } = await supabase
      .from('cause_list')
      .insert(insertData)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    const mappedCount = mappedEntries.filter(entry => entry.mapped_case_id).length;

    // Update upload record with results
    await supabase
      .from('cause_list_uploads')
      .update({
        status: 'completed',
        parsed_entries_count: parsedEntries.length,
        mapped_entries_count: mappedCount,
      })
      .eq('id', uploadId);

    console.log(`Successfully processed ${parsedEntries.length} entries, mapped ${mappedCount} to existing cases`);

    return new Response(
      JSON.stringify({
        success: true,
        parsed_entries: parsedEntries.length,
        mapped_entries: mappedCount,
        entries: insertedEntries,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing cause list:', error);
    
    const uploadId = (await req.formData()).get('uploadId') as string;
    if (uploadId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      await supabase
        .from('cause_list_uploads')
        .update({
          status: 'failed',
          error_message: error.message,
        })
        .eq('id', uploadId);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function parseCSV(file: File): Promise<ParsedEntry[]> {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header row
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const entries: ParsedEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length !== headers.length) continue;

    const entry: ParsedEntry = { raw_text: lines[i] };
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (!value) return;

      // Map common column names to our schema
      if (header.includes('item') || header.includes('sr') || header.includes('no')) {
        entry.item_number = value;
      } else if (header.includes('case') && header.includes('number')) {
        entry.case_number = value;
      } else if (header.includes('parties') || header.includes('petitioner') || header.includes('respondent')) {
        entry.parties = value;
      } else if (header.includes('court') && !header.includes('room')) {
        entry.court_name = value;
      } else if (header.includes('room') || header.includes('court room')) {
        entry.court_room_number = value;
      } else if (header.includes('judge')) {
        entry.judge_name = value;
      } else if (header.includes('date')) {
        entry.date = parseDate(value);
      } else if (header.includes('time')) {
        entry.time_slot = value;
      } else if (header.includes('type') || header.includes('nature')) {
        entry.hearing_type = value;
      }
    });

    if (entry.case_number || entry.parties) {
      entries.push(entry);
    }
  }

  return entries;
}

async function parsePDF(file: File): Promise<ParsedEntry[]> {
  // For now, we'll implement a basic PDF text extraction
  // In a production environment, you might want to use a more sophisticated PDF parser
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Basic PDF text extraction (this is a simplified approach)
    // In reality, you'd want to use a proper PDF parsing library
    const text = await extractTextFromPDF(arrayBuffer);
    
    return parseTextContent(text);
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file. Please ensure it contains readable text.');
  }
}

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  // This is a basic implementation. In production, you'd use a proper PDF parser
  const uint8Array = new Uint8Array(arrayBuffer);
  let text = '';
  
  // Look for text objects in PDF (very basic approach)
  for (let i = 0; i < uint8Array.length - 3; i++) {
    if (uint8Array[i] === 0x42 && uint8Array[i + 1] === 0x54) { // "BT" marker
      let j = i + 2;
      while (j < uint8Array.length - 2 && !(uint8Array[j] === 0x45 && uint8Array[j + 1] === 0x54)) { // "ET" marker
        if (uint8Array[j] >= 32 && uint8Array[j] <= 126) {
          text += String.fromCharCode(uint8Array[j]);
        } else if (uint8Array[j] === 10 || uint8Array[j] === 13) {
          text += '\n';
        }
        j++;
      }
    }
  }
  
  return text || 'Could not extract text from PDF. Please try uploading a CSV file instead.';
}

function parseTextContent(text: string): ParsedEntry[] {
  const lines = text.split('\n').filter(line => line.trim());
  const entries: ParsedEntry[] = [];
  
  for (const line of lines) {
    const entry = parseLineContent(line);
    if (entry && (entry.case_number || entry.parties)) {
      entries.push(entry);
    }
  }
  
  return entries;
}

function parseLineContent(line: string): ParsedEntry | null {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.length < 10) return null;

  const entry: ParsedEntry = { raw_text: trimmedLine };

  // Common patterns for cause list entries
  const patterns = {
    itemNumber: /(?:^|\s)(\d+)[\.\)]\s/,
    caseNumber: /(?:case|writ|petition|appeal|suit|misc)[\s\#\-]*(\w+\/\d+\/\d+)/i,
    parties: /([A-Z][a-zA-Z\s]+)\s+(?:v[s]?\.?|versus)\s+([A-Z][a-zA-Z\s]+)/i,
    courtRoom: /(?:court\s*room|room)\s*[:\-]?\s*(\d+|[A-Z]\d*)/i,
    judge: /(?:before|hon'ble|justice|j\.)\s+([A-Z][a-zA-Z\s\.]+)/i,
    time: /(\d{1,2}:\d{2}(?:\s*[AP]M)?)/i,
  };

  // Extract item number
  const itemMatch = trimmedLine.match(patterns.itemNumber);
  if (itemMatch) {
    entry.item_number = itemMatch[1];
  }

  // Extract case number
  const caseMatch = trimmedLine.match(patterns.caseNumber);
  if (caseMatch) {
    entry.case_number = caseMatch[1];
  }

  // Extract parties
  const partiesMatch = trimmedLine.match(patterns.parties);
  if (partiesMatch) {
    entry.parties = `${partiesMatch[1].trim()} vs ${partiesMatch[2].trim()}`;
  }

  // Extract court room
  const roomMatch = trimmedLine.match(patterns.courtRoom);
  if (roomMatch) {
    entry.court_room_number = roomMatch[1];
  }

  // Extract judge
  const judgeMatch = trimmedLine.match(patterns.judge);
  if (judgeMatch) {
    entry.judge_name = judgeMatch[1].trim();
  }

  // Extract time
  const timeMatch = trimmedLine.match(patterns.time);
  if (timeMatch) {
    entry.time_slot = timeMatch[1];
  }

  return entry;
}

async function mapToExistingCases(entries: ParsedEntry[], existingCases: any[]): Promise<(ParsedEntry & CaseMatchResult)[]> {
  return entries.map(entry => {
    const matchResult = findBestCaseMatch(entry, existingCases);
    return {
      ...entry,
      mapped_case_id: matchResult.case_id,
      mapping_confidence: matchResult.confidence,
    };
  });
}

function findBestCaseMatch(entry: ParsedEntry, existingCases: any[]): CaseMatchResult {
  let bestMatch: CaseMatchResult = { confidence: 0, matched_fields: [] };

  for (const existingCase of existingCases) {
    const matchResult = calculateMatchScore(entry, existingCase);
    if (matchResult.confidence > bestMatch.confidence) {
      bestMatch = { ...matchResult, case_id: existingCase.id };
    }
  }

  return bestMatch;
}

function calculateMatchScore(entry: ParsedEntry, existingCase: any): CaseMatchResult {
  let score = 0;
  const matchedFields: string[] = [];
  const maxScore = 100;

  // Exact case number match (highest weight)
  if (entry.case_number && existingCase.case_number) {
    if (entry.case_number.toLowerCase() === existingCase.case_number.toLowerCase()) {
      score += 80;
      matchedFields.push('case_number_exact');
    } else if (entry.case_number.toLowerCase().includes(existingCase.case_number.toLowerCase()) ||
               existingCase.case_number.toLowerCase().includes(entry.case_number.toLowerCase())) {
      score += 40;
      matchedFields.push('case_number_partial');
    }
  }

  // Parties match (medium weight)
  if (entry.parties && existingCase.title) {
    const similarity = calculateStringSimilarity(entry.parties.toLowerCase(), existingCase.title.toLowerCase());
    if (similarity > 0.7) {
      score += 15;
      matchedFields.push('parties_high');
    } else if (similarity > 0.4) {
      score += 8;
      matchedFields.push('parties_medium');
    }
  }

  return {
    confidence: Math.min(score / maxScore, 1),
    matched_fields: matchedFields,
  };
}

function calculateStringSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  let matches = 0;
  const totalWords = Math.max(words1.length, words2.length);
  
  for (const word1 of words1) {
    if (word1.length < 3) continue;
    for (const word2 of words2) {
      if (word2.length < 3) continue;
      if (word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / totalWords;
}

function parseDate(dateStr: string): string {
  try {
    // Try to parse various date formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    // Try DD/MM/YYYY or MM/DD/YYYY format
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      
      if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const parsedDate = new Date(year, month - 1, day);
        return parsedDate.toISOString();
      }
    }
    
    return dateStr; // Return original if parsing fails
  } catch {
    return dateStr;
  }
}