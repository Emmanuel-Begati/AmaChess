import { pdfjs } from 'react-pdf';

// Configure PDF.js worker to use local file or disable worker entirely
const configurePDFWorker = () => {
  console.log('PDF.js version:', pdfjs.version);
  
  try {
    // Try to use local worker file first
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    console.log('Worker configured to use local file: /pdf.worker.min.js');
  } catch (error) {
    console.error('Failed to configure local worker:', error);
    try {
      // Fallback: disable worker completely (use main thread)
      pdfjs.GlobalWorkerOptions.workerSrc = '';
      console.log('Worker disabled, using main thread');
    } catch (fallbackError) {
      console.error('Failed to disable worker:', fallbackError);
    }
  }
};

configurePDFWorker();

export interface PDFViewerConfig {
  scale: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

export class PDFViewerService {
  static getInitialConfig(): PDFViewerConfig {
    return {
      scale: 1.0,
      page: 1,
      totalPages: 0,
      isLoading: false,
      error: null
    };
  }

  static calculateOptimalScale(containerWidth: number, pageWidth: number): number {
    const maxScale = 2.0;
    const minScale = 0.5;
    const calculatedScale = (containerWidth - 40) / pageWidth; // 40px for padding
    
    return Math.max(minScale, Math.min(maxScale, calculatedScale));
  }

  static getScaleOptions() {
    return [
      { value: 0.5, label: '50%' },
      { value: 0.75, label: '75%' },
      { value: 1.0, label: '100%' },
      { value: 1.25, label: '125%' },
      { value: 1.5, label: '150%' },
      { value: 2.0, label: '200%' }
    ];
  }
}
