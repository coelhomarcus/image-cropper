import { useState, useRef, useCallback } from "react";

interface UseDragDropOptions {
  onFileDrop: (file: File) => void;
  listenOnDocument?: boolean;
}

export function useDragDrop({ onFileDrop, listenOnDocument }: UseDragDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation?.();
    dragCounter.current++;
    const dt = e instanceof DragEvent ? e.dataTransfer : (e as React.DragEvent).dataTransfer;
    if (dt?.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation?.();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation?.();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent | DragEvent) => {
    e.preventDefault();
    e.stopPropagation?.();
    setIsDragging(false);
    dragCounter.current = 0;

    const dt = e instanceof DragEvent ? e.dataTransfer : (e as React.DragEvent).dataTransfer;
    const file = dt?.files?.[0];
    if (file) onFileDrop(file);
  }, [onFileDrop]);

  const dragProps = listenOnDocument ? {} : {
    onDragEnter: handleDragEnter as React.DragEventHandler,
    onDragLeave: handleDragLeave as React.DragEventHandler,
    onDragOver: handleDragOver as React.DragEventHandler,
    onDrop: handleDrop as React.DragEventHandler,
  };

  return {
    isDragging,
    dragProps,
    handlers: { handleDragEnter, handleDragLeave, handleDragOver, handleDrop },
  };
}
