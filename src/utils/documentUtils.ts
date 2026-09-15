import { SaanjhDocument } from '../types';

/**
 * Safely formats a document upload date without risking undefined or split errors.
 */
export function formatDocumentDate(dateValue?: string | null): string {
  if (!dateValue || typeof dateValue !== 'string') {
    return 'Recent';
  }
  
  const trimmed = dateValue.trim();
  if (!trimmed) {
    return 'Recent';
  }

  try {
    // If it contains an ISO timestamp with 'T'
    if (trimmed.includes('T')) {
      const parts = (trimmed ?? '').split('T');
      if (parts[0] && parts[0].length >= 4) {
        return parts[0];
      }
    }
    
    // If it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    // Try parsing as Date object
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }

    return trimmed;
  } catch {
    return 'Recent';
  }
}

/**
 * Normalizes any document record to guarantee all required fields exist
 * and have safe defaults, preventing runtime crashes on missing or legacy properties.
 */
export function normalizeDocument(raw: any): SaanjhDocument {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventId: 'evt-demo-001',
      eventName: 'Suryaveer & Ananya (Udaipur)',
      title: 'Untitled Vault Document',
      category: 'Brief',
      fileName: 'document.pdf',
      fileSize: '1.2 MB',
      fileType: 'PDF',
      fileUrl: '#',
      summary: 'Official document filed in Saanjh Vault.',
      notes: '',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedAt: new Date().toISOString(),
      isDemo: false,
    };
  }

  const rawTitle = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : '';
  const rawFileName = typeof raw.fileName === 'string' && raw.fileName.trim() ? raw.fileName.trim() : '';
  const title = rawTitle || rawFileName || 'Untitled Document';

  // Determine file type safely
  let fileType = typeof raw.fileType === 'string' && raw.fileType.trim() ? raw.fileType.trim().toUpperCase() : '';
  if (!fileType && rawFileName && rawFileName.includes('.')) {
    const ext = (rawFileName ?? '').split('.').pop();
    if (ext) fileType = ext.toUpperCase();
  }
  if (!fileType) {
    fileType = 'PDF';
  }

  // Safe file name
  const fileName = rawFileName || `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${fileType.toLowerCase()}`;

  // Safe dates
  let uploadedAt: string;
  let uploadDate: string;

  if (typeof raw.uploadedAt === 'string' && raw.uploadedAt.trim()) {
    uploadedAt = raw.uploadedAt.trim();
    uploadDate = typeof raw.uploadDate === 'string' && raw.uploadDate.trim()
      ? raw.uploadDate.trim()
      : formatDocumentDate(uploadedAt);
  } else if (typeof raw.uploadDate === 'string' && raw.uploadDate.trim()) {
    uploadDate = raw.uploadDate.trim();
    uploadedAt = uploadDate.includes('T') ? uploadDate : `${uploadDate}T12:00:00.000Z`;
  } else {
    const now = new Date();
    uploadedAt = now.toISOString();
    uploadDate = uploadedAt.split('T')[0];
  }

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    eventId: typeof raw.eventId === 'string' && raw.eventId ? raw.eventId : 'evt-demo-001',
    eventName: typeof raw.eventName === 'string' && raw.eventName ? raw.eventName : 'Suryaveer & Ananya (Udaipur)',
    title,
    category: typeof raw.category === 'string' && raw.category ? raw.category : 'Brief',
    fileData: typeof raw.fileData === 'string' ? raw.fileData : undefined,
    fileName,
    fileSize: typeof raw.fileSize === 'string' && raw.fileSize ? raw.fileSize : '1.5 MB',
    fileType,
    fileUrl: typeof raw.fileUrl === 'string' && raw.fileUrl ? raw.fileUrl : '#',
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    summary: typeof raw.summary === 'string' && raw.summary.trim() ? raw.summary : (typeof raw.notes === 'string' && raw.notes ? raw.notes : 'Official document filed in Saanjh Vault.'),
    uploadDate,
    uploadedAt,
    isDemo: Boolean(raw.isDemo),
  };
}
