// script.js
// Placeholder for TV static effect or countdown in the .tv-static div 

// Dust motes effect for attic
window.addEventListener('DOMContentLoaded', () => {
  const attic = document.querySelector('.panel.attic');
  const canvas = attic.querySelector('.dust-overlay');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = attic.offsetWidth;
    canvas.height = attic.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Dust mote properties
  const NUM_MOTES = 32;
  const motes = [];
  for (let i = 0; i < NUM_MOTES; i++) {
    motes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 1.0,
      alpha: 0.08 + Math.random() * 0.12,
      speed: 0.1 + Math.random() * 0.15,
      drift: (Math.random() - 0.5) * 0.2
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const m of motes) {
      ctx.save();
      ctx.globalAlpha = m.alpha;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, 2 * Math.PI);
      ctx.fillStyle = '#fffbe6';
      ctx.shadowColor = '#fffbe6';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
      m.x += m.drift;
      m.y -= m.speed;
      if (m.y + m.r < 0) {
        m.x = Math.random() * canvas.width;
        m.y = canvas.height + m.r;
      }
      if (m.x < 0) m.x = canvas.width;
      if (m.x > canvas.width) m.x = 0;
    }
    requestAnimationFrame(animate);
  }
  animate();

  // Basement flickering light effect
  const basement = document.querySelector('.panel.basement');
  const flickerGlow = basement ? basement.querySelector('.flicker-glow') : null;
  const basementDarken = basement ? basement.querySelector('.basement-darken') : null;
  const flickerAudio = basement ? basement.querySelector('.flicker-audio') : null;

  if (flickerGlow && basementDarken) {
    let flickerTimeout;
    let isFlickering = false;
    
    // Initialize light as off
    flickerGlow.style.opacity = '0';

    function startFlickerSequence() {
      if (isFlickering) return;
      isFlickering = true;
      
      // Play buzzing sound when light comes on (only if in basement and not muted)
      if (flickerAudio && currentSectionIndex === 4 && !isMuted) {
        flickerAudio.volume = 0.5; // Reduced volume for flicker sound (was 1.0)
        flickerAudio.currentTime = 0;
        flickerAudio.play().catch(()=>{});
      }

      function flickerSequence() {
        const sequence = [
          { opacity: 0.85, darken: 0, duration: 200 },
          { opacity: 0.7, darken: 0, duration: 150 },
          { opacity: 0.95, darken: 0, duration: 300 },
          { opacity: 0.6, darken: 0, duration: 100 },
          { opacity: 0.9, darken: 0, duration: 250 },
          { opacity: 0.8, darken: 0, duration: 200 },
          { opacity: 0.95, darken: 0, duration: 400 },
          { opacity: 0.7, darken: 0, duration: 150 },
          { opacity: 0.9, darken: 0, duration: 300 },
          { opacity: 0.85, darken: 0, duration: 200 }
        ];

        let currentStep = 0;

        function doFlicker() {
          if (currentStep >= sequence.length) {
            // End sequence - turn off light
            flickerGlow.style.animation = 'none';
            flickerGlow.style.opacity = '0';
            basementDarken.style.opacity = '0.92';
            isFlickering = false;
            
            // Stop buzzing sound
            if (flickerAudio) {
              flickerAudio.pause();
              flickerAudio.currentTime = 0;
            }
            return;
          }

          const step = sequence[currentStep];
          flickerGlow.style.opacity = step.opacity;
          basementDarken.style.opacity = step.darken;
          
          currentStep++;
          setTimeout(doFlicker, step.duration);
        }

        doFlicker();
      }

      flickerSequence();
    }

    // Start flicker sequence every 8-15 seconds
    function scheduleNextFlicker() {
      const delay = 8000 + Math.random() * 7000; // 8-15 seconds
      flickerTimeout = setTimeout(() => {
        startFlickerSequence();
        scheduleNextFlicker();
      }, delay);
    }

    scheduleNextFlicker();
  }

  // Ambient sound design (robust per-section logic)
  const muteBtn = document.getElementById('mute-toggle');
  const panels = Array.from(document.querySelectorAll('.panel'));
  const audios = panels.map(panel => panel.querySelector('.room-audio'));
  let currentAudio = null;
  let isMuted = false;
  let currentSectionIndex = 0; // Track current section globally

  audios.forEach(a => { if (a) { a.muted = true; a.volume = 0.35; } });
  muteBtn.textContent = '🔇';

  function setMute(state) {
    isMuted = state;
    audios.forEach(a => { if (a) a.muted = isMuted; });
    
    // Handle flicker audio mute state
    const flickerAudio = document.querySelector('.flicker-audio');
    if (flickerAudio) {
      if (isMuted) {
        flickerAudio.pause();
        flickerAudio.currentTime = 0;
      }
    }
    
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.classList.toggle('unmuted', !isMuted);
    playCurrentRoomAudio(); // Always update playback on mute toggle
  }

  // Intersection Observer for section detection
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.51 // More than half visible
  };

  const panelVisibility = new Array(panels.length).fill(false);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = panels.indexOf(entry.target);
      panelVisibility[idx] = entry.isIntersecting;
    });
    // Find the topmost visible panel (or the one with the largest intersection ratio)
    let maxRatio = 0;
    let maxIdx = 0;
    entries.forEach(entry => {
      const idx = panels.indexOf(entry.target);
      if (entry.intersectionRatio > maxRatio) {
        maxRatio = entry.intersectionRatio;
        maxIdx = idx;
      }
    });
    if (currentSectionIndex !== maxIdx) {
      currentSectionIndex = maxIdx;
      playCurrentRoomAudio();
      
      // Update hamburger menu position based on current section
      const hamburgerMenu = document.getElementById('hamburger-menu');
      const navigationMenu = document.querySelector('.navigation-menu');
      
      if (hamburgerMenu) {
        if (maxIdx === 0) {
          // Attic section - keep menu in current position
          hamburgerMenu.classList.remove('top-position');
          if (navigationMenu) navigationMenu.classList.remove('top-position');
        } else {
          // Other sections - move menu to top
          hamburgerMenu.classList.add('top-position');
          if (navigationMenu) navigationMenu.classList.add('top-position');
        }
      }
    }
  }, observerOptions);

  panels.forEach(panel => observer.observe(panel));

  function typewriterEffect(label) {
    if (!label) return;
    const text = label.getAttribute('data-fulltext') || label.innerText;
    label.setAttribute('data-fulltext', text);
    label.innerText = '';
    label.classList.add('typewriter');
    let i = 0;
    function type() {
      label.innerText = text.slice(0, i);
      i++;
      if (i <= text.length) {
        setTimeout(type, 28 + Math.random() * 32);
      } else {
        label.innerText = text;
        label.classList.remove('typewriter');
      }
    }
    type();
  }

  // Randomized labels for demo
  const labelOptions = {
    'living-room': [
      "Launch Countdown: The podcast goes live in <span id='living-room-countdown-2'>Loading...</span> days",
      "Coming Soon: 'The Disappearance of Sarah Mitchell' - Our first episode",
      "Coming Soon: 'Voices in the Attic' - Investigation begins October 1st",
      "Coming Soon: 'The Basement Tapes' - Exclusive Patreon content",
      "Coming Soon: 'Shadows in the Living Room' - The investigation continues"
    ]
  };

  // Living room message cycling
  let livingRoomMessageIndex = 0;
  let livingRoomMessageTimer = null;
  let isInLivingRoom = false;
  let isTransitioning = false; // Prevent overlapping transitions

  // Function to get current countdown days
  function getCurrentCountdownDays() {
    const launchDate = new Date('October 1, 2025 00:00:00').getTime();
    const now = new Date().getTime();
    const distance = launchDate - now;
    
    if (distance > 0) {
      return Math.floor(distance / (1000 * 60 * 60 * 24));
    } else {
      return 0;
    }
  }

  // Typewriter effect for living room messages
  function typewriterEffect(label, text, onComplete) {
    if (!label || !text) return;
    
    let currentText = label.textContent;
    let currentIndex = currentText.length;
    
    // First, delete current text letter by letter (only if there's text to delete)
    function deleteText() {
      if (currentIndex > 0) {
        label.textContent = currentText.substring(0, currentIndex);
        currentIndex--;
        setTimeout(deleteText, 25); // Delete speed (doubled from 50ms)
      } else {
        // Start typing new text
        typeText();
      }
    }
    
    // Then type new text letter by letter
    function typeText() {
      let typeIndex = 0;
      function type() {
        if (typeIndex < text.length) {
          label.textContent = text.substring(0, typeIndex + 1);
          typeIndex++;
          setTimeout(type, 40); // Type speed (doubled from 80ms)
        } else {
          // Transition complete
          isTransitioning = false;
          if (onComplete) onComplete();
        }
      }
      type();
    }
    
    // If there's no current text, skip deletion and go straight to typing
    if (currentText.trim() === '') {
      typeText();
    } else {
      // Start the delete process
      deleteText();
    }
  }

  function getRandomLabel(section) {
    const opts = labelOptions[section];
    if (!opts) return null;
    return opts[Math.floor(Math.random() * opts.length)];
  }

  let lastTypewriterIdx = -1;
  let lastRandomLabel = {};

  function playCurrentRoomAudio() {
    const idx = currentSectionIndex;
    // Debug: log current section index and class
    if (idx !== -1) {
      const panel = panels[idx];
      console.log('Current section index:', idx, 'Class:', panel.className);
      // Typewriter effect for label (only when section changes)
      panels.forEach((p, i) => {
        const label = p.querySelector('.section-label');
        const contactPhrases = p.querySelector('.contact-phrases');
        if (i === idx && label) {
          // Handle living-room section label cycling
          if (i !== 0 && p.classList.contains('living-room')) { // skip attic, only process living-room
            if (i === idx) { // Only when living room is active
              if (!isInLivingRoom) {
                // First time entering living room - show countdown with typewriter effect
                isInLivingRoom = true;
                livingRoomMessageIndex = 0;
                const currentDays = getCurrentCountdownDays();
                const countdownMessage = `Launch Countdown: The podcast goes live in ${currentDays} days`;
                
                // Clear the section-label first, then type out the countdown message
                label.textContent = '';
                isTransitioning = true;
                typewriterEffect(label, countdownMessage, () => {
                  label.setAttribute('data-fulltext', countdownMessage);
                  isTransitioning = false; // Allow next transition to start
                });
                
                // Start cycling after 6 seconds
                livingRoomMessageTimer = setTimeout(() => {
                  if (isInLivingRoom) {
                    livingRoomMessageIndex = 1; // Start with first "Coming Soon" message
                    const nextMessage = labelOptions['living-room'][livingRoomMessageIndex];
                    
                    // Use typewriter effect to transition to next message
                    isTransitioning = true;
                    typewriterEffect(label, nextMessage, () => {
                      label.setAttribute('data-fulltext', nextMessage);
                    });
                    
                    // Continue cycling every 4 seconds
                    const cycleInterval = setInterval(() => {
                      if (!isInLivingRoom) {
                        clearInterval(cycleInterval);
                        return;
                      }
                      
                      // Only start new transition if not currently transitioning
                      if (!isTransitioning) {
                        livingRoomMessageIndex = (livingRoomMessageIndex + 1) % labelOptions['living-room'].length;
                        if (livingRoomMessageIndex === 0) livingRoomMessageIndex = 1; // Skip countdown in cycle
                        const cycleMessage = labelOptions['living-room'][livingRoomMessageIndex];
                        
                        // Use typewriter effect for each transition
                        isTransitioning = true;
                        typewriterEffect(label, cycleMessage, () => {
                          label.setAttribute('data-fulltext', cycleMessage);
                        });
                      }
                    }, 4000);
                  }
                }, 6000);
              }
            } else {
              // Not in living room - reset state
              if (isInLivingRoom) {
                isInLivingRoom = false;
                if (livingRoomMessageTimer) {
                  clearTimeout(livingRoomMessageTimer);
                  livingRoomMessageTimer = null;
                }
              }
            }
          }
          if (lastTypewriterIdx !== idx) {
            if (panel.classList.contains('contact') && contactPhrases) {
              typewriterEffect(contactPhrases);
            } else {
              typewriterEffect(label);
            }
            lastTypewriterIdx = idx;
          }
        } else {
          // Reset label to full text if not active
          if (contactPhrases) {
            const full = contactPhrases.getAttribute('data-fulltext');
            if (full) contactPhrases.innerText = full;
            contactPhrases.classList.remove('typewriter');
          }
          if (label) {
            const full = label.getAttribute('data-fulltext');
            if (full) label.innerText = full;
            label.classList.remove('typewriter');
          }
        }
      });
    } else {
      console.log('No section in view');
    }
    audios.forEach((audio, i) => {
      if (!audio) return;
      if (i === idx && !isMuted) {
        if (audio !== currentAudio) {
          if (currentAudio) currentAudio.pause();
          audio.currentTime = 0;
          audio.play().catch(()=>{});
          currentAudio = audio;
        } else if (audio.paused) {
          audio.play().catch(()=>{});
        }
      } else {
        audio.pause();
      }
    });

    // Set specific audio volumes
    panels.forEach((panel, i) => {
      const audio = audios[i];
      if (!audio) return;
      if (panel.classList.contains('contact')) {
        audio.volume = 0.01; // Very subtle clock ambience at 1% volume
      } else if (panel.classList.contains('living-room')) {
        audio.volume = 0.1; // 10% volume for cassette tape sound (was 0.2)
      } else if (panel.classList.contains('attic')) {
        audio.volume = 0.25; // 25% volume for attic rain (was 0.5)
      } else if (panel.classList.contains('bathroom')) {
        audio.volume = 0.05; // 5% volume for bathroom dripping water
      } else if (panel.classList.contains('basement')) {
        audio.volume = 0.075; // 7.5% volume for basement wind/water (30% of 0.25)
      } else {
        audio.volume = 0.5; // Default volume for other sections (was 1.0)
      }
    });

    // Handle static audio separately
    const livingRoomPanel = document.querySelector('.panel.living-room');
    if (livingRoomPanel) {
      const staticAudio = livingRoomPanel.querySelector('.static-audio');
      if (staticAudio) {
        if (currentSectionIndex === 1 && !isMuted) { // Living room is index 1
                  if (staticAudio.paused) {
          staticAudio.volume = 0.025; // 2.5% volume for static noise (was 0.05)
          staticAudio.play().catch(()=>{});
        }
        } else {
          staticAudio.pause();
        }
      }
    }

    // Handle flicker audio separately
    const basementPanel = document.querySelector('.panel.basement');
    if (basementPanel) {
      const flickerAudio = basementPanel.querySelector('.flicker-audio');
      if (flickerAudio) {
        // Only manage flicker audio, don't let main audio system control it
        if (currentSectionIndex !== 4) { // Not in basement (index 4)
          flickerAudio.pause();
          flickerAudio.currentTime = 0;
        } else {
          // In basement - let the flicker sequence control the audio
          // Don't pause it here, let it play during flicker sequences
        }
      }
    }


  }

  muteBtn.addEventListener('click', () => {
    setMute(!isMuted);
  });

    // Initial call
  setTimeout(playCurrentRoomAudio, 200);
  
  // Lazy loading for videos below the fold
  const lazyVideos = document.querySelectorAll('video[data-src]');
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const video = entry.target;
        video.src = video.dataset.src;
        video.removeAttribute('data-src');
        videoObserver.unobserve(video);
      }
    });
  }, { rootMargin: '50px' }); // Start loading 50px before video comes into view
  
  lazyVideos.forEach(video => videoObserver.observe(video));
  
  // Background loading after attic is ready
  function startBackgroundLoading() {
    // Load all remaining videos in background
    const backgroundVideos = document.querySelectorAll('video[data-src]');
    backgroundVideos.forEach(video => {
      video.src = video.dataset.src;
      video.removeAttribute('data-src');
    });
    
    // Preload audio files for smooth playback
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      if (audio.src) {
        audio.preload = 'metadata';
        // Trigger a small load to start buffering
        audio.load();
      }
    });
    
    // Preload images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
    
    console.log('Background loading started - rest of site loading in background');
  }
  
  // Start background loading after attic is fully loaded
  window.addEventListener('load', () => {
    // Small delay to ensure attic is fully rendered
    setTimeout(startBackgroundLoading, 1000);
  });

  // Parallax effect for backgrounds has been fully removed.

  // Set --vh custom property for mobile viewport height fix
  function setPanelHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  window.addEventListener('resize', setPanelHeight);
  setPanelHeight();

  // Countdown timer functionality
  function updateCountdown() {
    const launchDate = new Date('October 1, 2025 00:00:00').getTime();
    const now = new Date().getTime();
    const distance = launchDate - now;

    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const atticDaysElement = document.getElementById('attic-days');
      if (atticDaysElement) {
        atticDaysElement.textContent = days.toString().padStart(2, '0');
      }
      
      // Update living room countdown
      const livingRoomCountdown = document.getElementById('living-room-countdown');
      if (livingRoomCountdown) {
        livingRoomCountdown.textContent = days.toString();
      }
      
      // Update living room countdown in section label
      const livingRoomCountdown2 = document.getElementById('living-room-countdown-2');
      if (livingRoomCountdown2) {
        livingRoomCountdown2.textContent = days.toString();
      }
    } else {
      // Launch day has arrived
      const atticDaysElement = document.getElementById('attic-days');
      if (atticDaysElement) {
        atticDaysElement.textContent = '00';
      }
      
      // Update living room countdown to show launch day
      const livingRoomCountdown = document.getElementById('living-room-countdown');
      if (livingRoomCountdown) {
        livingRoomCountdown.textContent = '0';
      }
      
      // Update living room countdown in section label
      const livingRoomCountdown2 = document.getElementById('living-room-countdown-2');
      if (livingRoomCountdown2) {
        livingRoomCountdown2.textContent = '0';
      }
      
      const countdownDisplay = document.querySelector('.countdown-display');
      if (countdownDisplay) {
        countdownDisplay.innerHTML = '<div class="countdown-label">🎉 LAUNCH DAY! 🎉</div><div class="countdown-number">LIVE</div><div class="countdown-subtitle">THE PODCAST IS NOW LIVE!</div>';
      }
    }
  }

  // Update countdown every day (86400000 ms = 24 hours)
  updateCountdown();
  setInterval(updateCountdown, 86400000);

  // Hamburger menu functionality
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const navigationMenu = document.getElementById('navigation-menu');
  const menuLinks = document.querySelectorAll('.menu-link');

  hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    navigationMenu.classList.toggle('active');
  });

  // Close menu when clicking on a link
  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
      
      hamburgerMenu.classList.remove('active');
      navigationMenu.classList.remove('active');
    });
  });

  // Close menu when clicking outside
  navigationMenu.addEventListener('click', (e) => {
    if (e.target === navigationMenu) {
      hamburgerMenu.classList.remove('active');
      navigationMenu.classList.remove('active');
    }
  });

  // Living room dust motes effect
  const livingRoom = document.querySelector('.panel.living-room');
  const livingCanvas = livingRoom ? livingRoom.querySelector('.living-dust') : null;
  if (livingCanvas) {
    const ctx = livingCanvas.getContext('2d');
    function resizeLivingCanvas() {
      livingCanvas.width = livingRoom.offsetWidth;
      livingCanvas.height = livingRoom.offsetHeight;
    }
    resizeLivingCanvas();
    window.addEventListener('resize', resizeLivingCanvas);
    // Force resize when living room becomes visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) resizeLivingCanvas();
      });
    }, { threshold: 0.1 });
    observer.observe(livingRoom);
    const NUM_MOTES = 18;
    const motes = [];
    for (let i = 0; i < NUM_MOTES; i++) {
      motes.push({
        x: Math.random() * livingCanvas.width,
        y: Math.random() * livingCanvas.height,
        r: 1.2 + Math.random() * 1.6,
        alpha: 0.07 + Math.random() * 0.09,
        speed: 0.04 + Math.random() * 0.09,
        drift: (Math.random() - 0.5) * 0.12
      });
    }
    function animateLivingDust() {
      ctx.clearRect(0, 0, livingCanvas.width, livingCanvas.height);
      for (const m of motes) {
        ctx.save();
        ctx.globalAlpha = m.alpha;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff7c2';
        ctx.shadowColor = '#fff7c2';
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.restore();
        m.x += m.drift;
        m.y -= m.speed;
        if (m.y + m.r < 0) {
          m.x = Math.random() * livingCanvas.width;
          m.y = livingCanvas.height + m.r;
        }
        if (m.x < 0) m.x = livingCanvas.width;
        if (m.x > livingCanvas.width) m.x = 0;
      }
      requestAnimationFrame(animateLivingDust);
    }
    animateLivingDust();
  }
});

// Modal functionality - moved outside main event listener
document.addEventListener('DOMContentLoaded', function() {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.querySelector('.modal-close');

  console.log('Modal elements found:', { modalOverlay, modalBody, modalClose });

  // Bio content
  const bios = {
    quinn: {
      title: 'About Quinn',
      content: `
        <h2>Quinn</h2>
        <p>I'm Quinn–co-host of Last Seen in the Twilight Zone. I've been a fierce Victim Advocate here in Binghamton, NY since 2011 when I graduated from SUNY Cortland. I received my degrees in both Sociology and Psychology with a deep curiosity about human nature and the social dynamics that fosters criminal behavior. For me, Victim Advocacy isn't vocational–it's aligned with my life's purpose. I experienced trauma throughout my childhood and know firsthand the pain of prolonged silence. Sharing my story as an adult has created so many pathways to healing that simply never seemed possible to me, as a child that experienced sexual abuse. As an adult, I've able seek justice for myself during the #MeToo era, as a direct result of the passing of the Child Victims Act.</p>
        <p>Allie and I are here to share stories for those who no longer can. For the families sitting at home desperately waiting for answers and praying for justice. For our neighbors who deserve protection, who are often silenced and who I am proud to advocate for. And to shine our light on some of the very real (and very dark) events that we remember most vividly while growing up, here in the Twilight Zone. It is an absolute honor and a privilege to share these stories and I will do my best to do so with grace; for the good of all and the harm of none.</p>
      `
    },
    allie: {
      title: 'About Allie',
      content: `
        <h2>Allie</h2>
        <p>Hi, I'm Allie, co-host of Last Seen in the Twilight Zone. My interest in true crime runs deeper than curiosity; it's rooted in personal experience. Growing up in this area felt like living in the Twilight Zone, surrounded by stories that didn't make sense and justice that often felt out of reach. As I got older, that feeling never left. I've now spent over a decade working in fields that keep me into close contact with high-profile criminal cases and their actual victims. I've seen firsthand how the system works and how often it fails the very people it's designed to protect.</p>
        <p>Then, in 2015, my aunt was murdered. Ever since, I've had a drive to seek truth, to ask the hard questions, and to never forget the people behind the headlines. About the only TV I watch is true crime documentaries. Together, Quinn and I will dig into cold cases, murders, and disappearances that deserve more attention. We share these stories with empathy, accuracy, and a relentless determination to bring light to the darkest corners of the actual Twilight Zone.</p>
        <p>This podcast is for the unheard. The lost. The silenced. Because every victim has a story, and every story deserves to be told.</p>
      `
    }
  };

  // Check if modal elements exist
  if (!modalOverlay || !modalBody || !modalClose) {
    console.error('Modal elements not found:', { modalOverlay, modalBody, modalClose });
    return;
  }

  // About link clicks
  document.addEventListener('click', function(e) {
    console.log('Click detected on:', e.target);
    if (e.target.classList.contains('about-link')) {
      e.preventDefault();
      const modalType = e.target.getAttribute('data-modal');
      console.log('About link clicked:', modalType);
      openModal(modalType);
    }
  });

  // Close modal
  modalClose.addEventListener('click', function() {
    console.log('Close button clicked');
    closeModal();
  });
  
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
      console.log('Overlay clicked');
      closeModal();
    }
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      console.log('Escape key pressed');
      closeModal();
    }
  });

  function openModal(type) {
    console.log('Opening modal for:', type);
    const bio = bios[type];
    if (bio) {
      modalBody.innerHTML = bio.content;
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      console.log('Modal opened:', type);
    } else {
      console.error('Bio not found for type:', type);
    }
  }

  function closeModal() {
    console.log('Closing modal');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Test modal function (for debugging)
  window.testModal = function() {
    console.log('Testing modal...');
    openModal('quinn');
  };
});

 