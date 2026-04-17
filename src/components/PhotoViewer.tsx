interface Props {
  src: string
  onClose: () => void
}

export function PhotoViewer({ src, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white text-3xl z-10 leading-none"
        onClick={onClose}
      >
        ✕
      </button>
      <img
        src={src}
        className="max-w-full max-h-full object-contain"
        alt="foto"
        onClick={e => e.stopPropagation()}
      />
    </div>
  )
}
