export interface UploadResponse {
  success: boolean;
  filename: string;
  totalRecords: number;
  headers: string[];
  preview: Record<string, string>[];
  allRecords: Record<string, string>[];
}

export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  original: Record<string, string>;
  reason: string;
}

export interface ProcessResponse {
  success: boolean;
  data: {
    extracted: CRMRecord[];
    skipped: SkippedRecord[];
    summary: {
      totalProcessed: number;
      totalImported: number;
      totalSkipped: number;
    };
    crmFields: string[];
  };
}
