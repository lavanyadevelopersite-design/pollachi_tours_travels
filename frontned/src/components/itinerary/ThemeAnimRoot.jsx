import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const SECTION_SELECTOR =
  '.print-break-avoid, .theme-policy-card, .theme-cover-screen, [data-theme-anim]';

function inViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 40;
}

export default function ThemeAnimRoot({ children, sx }) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sections = [...root.querySelectorAll(SECTION_SELECTOR)];

    sections.forEach((el, i) => {
      el.classList.add('theme-anim');
      el.classList.remove('theme-anim-left', 'theme-anim-right', 'theme-anim-zoom');
      if (i % 4 === 1) el.classList.add('theme-anim-left');
      else if (i % 4 === 2) el.classList.add('theme-anim-zoom');
      else if (i % 4 === 3) el.classList.add('theme-anim-right');
    });

    if (reduce) {
      sections.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    sections.forEach((el) => {
      if (inViewport(el)) el.classList.add('is-in');
      else io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  return (
    <Box ref={ref} className="theme-anim-root" sx={sx}>
      {children}
    </Box>
  );
}

