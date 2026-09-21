import { marqueeItems } from '../data/site'

/**
 * A quiet capability strip between the hero and the work. The list is rendered
 * twice so the track can loop seamlessly; the duplicate is hidden from
 * assistive technology.
 */
export function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee-track">
        <ul className="marquee-group" aria-label="What we work with">
          {marqueeItems.map((item) => (
            <li key={item}>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <ul className="marquee-group" aria-hidden="true">
          {marqueeItems.map((item) => (
            <li key={`${item}-loop`}>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
