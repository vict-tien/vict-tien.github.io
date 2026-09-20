interface PlateProps {
  /** A single block class, e.g. "detail__plate" or "about__plate". */
  className: string;
  /** Image path, or null to keep the design's hatched placeholder plate. */
  src?: string | null;
  alt?: string;
  /** Caption printed inside the plate while it's a placeholder. */
  caption?: string;
  /** Accessible name when the caption lives outside the plate. */
  label?: string;
}

/**
 * The hatched "artwork goes here" plate from the design. Swap in a real image
 * by setting `image` (cases) or `portrait` (about) in `src/content.ts`.
 */
export function Plate({ className, src, alt = '', caption, label }: PlateProps) {
  if (src) {
    return (
      <div className={`hatch ${className} ${className}--photo`}>
        <img className="hatch__img" src={src} alt={alt} />
      </div>
    );
  }

  return (
    <div
      className={`hatch ${className}`}
      role="img"
      aria-label={label ?? caption ?? 'Image placeholder'}
    >
      {caption ? <span className="hatch__caption">{caption}</span> : null}
    </div>
  );
}
