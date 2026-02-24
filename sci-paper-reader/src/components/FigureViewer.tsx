/**
 * FigureViewer component.
 *
 * Renders a lightbox with zoom/pan/pinch controls for paper figures.
 */
import React, { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { Figure } from '../types';

/** Props for FigureViewer. */
interface FigureViewerProps {
  /** Array of figures to display. */
  figures: Figure[];
  /** Whether the viewer is open. */
  isOpen: boolean;
  /** Index of the initially displayed figure. */
  initialIndex?: number;
  /** Called to close the viewer. */
  onClose: () => void;
}

/**
 * FigureViewer renders figures in a zoomable lightbox using react-zoom-pan-pinch.
 * Supports navigation between figures, zoom controls, and keyboard dismissal.
 *
 * @param props - FigureViewerProps
 * @returns The lightbox element, or null if closed.
 */
const FigureViewer: React.FC<FigureViewerProps> = ({
  figures,
  isOpen,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || figures.length === 0) return null;

  const figure = figures[currentIndex];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') setCurrentIndex((i) => Math.max(0, i - 1));
    if (e.key === 'ArrowRight') setCurrentIndex((i) => Math.min(figures.length - 1, i + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      role="dialog"
      aria-label="Figure viewer"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-gray-900 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
          <span className="text-sm font-medium">
            Figure — Page {figure.pageNumber}
            {figures.length > 1 && ` (${currentIndex + 1}/${figures.length})`}
          </span>
          <button
            onClick={onClose}
            aria-label="Close figure viewer"
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Zoom/Pan viewer */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 300 }}>
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={8}
            centerOnInit
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="flex gap-2 p-2 bg-gray-800">
                  <button
                    onClick={() => zoomIn()}
                    className="text-xs text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1"
                    aria-label="Zoom in"
                  >
                    +
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    className="text-xs text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1"
                    aria-label="Zoom out"
                  >
                    −
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="text-xs text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1"
                    aria-label="Reset zoom"
                  >
                    Reset
                  </button>
                </div>
                <TransformComponent wrapperStyle={{ width: '100%', height: '60vh' }}>
                  <img
                    src={figure.dataUrl}
                    alt={figure.caption || `Page ${figure.pageNumber}`}
                    className="max-w-full"
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Caption */}
        {figure.caption && (
          <div className="px-4 py-2 bg-gray-800 text-gray-300 text-sm">
            {figure.caption}
          </div>
        )}

        {/* Navigation */}
        {figures.length > 1 && (
          <div className="flex items-center justify-center gap-4 py-2 bg-gray-800">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="text-white disabled:opacity-40 hover:text-teal-400"
              aria-label="Previous figure"
            >
              ← Prev
            </button>
            <span className="text-gray-400 text-sm">
              {currentIndex + 1} / {figures.length}
            </span>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(figures.length - 1, i + 1))}
              disabled={currentIndex === figures.length - 1}
              className="text-white disabled:opacity-40 hover:text-teal-400"
              aria-label="Next figure"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FigureViewer;
