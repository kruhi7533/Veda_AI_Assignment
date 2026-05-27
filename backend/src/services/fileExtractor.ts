import pdfParse from 'pdf-parse';

export async function extractText(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  if (mimetype === 'application/pdf') {
    try {
      const data = await pdfParse(buffer);
      return data.text.slice(0, 20000);
    } catch (e) {
      console.warn('[extract] pdf-parse failed', (e as Error).message);
      return '';
    }
  }
  if (mimetype.startsWith('text/')) {
    return buffer.toString('utf-8').slice(0, 20000);
  }
  return '';
}
