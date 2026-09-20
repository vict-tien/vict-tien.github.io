import { Stat } from '../components/Stat';
import { identity, intro } from '../content';

export function Intro() {
  return (
    <>
      <div className="intro__main">
        <span className="eyebrow">01 / INTRO</span>
        <h1 className="intro__headline">{intro.headline}</h1>
        <p className="prose intro__body">{intro.body}</p>
        <a className="intro__cta" href={`mailto:${identity.email}`}>
          {intro.cta}
        </a>
      </div>

      <div className="intro__stats">
        {intro.stats.map((stat) => (
          <Stat key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </>
  );
}
