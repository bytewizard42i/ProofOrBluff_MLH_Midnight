// This component deliberately contains presentation only: there are no links,
// click handlers, analytics hooks, or network requests beyond loading the two
// local images. That keeps these clearly disclosed examples unobtrusive and
// avoids implying that either brand has endorsed the game.
const exampleSponsors = [
  {
    name: 'Lace',
    imageSource: '/lace-sponsor-placeholder.png',
    copy: 'A lighter touch for your Web3 journey.',
    position: 'left',
  },
  {
    name: 'Trezor',
    imageSource: '/trezor-sponsor-placeholder.png',
    copy: 'Keep security close to the table.',
    position: 'right',
  },
];

export default function SponsorRail() {
  return (
    // One landmark groups both examples for screen-reader users, while CSS
    // places each tile independently at the wide-screen perimeter. On smaller
    // screens the entire landmark is hidden so it can never cover game controls.
    <aside className="sponsor-rail" aria-label="Example sponsors">
      {exampleSponsors.map((sponsor) => (
        <section
          className={`sponsor-tile sponsor-tile--${sponsor.position}`}
          key={sponsor.name}
          aria-label={`${sponsor.name}, example sponsor`}
        >
          {/* The artwork supplies the brand mark, but all disclosure and copy
              remain real HTML so they stay accessible, selectable, and easy
              for John to revise without regenerating an image. */}
          <img
            className="sponsor-tile__image"
            src={sponsor.imageSource}
            alt={`${sponsor.name} example sponsor concept artwork`}
            loading="lazy"
            decoding="async"
          />
          <p className="sponsor-tile__disclosure">Example sponsor</p>
          <h2 className="sponsor-tile__name">{sponsor.name}</h2>
          <p className="sponsor-tile__copy">{sponsor.copy}</p>
        </section>
      ))}
    </aside>
  );
}
