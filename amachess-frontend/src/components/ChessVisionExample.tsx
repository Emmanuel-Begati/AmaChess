import React, { useState } from 'react';
import { chessVisionService } from '../services/chessVisionService';
import { ChessBoundingBox } from '../services/chessVisionService';

interface ChessVisionExampleProps {
  onFenDetected?: (fen: string) => void;
}

const ChessVisionExample: React.FC<ChessVisionExampleProps> = ({ onFenDetected }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<ChessBoundingBox[]>([]);
  const [extractedFen, setExtractedFen] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a PDF file');
    }
  };

  const handleDetectBoards = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const boxes = await chessVisionService.detectChessBoards(selectedFile);
      setBoundingBoxes(boxes);
      console.log('Detected chess boards:', boxes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect chess boards');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractFen = async (box: ChessBoundingBox) => {
    setLoading(true);
    setError('');
    
    try {
      const fen = await chessVisionService.extractFenFromCoordinates(
        box.page,
        box.x,
        box.y,
        box.width,
        box.height
      );
      setExtractedFen(fen);
      onFenDetected?.(fen);
      console.log('Extracted FEN:', fen);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract FEN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chess-vision-example p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Chess Vision Example</h2>
      
      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Upload PDF File:
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </p>
        )}
      </div>

      {/* Detect Boards Button */}
      <div className="mb-6">
        <button
          onClick={handleDetectBoards}
          disabled={!selectedFile || loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {loading ? 'Detecting...' : 'Detect Chess Boards'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Bounding Boxes Display */}
      {boundingBoxes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Detected Chess Boards:</h3>
          <div className="grid gap-3">
            {boundingBoxes.map((box, index) => (
              <div key={index} className="border border-gray-200 rounded p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Board {index + 1}</p>
                    <p className="text-sm text-gray-600">
                      Page {box.page} | Position: ({box.x}, {box.y}) | Size: {box.width}×{box.height}
                    </p>
                    {box.confidence && (
                      <p className="text-sm text-gray-600">
                        Confidence: {Math.round(box.confidence * 100)}%
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleExtractFen(box)}
                    disabled={loading}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:bg-gray-300"
                  >
                    Extract FEN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEN Display */}
      {extractedFen && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Extracted FEN:</h3>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
            {extractedFen}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(extractedFen)}
            className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
          >
            Copy to Clipboard
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h4 className="font-semibold mb-2">How to use:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Ensure the Python service is running on localhost:5000</li>
          <li>Select a PDF file containing chess diagrams</li>
          <li>Click "Detect Chess Boards" to find chess diagrams</li>
          <li>Click "Extract FEN" on any detected board to get the position</li>
          <li>Use the extracted FEN in your chess application</li>
        </ol>
      </div>
    </div>
  );
};

export default ChessVisionExample;
