import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="mx-auto mb-10 max-w-2xl px-5 text-center">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-3 text-emerald-900/70">{sub}</p>}
    </Reveal>
  );
}
