import { Plate } from '../components/Plate';
import { about } from '../content';

export function About() {
  return (
    <div className="about">
      <h2 className="eyebrow about__eyebrow">03 / ABOUT</h2>

      <figure className="about__figure">
        <Plate
          className="about__plate"
          src={about.portrait}
          alt="Portrait"
          label="Portrait placeholder"
        />
        {about.portrait ? null : (
          <figcaption className="hatch__caption">[ PORTRAIT — 3:4 ]</figcaption>
        )}
      </figure>

      <p className="about__lead">{about.headline}</p>

      <p className="prose about__body">
        <span className="rsp-long">{about.body}</span>
        <span className="rsp-short">{about.bodyShort}</span>
      </p>

      <div className="about__facts">
        {about.facts.map((fact) => (
          <span className="fact" key={fact.label}>
            <span className="fact__label">{fact.label}</span>
            <span>
              <span className="rsp-long">{fact.value}</span>
              <span className="rsp-short">{fact.short}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
