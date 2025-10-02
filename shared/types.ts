export type DataStatus = 'pending' | 'approved' | 'rejected';
export type ContentType = 'image' | 'text';
export type ApprovalTag = 'obstacle' | 'flood' | 'trafficjam' | 'police';

export interface DataRecord {
  id: string;
  description: string;
  status: DataStatus;
  score: number; // 0-100
  contentType: ContentType;
  submittedBy: string;
  submittedAt: string;
  dataID: string; // ID to fetch the actual content
  content: string; // URL for image, text content for text
  metadata?: Record<string, unknown>;
  approvalTags?: ApprovalTag[];
}
