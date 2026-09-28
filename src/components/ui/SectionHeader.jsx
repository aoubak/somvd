// Eyebrow + two-tone title (+ optional lede) used by every home section
export default function SectionHeader({ id, eyebrow, title, muted, lede, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-xl text-center' : 'max-w-xl'}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className="mt-3 text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-ink sm:text-4xl">
        {title}
        {muted && <> <span className="text-ink-4">{muted}</span></>}
      </h2>
      {lede && <p className="mt-3 text-[15px] leading-relaxed text-ink-3">{lede}</p>}
    </div>
  );
}
