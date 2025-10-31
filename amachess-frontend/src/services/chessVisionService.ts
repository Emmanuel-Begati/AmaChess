import axios from 'axios';
import { useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ChessBoundingBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;
}

export interface ChessDetectionResponse {
  success: boolean;
  boundingBoxes: ChessBoundingBox[];
  message?: string;
  pdf_hash?: string;
}

export interface FenExtractionResponse {
  success: boolean;
  fen: string;
  confidence?: number;
  message?: string;
}

export class ChessVisionService {
  private authToken: string | null = null;
  private lastPdfHash: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getAuthHeaders() {
    return this.authToken ? {
      'Authorization': `Bearer ${this.authToken}`
    } : {};
  }

  /**
   * Detect chess boards in a PDF file by uploading it directly
   * @param pdfFile - PDF file object
   * @param maxPages - Maximum number of pages to process (optional, defaults to 10)
   * @param startPage - Starting page number (optional, defaults to 1)
   * @returns Promise containing detected bounding boxes
   */
  async detectChessBoards(pdfFile: File, maxPages?: number, startPage?: number): Promise<ChessBoundingBox[]> {
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      
      // Add pagination parameters if provided
      if (maxPages) {
        formData.append('max_pages', maxPages.toString());
      }
      if (startPage) {
        formData.append('start_page', startPage.toString());
      }

      const response = await axios.post<ChessDetectionResponse>(
        `${API_BASE_URL}/get-board-bounds`,
        formData,
        {
          headers: {
            ...this.getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 2 minute timeout for PDF processing
          maxContentLength: 50 * 1024 * 1024, // 50MB
          maxBodyLength: 50 * 1024 * 1024, // 50MB
        }
      );
      
      if (response.data.success) {
        // Store the PDF hash for later FEN extraction
        this.lastPdfHash = response.data.pdf_hash || null;
        return response.data.boundingBoxes;
      } else {
        throw new Error(response.data.message || 'Chess board detection failed');
      }
    } catch (error) {
      console.error('Error detecting chess boards:', error);
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - PDF processing took too long. Try processing fewer pages at once.');
        }
        throw new Error(error.response?.data?.message || 'Network error during chess board detection');
      }
      throw error;
    }
  }

  /**
   * Extract FEN from bounding box coordinates
   * @param page - Page number
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param width - Width of bounding box
   * @param height - Height of bounding box
   * @returns Promise containing the FEN string
   */
  async extractFenFromCoordinates(page: number, x: number, y: number, width: number, height: number): Promise<string> {
    try {
      const response = await axios.post<FenExtractionResponse>(
        `${API_BASE_URL}/get-fen`,
        { 
          page, 
          x, 
          y, 
          width, 
          height,
          pdf_hash: this.lastPdfHash
        },
        { headers: this.getAuthHeaders() }
      );
      
      if (response.data.success) {
        return response.data.fen;
      } else {
        throw new Error(response.data.message || 'FEN extraction failed');
      }
    } catch (error) {
      console.error('Error extracting FEN:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Network error during FEN extraction');
      }
      throw error;
    }
  }

  /**
   * Detect chess diagrams on a specific page of a PDF
   * @param pdfUrl - URL or path to the PDF file
   * @param page - Page number (1-based)
   * @returns Promise containing detected bounding boxes
   */
  async detectChessOnPage(pdfUrl: string, page: number): Promise<ChessBoundingBox[]> {
    try {
      const response = await axios.post<ChessDetectionResponse>(
        `${API_BASE_URL}/detect-chess`,
        { pdfUrl, page },
        { headers: this.getAuthHeaders() }
      );
      
      if (response.data.success) {
        return response.data.boundingBoxes;
      } else {
        throw new Error(response.data.message || 'Chess detection failed');
      }
    } catch (error) {
      console.error('Error detecting chess diagrams:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Network error during chess detection');
      }
      throw error;
    }
  }

  /**
   * Extract FEN from a specific bounding box region
   * @param pdfUrl - URL or path to the PDF file
   * @param boundingBox - Bounding box coordinates
   * @returns Promise containing the FEN string
   */
  async extractFenFromBoundingBox(pdfUrl: string, boundingBox: ChessBoundingBox): Promise<string> {
    try {
      const response = await axios.post<FenExtractionResponse>(
        `${API_BASE_URL}/get-fen`,
        {
          pdfUrl,
          ...boundingBox,
          pdf_hash: this.lastPdfHash
        },
        { headers: this.getAuthHeaders() }
      );
      
      if (response.data.success) {
        return response.data.fen;
      } else {
        throw new Error(response.data.message || 'FEN extraction failed');
      }
    } catch (error) {
      console.error('Error extracting FEN:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Network error during FEN extraction');
      }
      throw error;
    }
  }

  /**
   * Detect chess diagrams on all pages of a PDF
   * @param pdfUrl - URL or path to the PDF file
   * @param maxPages - Maximum number of pages to process (optional)
   * @returns Promise containing all detected bounding boxes
   */
  async detectChessOnAllPages(pdfUrl: string, maxPages?: number): Promise<ChessBoundingBox[]> {
    try {
      const response = await axios.post<ChessDetectionResponse>(
        `${API_BASE_URL}/detect-chess-all`,
        { pdfUrl, maxPages },
        { headers: this.getAuthHeaders() }
      );
      
      if (response.data.success) {
        return response.data.boundingBoxes;
      } else {
        throw new Error(response.data.message || 'Chess detection failed');
      }
    } catch (error) {
      console.error('Error detecting chess diagrams on all pages:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Network error during chess detection');
      }
      throw error;
    }
  }

  /**
   * Batch extract FENs from multiple bounding boxes
   * @param pdfUrl - URL or path to the PDF file
   * @param boundingBoxes - Array of bounding boxes
   * @returns Promise containing array of FEN strings
   */
  async batchExtractFens(pdfUrl: string, boundingBoxes: ChessBoundingBox[]): Promise<string[]> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/batch-get-fen`,
        {
          pdfUrl,
          boundingBoxes
        },
        { headers: this.getAuthHeaders() }
      );
      
      if (response.data.success) {
        return response.data.fens;
      } else {
        throw new Error(response.data.message || 'Batch FEN extraction failed');
      }
    } catch (error) {
      console.error('Error in batch FEN extraction:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Network error during batch FEN extraction');
      }
      throw error;
    }
  }

  /**
   * Validate if a detected bounding box actually contains a chess diagram
   * @param pdfUrl - URL or path to the PDF file
   * @param boundingBox - Bounding box to validate
   * @returns Promise containing validation result
   */
  async validateChessBoundingBox(pdfUrl: string, boundingBox: ChessBoundingBox): Promise<boolean> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/validate-chess`,
        {
          pdfUrl,
          ...boundingBox
        },
        { headers: this.getAuthHeaders() }
      );
      
      return response.data.isValid || false;
    } catch (error) {
      console.error('Error validating chess bounding box:', error);
      return false;
    }
  }

  /**
   * Get chess detection statistics for a PDF
   * @param pdfUrl - URL or path to the PDF file
   * @returns Promise containing detection statistics
   */
  async getChessDetectionStats(pdfUrl: string): Promise<{
    totalPages: number;
    pagesWithChess: number;
    totalDiagrams: number;
    averageConfidence: number;
  }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chess-stats`,
        { pdfUrl },
        { headers: this.getAuthHeaders() }
      );
      
      return response.data.stats;
    } catch (error) {
      console.error('Error getting chess detection stats:', error);
      throw error;
    }
  }
}

// Singleton instance for use across the application
export const chessVisionService = new ChessVisionService();

// React hook for using the chess vision service
export const useChessVision = () => {
  const service = chessVisionService;
  
  // Set auth token if available
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      service.setAuthToken(token);
    }
  }, []);

  return {
    detectChessBoards: service.detectChessBoards.bind(service),
    extractFenFromCoordinates: service.extractFenFromCoordinates.bind(service),
    detectChessOnPage: service.detectChessOnPage.bind(service),
    extractFenFromBoundingBox: service.extractFenFromBoundingBox.bind(service),
    detectChessOnAllPages: service.detectChessOnAllPages.bind(service),
    batchExtractFens: service.batchExtractFens.bind(service),
    validateChessBoundingBox: service.validateChessBoundingBox.bind(service),
    getChessDetectionStats: service.getChessDetectionStats.bind(service)
  };
};
