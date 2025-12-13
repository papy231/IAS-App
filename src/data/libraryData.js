export const fileResults = [
  { id: 0, label: 'Video 1', type: 'mp4', color: '#ede9fe', description: 'Creative video project about modern design techniques.' },
  { id: 1, label: 'Image 1', type: 'jpg', color: '#dbeafe', description: 'High-resolution photograph with natural lighting.' },
  { id: 2, label: 'Doc 1', type: 'pdf', color: '#fee2e2', description: 'Essay about fireflies by Robert Dwayne.' },
  { id: 3, label: 'Doc 2', type: 'pdf', color: '#fee2e2', description: 'Research paper on sustainable architecture.' },
  { id: 4, label: 'Sheet', type: 'xlsx', color: '#dcfce7', description: 'Financial analysis spreadsheet with projections.' },
  { id: 5, label: 'Image 2', type: 'png', color: '#dbeafe', description: 'Digital illustration showcasing minimalist design.' },
  { id: 6, label: 'Doc 3', type: 'pdf', color: '#fee2e2', description: 'Creative writing and storytelling guide.' },
  { id: 7, label: 'Video 2', type: 'mp4', color: '#ede9fe', description: 'Documentary on cultural heritage and traditions.' },
  { id: 8, label: 'Image 3', type: 'jpg', color: '#dbeafe', description: 'Photography series on geometric patterns.' },
  { id: 9, label: 'Doc 4', type: 'pdf', color: '#fee2e2', description: 'Technical documentation best practices.' },
  { id: 10, label: 'Video 3', type: 'mp4', color: '#ede9fe', description: 'Motion graphics and visual effects animation.' },
  { id: 11, label: 'Sheet 2', type: 'xlsx', color: '#dcfce7', description: 'Project management timeline and resources.' },
  { id: 12, label: 'Doc 5', type: 'pdf', color: '#fee2e2', description: 'Marketing strategy proposal.' },
  { id: 13, label: 'File', type: 'doc', color: '#f3f4f6', description: 'Meeting notes and action items.' },
  { id: 14, label: 'Image 4', type: 'png', color: '#dbeafe', description: 'UI mockup for mobile redesign.' },
];

export const folders = [
  { id: 1, name: 'Design', color: '#a78bfa' },
  { id: 2, name: 'Videos', color: '#60a5fa' },
  { id: 3, name: 'Docs', color: '#f59e0b' },
];

export const folderFiles = {
  1: [fileResults[1], fileResults[5], fileResults[8], fileResults[14]].map((f) => ({ ...f, type: 'Image', isNew: false })),
  2: [fileResults[0], fileResults[7], fileResults[10]].map((f) => ({ ...f, type: 'MP4', isNew: false })),
  3: [fileResults[2], fileResults[3], fileResults[4], fileResults[6], fileResults[9], fileResults[11], fileResults[12], fileResults[13]].map((f) => ({ ...f, type: f.type === 'xlsx' ? 'XLSX' : 'PDF', isNew: false })),
};
