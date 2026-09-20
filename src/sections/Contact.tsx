import { contact, identity } from '../content';

/**
 * Links come from src/content.ts, so this is belt-and-braces: anything that
 * isn't a same-page anchor, a relative path, or an http(s)/mailto URL (a
 * `javascript:` or `data:` href, say) is dropped rather than rendered.
 */
function classifyHref(href: string): { safe: boolean; external: boolean } {
  // No explicit scheme means a relative link: same origin, always fine.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(href)) return { safe: true, external: false };

  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return { safe: false, external: false };
  }

  if (url.protocol === 'mailto:') return { safe: true, external: false };
  if (url.protocol === 'https:' || url.protocol === 'http:') {
    return { safe: true, external: true };
  }
  return { safe: false, external: false };
}

export function Contact() {
  return (
    <>
      <div className="contact__main">
        <h2 className="eyebrow">06 / CONTACT</h2>

        <a className="contact__email" href={`mailto:${identity.email}`}>
          {identity.email}
        </a>

        <p className="prose contact__body">{contact.body}</p>

        <div className="contact__links">
          {contact.links.map((link) => {
            const { safe, external } = classifyHref(link.href);
            if (!safe) return null;

            return (
              <a
                key={link.label}
                href={link.href}
                rel={external ? 'noopener noreferrer' : undefined}
                target={external ? '_blank' : undefined}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>

      <div className="contact__foot">
        <span>{identity.footerLeft}</span>
        <span>{identity.footerRight}</span>
      </div>
    </>
  );
}
