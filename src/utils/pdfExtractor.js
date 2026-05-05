/**
 * Extracts plain text from a PDF file using pdfjs-dist.
 *
 * @param {File} file - The PDF file to extract text from.
 * @returns {Promise<string>} The concatenated text content of all pages.
 * @throws {Error} If the file is not a PDF or extraction fails.
 */
export async function extractTextFromPdf(file) {
  if (file.type !== 'application/pdf') {
    throw new Error(
      `Invalid file type "${file.type}". Only PDF files (application/pdf) are supported.`
    );
  }

  let pdfjsLib;
  try {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  } catch (err) {
    throw new Error(`Failed to load PDF library: ${err.message}`);
  }

  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (err) {
    throw new Error(`Failed to read file: ${err.message}`);
  }

  let pdf;
  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  } catch (err) {
    throw new Error(`Failed to load PDF document: ${err.message}`);
  }

  try {
    const pageTexts = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(' ');
      pageTexts.push(pageText);
    }
    return pageTexts.join('\n');
  } catch (err) {
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
}
