// Reusable SVG goo filter — blurs source content then pushes the alpha
// channel to hard 0/1, so overlapping/animating shapes fuse into one smooth
// blob instead of showing a soft blur fringe. Give every instance a unique
// `id` so multiple filters on a page don't collide.
export function GooeyFilter({ id = "goo-filter", strength = 10 }) {
  return (
    <svg className="absolute hidden">
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={strength}
            result="blur"
          />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
