export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/80">s.w</div>
        <div className="footer__links">
          <a href="https://github.com/ozdotdotdot/smashDA" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            Twitter/X
          </a>
          <a href="mailto:ozair@smash.watch">Email</a>
        </div>
        <p className="text-xs text-foreground/55">
          Personal project by Ozair Khan. Not affiliated with Nintendo or start.gg.
        </p>
      </div>
    </footer>
  );
}
