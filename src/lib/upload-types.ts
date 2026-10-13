/**
 * The file types Media and Documents accept. Payload reads an upload's type from the file itself
 * and checks it against these lists; a plan's local files are checked against the same lists.
 */
export const MEDIA_MIME_TYPES = ['image/*', 'video/mp4', 'video/webm']

export const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  // Word, Excel and PowerPoint files from before 2007 are read as a compound file.
  'application/x-cfb',
  'application/vnd.openxmlformats-officedocument.*',
  'application/vnd.ms-excel',
  'image/vnd.dwg',
  'application/acad',
  'application/octet-stream',
]
