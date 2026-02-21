interface DragOverlayProps {
  isDragging: boolean;
}

export function DragOverlay({ isDragging }: DragOverlayProps) {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 bg-[#3b82f6]/20 border-2 border-dashed border-[#3b82f6] z-50 flex items-center justify-center pointer-events-none" />
  );
}
