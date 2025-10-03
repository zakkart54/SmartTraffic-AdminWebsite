export type ContentType = 'image' | 'text' | 'both';
export type ApprovalTag = 'obstacle' | 'flood' | 'trafficjam' | 'police';

export interface DataRecord {
  id: string;
  description: string;
  statusID: string | null; // null = unreviewed, "approved", "rejected"
  score: number; // 0-100
  contentType: ContentType;
  submittedBy: string;
  submittedAt: string;
  qualified: boolean | null; // null = unreviewed, true = qualified, false = unqualified
  dataImgID?: string; // ID to fetch the actual content
  dataTextID?: string; // ID to fetch the actual content
  content: string; // URL for image, text content for text
  metadata?: Record<string, unknown>;
  approvalTags?: ApprovalTag[];
}
