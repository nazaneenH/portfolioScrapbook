// Progressive enhancement: the portfolio remains readable without JavaScript.

// Show a real portrait only when the referenced image has successfully loaded.
const portrait = document.querySelector('.portrait');
const photo = portrait?.querySelector('img');
if (portrait && photo) {
  const showPhoto = () => portrait.classList.add('has-photo');
  if (photo.complete && photo.naturalWidth > 0) showPhoto();
  else photo.addEventListener('load', showPhoto, { once: true });
}

// Original scrapbook behaviour restored: hover to play, leave to pause.
// Every frame has a FIXED 16:9 ratio rather than being resized from metadata.
// Touch/keyboard users get a play/pause button. Playback is silent and loops.
function setupHoverVideo(wrapper) {
  const video = wrapper.querySelector('video');
  if (!video) return;

  // With JavaScript disabled, the video retains native controls in the HTML.
  // With JS enabled, we provide the scrapbook's hover behaviour instead.
  video.controls = false;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  const description = video.getAttribute('aria-label') || 'project video';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'video-toggle';
  wrapper.appendChild(toggle);

  function updateButton() {
    const playing = !video.paused && !video.ended;
    wrapper.classList.toggle('is-playing', playing);
    toggle.textContent = playing ? 'Ⅱ  Pause demo' : '▶  Play demo';
    toggle.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${description}`);
    toggle.setAttribute('aria-pressed', String(playing));
  }

  function playVideo() {
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => { updateButton(); });
    }
  }

  function pauseVideo() {
    if (!video.paused) video.pause();
  }

  // Mouse-only hover behaviour: entering automatically plays, leaving pauses.
  // On touch devices, a tap should toggle rather than accidentally hover-play.
  function hasMouseHover() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }
  wrapper.addEventListener('mouseenter', () => {
    if (hasMouseHover()) playVideo();
  });
  wrapper.addEventListener('mouseleave', () => {
    if (hasMouseHover()) pauseVideo();
  });

  // Also works on phones, touchscreens and when navigating by keyboard.
  toggle.addEventListener('click', () => {
    if (video.paused) playVideo();
    else pauseVideo();
  });

  video.addEventListener('play', updateButton);
  video.addEventListener('pause', updateButton);
  video.addEventListener('ended', updateButton);

  // Reveal the footage only after it can render. If missing, keep the designed
  // scrapbook placeholder instead of showing a broken player.
  function showMedia() { wrapper.classList.add('has-media'); }
  if (video.readyState >= 2) showMedia();
  video.addEventListener('loadeddata', showMedia);
  video.addEventListener('error', () => {
    wrapper.classList.remove('has-media');
    toggle.disabled = true;
    toggle.textContent = 'Video unavailable';
  });
  updateButton();
}

document.querySelectorAll('.project-media').forEach(setupHoverVideo);

// Keep the year updated automatically.
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Visually highlight the active section in the navigation.
const navLinks = [...document.querySelectorAll('.main-nav a')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }
  }, { rootMargin: '-25% 0px -60% 0px' });
  document.querySelectorAll('#about, #projects, #experience, #contact')
    .forEach(section => sectionObserver.observe(section));
}


// If the original certificate preview files are missing while setting up the
// website, keep the scrapbook placeholder rather than a broken image icon.
document.querySelectorAll('.certificate-preview img').forEach((img) => {
  const showFallback = () => { img.hidden = true; };
  img.addEventListener('error', showFallback, { once: true });
  if (img.complete && img.naturalWidth === 0) showFallback();
});
