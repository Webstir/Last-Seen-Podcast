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
  
  console.log('Basement elements found:', {
    basement: !!basement,
    flickerGlow: !!flickerGlow,
    basementDarken: !!basementDarken,
    flickerAudio: !!flickerAudio
  });

  if (flickerGlow && basementDarken) {
    let flickerTimeout;
    let isFlickering = false;
    
    // Initialize light as on
    flickerGlow.style.opacity = '0.95';

    function startFlickerSequence() {
      if (isFlickering) return;
      isFlickering = true;
      
      // Debug: log flicker conditions
      console.log('Flicker sequence started:', {
        flickerAudio: !!flickerAudio,
        currentSectionIndex,
        isMuted,
        shouldPlayAudio: flickerAudio && currentSectionIndex === 4 && !isMuted
      });
      
      // Play buzzing sound when light comes on (only if in basement and not muted)
      if (flickerAudio && currentSectionIndex === 4 && !isMuted) {
        console.log('Playing flicker audio');
        console.log('Flicker audio state before play:', {
          muted: flickerAudio.muted,
          volume: flickerAudio.volume,
          paused: flickerAudio.paused,
          currentTime: flickerAudio.currentTime
        });
        
        flickerAudio.volume = 0.5; // Reduced volume for flicker sound (was 1.0)
        flickerAudio.currentTime = 0;
        flickerAudio.muted = false; // Ensure it's not muted
        
        flickerAudio.play().catch((e) => {
          console.log('Flicker audio play failed:', e);
        });
        
        console.log('Flicker audio state after play attempt:', {
          muted: flickerAudio.muted,
          volume: flickerAudio.volume,
          paused: flickerAudio.paused
        });
      } else {
        console.log('Flicker audio not playing because:', {
          noFlickerAudio: !flickerAudio,
          wrongSection: currentSectionIndex !== 4,
          isMuted
        });
      }

      function flickerSequence() {
        const sequence = [
          { opacity: 0.95, darken: 0, duration: 800 },      // Start bright and stay on
          { opacity: 0.3, darken: 0.8, duration: 50 },      // Quick dark flicker
          { opacity: 0.9, darken: 0, duration: 600 },        // Back to bright
          { opacity: 0.2, darken: 0.9, duration: 40 },      // Very quick dark flicker
          { opacity: 0.95, darken: 0, duration: 700 },       // Bright again
          { opacity: 0.4, darken: 0.7, duration: 60 },      // Quick dark flicker
          { opacity: 0.9, darken: 0, duration: 500 },        // Bright
          { opacity: 0.1, darken: 0.95, duration: 30 },     // Very brief dark flicker
          { opacity: 0.95, darken: 0, duration: 900 },       // Bright and stable
          { opacity: 0.3, darken: 0.8, duration: 45 }        // Final quick dark flicker
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
      console.log('Scheduling next flicker in', Math.round(delay/1000), 'seconds');
      flickerTimeout = setTimeout(() => {
        console.log('Flicker timeout triggered, starting sequence');
        startFlickerSequence();
        scheduleNextFlicker();
      }, delay);
    }

    console.log('Starting flicker system');
    scheduleNextFlicker();
  } else {
    console.log('Flicker system not started - missing elements:', {
      flickerGlow: !!flickerGlow,
      basementDarken: !!basementDarken
    });
  }

  // Ambient sound design (robust per-section logic)
  const muteBtn = document.getElementById('mute-toggle');
  const panels = Array.from(document.querySelectorAll('.panel'));
  const audios = panels.flatMap(panel => Array.from(panel.querySelectorAll('.room-audio')));
  let currentAudio = null;
  let isMuted = false;
  let currentSectionIndex = 0; // Track current section globally

  audios.forEach(a => { 
    if (a) { 
      a.muted = true; 
      a.volume = 0.35;
      a.pause(); // Ensure all audio is paused on initialization
      a.currentTime = 0;
    } 
  });
  
  // Ensure flicker audio is not muted and ready to play
  if (flickerAudio) {
    flickerAudio.muted = false;
    flickerAudio.volume = 0.5;
    console.log('Flicker audio initialized:', {
      muted: flickerAudio.muted,
      volume: flickerAudio.volume,
      paused: flickerAudio.paused
    });
  }
  
  muteBtn.textContent = '🔇';

  function setMute(state) {
    isMuted = state;
    console.log('Mute state changed to:', isMuted);
    
    if (isMuted) {
      // When muting, pause all audio and ensure they stay paused
      audios.forEach(a => { 
        if (a) {
          a.muted = true;
          a.pause();
          a.currentTime = 0;
        }
      });
      
      // Handle flicker audio mute state
      if (flickerAudio) {
        console.log('Muting flicker audio');
        flickerAudio.pause();
        flickerAudio.currentTime = 0;
      }
      
      
      // Clear current audio reference
      currentAudio = null;
    } else {
      // When unmuting, just set muted property and let playCurrentRoomAudio handle playback
      audios.forEach(a => { if (a) a.muted = false; });
      
      // Ensure flicker audio is ready to play when unmuting
      if (flickerAudio) {
        console.log('Unmuting flicker audio');
        flickerAudio.muted = false;
      }
      
    }
    
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    muteBtn.classList.toggle('unmuted', !isMuted);
    
    // Only call playCurrentRoomAudio if we're unmuting
    if (!isMuted) {
      playCurrentRoomAudio();
    }
  }

  // Helper function to force stop all audio
  function forceStopAllAudio() {
    audios.forEach(a => { 
      if (a) {
        a.pause();
        a.currentTime = 0;
        a.muted = true;
      }
    });
    
    // Don't stop flicker audio - let it work independently
    // if (flickerAudio) {
    //   flickerAudio.pause();
    //   flickerAudio.currentTime = 0;
    // }
    
    
    currentAudio = null;
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
      console.log('Section changed to index:', maxIdx, 'Panel class:', panels[maxIdx]?.className);
      
      // Only play audio if not muted
      if (!isMuted) {
        playCurrentRoomAudio();
      }
      
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
      "Launch Countdown: The podcast goes live in <span id='living-room-countdown-2'>Loading...</span> days"
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
    
    // If there's no current text, go straight to typing
    if (currentText.trim() === '') {
      typeText();
      return;
    }
    
    // First, fade out current text
    function fadeOut() {
      label.style.transition = 'opacity 1.5s ease-out';
      label.style.opacity = '0';
      
      setTimeout(() => {
        // After fade out, start typing new text
        typeText();
      }, 1500); // Wait for fade out to complete
    }
    
    // Then type new text letter by letter
    function typeText() {
      // Reset opacity and start typing
      label.style.transition = 'opacity 0.3s ease-in';
      label.style.opacity = '1';
      
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
    
    // Start the fade out process
    fadeOut();
  }

  function getRandomLabel(section) {
    const opts = labelOptions[section];
    if (!opts) return null;
    return opts[Math.floor(Math.random() * opts.length)];
  }

  let lastTypewriterIdx = -1;
  let lastRandomLabel = {};

  function playCurrentRoomAudio() {
    // Safety check: if muted, don't do anything
    if (isMuted) {
      return;
    }
    
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
      
      // Find which panel this audio belongs to
      const audioPanel = audio.closest('.panel');
      const audioPanelIndex = panels.indexOf(audioPanel);
      
      // Always pause audio that's not for the current section
      if (audioPanelIndex !== idx) {
        audio.pause();
        return;
      }
      
      // Only play audio if we're not muted and this is the current section
      if (!isMuted && audioPanelIndex === idx) {
        // Allow multiple audio files to play simultaneously in the same panel
        if (audio.paused) {
          audio.currentTime = 0;
          audio.play().catch(()=>{});
        }
      } else {
        // If muted or not current section, ensure audio is paused
        audio.pause();
      }
    });

    // Set specific audio volumes
    audios.forEach((audio) => {
      if (!audio) return;
      const audioPanel = audio.closest('.panel');
      if (!audioPanel) return;
      
      if (audioPanel.classList.contains('contact')) {
        audio.volume = 0.7; // Clock ambience at 70% volume
      } else if (audioPanel.classList.contains('living-room')) {
        // Cassette tape handling sound in living room
        audio.volume = 0.1; // 10% volume for cassette tape sound
      } else if (audioPanel.classList.contains('attic')) {
        audio.volume = 0.15; // 15% volume for attic rain
      } else if (audioPanel.classList.contains('bathroom')) {
        audio.volume = 0.7; // 70% volume for bathroom dripping water
      } else if (audioPanel.classList.contains('basement')) {
        audio.volume = 0.075; // 7.5% volume for basement wind/water (30% of 0.25)
      } else {
        audio.volume = 0.5; // Default volume for other sections (was 1.0)
      }
    });


    // Handle flicker audio separately
    const basementPanel = document.querySelector('.panel.basement');
    if (basementPanel && flickerAudio) {
      // Only manage flicker audio, don't let main audio system control it
      if (currentSectionIndex !== 4) { // Not in basement (index 4)
        // Don't pause flicker audio when leaving basement - let it continue if flickering
        // flickerAudio.pause();
        // flickerAudio.currentTime = 0;
      } else {
        // In basement - let the flicker sequence control the audio
        // Don't pause it here, let it play during flicker sequences
        console.log('In basement section, flicker audio should be available');
      }
    }


  }

  muteBtn.addEventListener('click', () => {
    setMute(!isMuted);
  });

    // Initial call - only if not muted
  setTimeout(() => {
    if (!isMuted) {
      playCurrentRoomAudio();
    }
  }, 200);
  
  // Progressive loading system - above the fold first, then below
  const atticVideo = document.querySelector('.panel.attic .bg-video');
  const livingRoomVideo = document.querySelector('.panel.living-room .bg-video');
  const atticThumbnail = document.querySelector('.panel.attic .video-thumbnail');
  const livingRoomThumbnail = document.querySelector('.panel.living-room .video-thumbnail');
  
  // Function to handle thumbnail-first video loading with fade-in effect
  function loadVideoWithThumbnail(video, thumbnail, duration = 2000) {
    if (!video || !thumbnail) return;
    
    console.log('Starting video loading for:', video.src);
    
    // Start with thumbnail invisible and video hidden
    thumbnail.style.opacity = '0';
    video.style.opacity = '0';
    
    // Fade in thumbnail from black
    setTimeout(() => {
      thumbnail.style.transition = 'opacity 1.5s ease-in';
      thumbnail.style.opacity = '1';
      console.log('Thumbnail fade-in started');
    }, 100);
    
    // Add multiple event listeners for better reliability
    const videoReady = () => {
      console.log('Video ready, transitioning from thumbnail:', video.src);
      
      // Fade out thumbnail
      thumbnail.classList.add('fade-out');
      
      // Fade in video with the specified duration
      setTimeout(() => {
        video.style.transition = `opacity ${duration}ms ease-in`;
        video.style.opacity = '1';
      }, 100);
      
      // Remove thumbnail after transition
      setTimeout(() => {
        thumbnail.style.display = 'none';
      }, duration + 500); // Wait for video fade-in to complete
    };
    
    // Try multiple events to ensure one fires
    video.addEventListener('canplay', videoReady, { once: true });
    video.addEventListener('loadeddata', videoReady, { once: true });
    video.addEventListener('canplaythrough', videoReady, { once: true });
    
    // Force video loading
    video.load();
    
    // Fallback: if video doesn't load, keep thumbnail visible and retry
    setTimeout(() => {
      if (video.readyState < 2) { // HAVE_CURRENT_DATA
        console.log('Video not ready after 5s, retrying:', video.src);
        video.load(); // Try loading again
        
        // Second fallback: keep thumbnail visible indefinitely
        setTimeout(() => {
          if (video.readyState < 2) {
            console.log('Video still not ready, keeping thumbnail visible:', video.src);
          }
        }, 10000);
      }
    }, 5000);
  }
  
  // Load above-the-fold content first (attic)
  function loadAboveTheFold() {
    return new Promise((resolve) => {
      if (atticVideo && atticThumbnail) {
        // Start attic video loading with thumbnail
        loadVideoWithThumbnail(atticVideo, atticThumbnail, 2500);
        console.log('Above-the-fold content loaded (attic with thumbnail)');
        
        // Wait for attic video to be ready, then resolve
        atticVideo.addEventListener('canplay', () => {
          console.log('Attic video ready, proceeding to below-the-fold');
          resolve();
        }, { once: true });
        
        // Fallback: resolve after 3 seconds if video doesn't load
        setTimeout(resolve, 3000);
      } else {
        resolve();
      }
    });
  }
  
  // Load both thumbnails immediately for instant visual feedback
  function loadAllThumbnails() {
    if (atticThumbnail) {
      // Start attic thumbnail fade-in
      setTimeout(() => {
        atticThumbnail.style.transition = 'opacity 1.5s ease-in';
        atticThumbnail.style.opacity = '1';
        console.log('Attic thumbnail fade-in started');
      }, 100);
    }
    
    if (livingRoomThumbnail) {
      // Start living room thumbnail fade-in
      setTimeout(() => {
        livingRoomThumbnail.style.transition = 'opacity 1.5s ease-in';
        livingRoomThumbnail.style.opacity = '1';
        console.log('Living room thumbnail fade-in started');
      }, 100);
    }
  }
  
  // Start loading both videos in parallel after thumbnails are visible
  function startVideoLoading() {
    if (atticVideo && atticThumbnail) {
      loadVideoWithThumbnail(atticVideo, atticThumbnail, 2500);
      console.log('Attic video loading started');
    }
    
    if (livingRoomVideo && livingRoomThumbnail) {
      loadVideoWithThumbnail(livingRoomVideo, livingRoomThumbnail, 2000);
      console.log('Living room video loading started');
    }
  }
  
  // Load below-the-fold content after above-the-fold is ready
  function loadBelowTheFold() {
    console.log('Below-the-fold assets loading completed');
    
      // Initialize basement lighting immediately (don't wait for flicker sequence)
  const basement = document.querySelector('.panel.basement');
  const flickerGlow = basement ? basement.querySelector('.flicker-glow') : null;
  const basementDarken = basement ? basement.querySelector('.basement-darken') : null;
  
  if (flickerGlow && basementDarken) {
    // Ensure basement starts with light on and minimal darkening
    flickerGlow.style.opacity = '0.95';
    basementDarken.style.opacity = '0.1'; // Very light darkening instead of full dark
    console.log('Basement lighting initialized');
    
    // Make basement light responsive to scroll position
    let isBasementVisible = false;
    let lightTimeout;
    
    // Function to turn light on
    function turnBasementLightOn() {
      if (flickerGlow && basementDarken) {
        flickerGlow.style.opacity = '0.95';
        basementDarken.style.opacity = '0.1';
        console.log('Basement light turned on');
      }
    }
    
    // Function to turn light off
    function turnBasementLightOff() {
      if (flickerGlow && basementDarken) {
        flickerGlow.style.opacity = '0';
        basementDarken.style.opacity = '0.92';
        console.log('Basement light turned off');
      }
    }
    
    // Check if basement is visible and control lighting
    const basementObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Basement is visible - turn light on
          if (!isBasementVisible) {
            isBasementVisible = true;
            clearTimeout(lightTimeout);
            turnBasementLightOn();
          }
        } else {
          // Basement is not visible - turn light off after a short delay
          if (isBasementVisible) {
            isBasementVisible = false;
            lightTimeout = setTimeout(() => {
              turnBasementLightOff();
            }, 1000); // 1 second delay before turning off
          }
        }
      });
    }, { threshold: 0.3 }); // Trigger when 30% of basement is visible
    
    basementObserver.observe(basement);
  }
    
    // Load other below-the-fold assets
    const belowFoldAudios = document.querySelectorAll('.panel:not(.attic) .room-audio');
    belowFoldAudios.forEach(audio => {
      if (audio.src) {
        audio.preload = 'metadata';
        audio.load();
      }
    });
    
    console.log('Below-the-fold assets loaded');
  }
  
  // Start progressive loading
  loadAllThumbnails(); // Both thumbnails fade in immediately
  
  // Start loading both videos after thumbnails are visible
  setTimeout(() => {
    startVideoLoading(); // Both videos start loading in parallel
  }, 2000); // Wait for thumbnails to finish fading in
  
  // Add network status monitoring
  window.addEventListener('online', () => {
    console.log('Network connection restored, retrying video loading');
    // Retry loading videos when network comes back
    setTimeout(() => {
      if (atticVideo) atticVideo.load();
      if (livingRoomVideo) livingRoomVideo.load();
    }, 1000);
  });
  
  loadAboveTheFold().then(() => {
    // Small delay to ensure smooth transition
    setTimeout(loadBelowTheFold, 500);
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
  
  // Final safety check - ensure all audio is stopped on page load
  forceStopAllAudio();
});

// ===== TAPE STACK PLAYER FUNCTIONALITY =====

// AudioBus adapter for tape stack player
window.audioBus = {
  // read-only getter; return true if globally muted
  get muted() {
    // Check for the existing mute system in script.js
    if (typeof window.isMuted === 'boolean') {
      return window.isMuted;
    }
    // fallback (no-op mode)
    return false;
  },
  
  async loadEpisode(episodeId) {
    // For now, just log the episode load
    console.info('[audioBus] loadEpisode called for', episodeId);
    // You can integrate this with your existing audio system later
  },
  
  playSfx(name) {
    if (this.muted) return;
    const map = {
      pickUp: '/sfx/pickUp.mp3',
      insert: '/sfx/insert.mp3',
      uiOpen: '/sfx/uiOpen.mp3'
    };
    const src = map[name];
    if (!src) return;
    const a = new Audio(src);
    a.volume = 0.7;
    a.play().catch(() => {});
  }
};

// Tape Stack Player Application
document.addEventListener('DOMContentLoaded', () => {
  // Episode data (multiple episodes)
  // Minimal mode: single set of platform links
  const PLATFORMS = {
    apple: 'https://podcasts.apple.com/us/podcast/last-seen-in-the-twilight-zone/id1840472980?i=1000727234335',
    spotify: 'https://open.spotify.com/episode/6dK5YoROIIq2vmepcnSATY?si=1c6a7db503ba4194',
    audible: 'https://www.audible.com/pd/B0FRHS8JRQ?source_code=ASSORAP0511160006&share_location=library_overflow'
  };

const EPISODE_TAPES = [
  { title: 'THE DISAPPEARANCE OF MICHELE HARRIS PART 1: SNEAK PEEK', img: 'images/tapes/episode-1.jpg', available: true, releaseDate: '9/17' },
  { title: 'INTRODUCTION TO LAST SEEN', img: 'images/tapes/episode-2.jpg', releaseDate: '10/1' },
  { title: 'NIGHTMARE ON OAK ST.', img: 'images/tapes/episode-3.jpg', releaseDate: '10/3' },
  { title: 'JULY 4TH: SHOTS  ON RANO BOULEVARD', img: 'images/tapes/episode-4.jpg', releaseDate: '10/6' },
  { title: 'CLOSE TO HOME', img: 'images/tapes/episode-5.jpg', releaseDate: '10/13' },
  { title: 'DOMESTIC VIOLENCE', img: 'images/tapes/episode-6.jpg', releaseDate: '10/27' },
  { title: 'DO YOU RECOGNIZE THIS SUSPECT?', img: 'images/tapes/episode-7.jpg', releaseDate: '11/3' },
  { title: 'VANISHED ON 9/11 - THE STORY PART 1', img: 'images/tapes/episode-8.jpg', releaseDate: '11/10' },
  { title: 'VANISHED ON 9/11- WHO DID IT? PART 2', img: 'images/tapes/episode-9.jpg', releaseDate: '11/17' },
  { title: 'VANISHED ON 9/11', img: 'images/tapes/episode-10.jpg', releaseDate: '11/24' },
  { title: 'THE GIRL NEXT DOOR', img: 'images/tapes/episode-11.jpg', releaseDate: '12/1' },
  { title: 'SECRETS OF THE CASTLE ON THE HILL', img: 'images/tapes/episode-12.jpg', releaseDate: '12/8' },
  { title: 'SILENCE AFTER THE SHOT', img: 'images/tapes/episode-13.jpg', releaseDate: '12/15' },
  { title: '13 BIRDS IN THE SKY', img: 'images/tapes/episode-14.jpg', releaseDate: '12/22' },
  { title: 'HATE AT THE GROCERY STORE', img: 'images/tapes/episode-15.jpg', releaseDate: '12/29' },
  { title: 'WHERE IS BAMBI MADDEN?', img: 'images/tapes/episode-16.jpg', releaseDate: '1/5' },
  { title: 'LOST TO THE JUNGLE', img: 'images/tapes/episode-16.jpg', releaseDate: '1/12' }
];

  // No episode index in minimal mode

  // DOM elements
  let tapeStackBtn, playerOverlay, playerClose, tapeSheetHandle, tapeSheetHandleWrapper;

  function initializeTapePlayer() {
    tapeStackBtn = document.getElementById('tapeStackBtn');
    playerOverlay = document.getElementById('playerOverlay');
    playerClose = document.querySelector('.player-close');
    tapeSheetHandle = document.querySelector('.tape-sheet-handle');
    tapeSheetHandleWrapper = document.querySelector('.tape-sheet-handle-wrapper');
    // bottom sheet elements created in HTML

    if (!tapeStackBtn || !playerOverlay) {
      console.log('Tape stack player elements not found, skipping initialization');
      return;
    }

    setupTapePlayerEventListeners();
    setupTapeStackAnimation();
    setupSwipeGesture();
    console.log('Tape Stack Player initialized');
  }

  function setupTapePlayerEventListeners() {
    // Tape stack button click
    if (tapeStackBtn) {
      tapeStackBtn.addEventListener('click', openTapePlayer);
      tapeStackBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTapePlayer();
        }
      });
    }

    // Close button click
    if (playerClose) {
      playerClose.addEventListener('click', closeTapePlayer);
    }

    // Overlay click to close
    if (playerOverlay) {
      playerOverlay.addEventListener('click', (e) => {
        if (e.target === playerOverlay) {
          closeTapePlayer();
        }
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !playerOverlay.hidden) {
        closeTapePlayer();
      }
    });

    // No inline platform buttons in minimal mode; handled per tape

    // No episode navigation in minimal mode
  }

  function openTapePlayer() {
    console.log('Opening tape player...');
    
    // Prevent body scroll on mobile when popup is open
    document.body.style.overflow = 'hidden';
    
    // Show the player overlay immediately (no pre-roll video)
    showTapePlayerPopup();
  }

  function showTapePlayerPopup() {
    console.log('Showing tape player popup...');
    
    // Hide the button
    if (tapeStackBtn) {
      tapeStackBtn.classList.add('hidden');
    }
    
    // Show the player overlay and start slide-up animation
    playerOverlay.hidden = false;
    playerOverlay.classList.add('opening');
    
    // Ensure CSS animation runs
    requestAnimationFrame(() => {
      // Play pickup sound effect
      if (window.audioBus) {
        window.audioBus.playSfx('pickUp');
        
        // Play UI open sound after a short delay
        setTimeout(() => {
          window.audioBus.playSfx('uiOpen');
        }, 100);
      }
      
      // Move focus to the dialog
      playerOverlay.focus();
      
      // Optional: brief delay for UI sound only
      setTimeout(() => {
        if (window.audioBus) {
          window.audioBus.playSfx('insert');
        }
      }, 200);

      // Build bottom sheet list
      buildTapeList();
      // Open the sheet
      const sheet = document.getElementById('tapeSheet');
      if (sheet) sheet.classList.add('open');
    });
  }

  function closeTapePlayer() {
    console.log('Closing tape player...');
    
    // Show the button again immediately
    if (tapeStackBtn) {
      tapeStackBtn.classList.remove('hidden');
      tapeStackBtn.focus();
    }
    
    // Remove the open class from tape sheet to start closing animation
    const tapeSheet = document.getElementById('tapeSheet');
    if (tapeSheet) {
      tapeSheet.classList.remove('open');
    }
    
    // Start closing animation
    playerOverlay.classList.remove('opening');
    playerOverlay.classList.add('closing');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Hide the overlay and remove classes
      playerOverlay.hidden = true;
      playerOverlay.classList.remove('closing');
    }, 300); // Match CSS animation duration
  }

  function handlePlatformClick(platform) {
    const url = PLATFORMS[platform];
    if (url) window.open(url, '_blank', 'noopener');
  }

  function buildTapeList() {
    const list = document.getElementById('tapeList');
    if (!list) return;
    list.innerHTML = '';

    // Show only first 6 episodes
    EPISODE_TAPES.slice(0, 6).forEach((ep, index) => {
      const card = document.createElement('div');
      card.className = 'tape-card';
      card.setAttribute('role', 'listitem');

      const img = document.createElement('img');
      img.className = 'tape-thumb';
      img.alt = `Tape for ${ep.title}`;
      img.src = ep.img || 'images/tape/placeholder.jpg';

      const meta = document.createElement('div');
      meta.className = 'tape-meta';

      const title = document.createElement('div');
      title.className = 'tape-title';
      title.textContent = ep.title;

      const actions = document.createElement('div');
      actions.className = 'tape-actions';

      if (ep.available || index === 0) {
        const label = document.createElement('span');
        label.className = 'listen-on-label';
        label.textContent = 'Listen on:';

        const btnApple = document.createElement('button');
        btnApple.className = 'icon-btn';
        btnApple.setAttribute('aria-label', 'Listen on Apple Podcasts');
        btnApple.innerHTML = '<i class="fa-brands fa-apple"></i>';
        btnApple.addEventListener('click', () => handlePlatformClick('apple'));

        const btnSpotify = document.createElement('button');
        btnSpotify.className = 'icon-btn';
        btnSpotify.setAttribute('aria-label', 'Listen on Spotify');
        btnSpotify.innerHTML = '<i class="fa-brands fa-spotify"></i>';
        btnSpotify.addEventListener('click', () => handlePlatformClick('spotify'));

        const btnAudible = document.createElement('button');
        btnAudible.className = 'icon-btn';
        btnAudible.setAttribute('aria-label', 'Listen on Audible');
        btnAudible.innerHTML = '<i class="fa-brands fa-audible"></i>';
        btnAudible.addEventListener('click', () => handlePlatformClick('audible'));

        actions.appendChild(label);
        actions.appendChild(btnApple);
        actions.appendChild(btnSpotify);
        actions.appendChild(btnAudible);
      } else {
        const soon = document.createElement('span');
        soon.className = 'coming-soon';
        soon.textContent = `Coming ${ep.releaseDate}`;
        actions.appendChild(soon);
      }

      meta.appendChild(title);
      meta.appendChild(actions);

      card.appendChild(img);
      card.appendChild(meta);

      list.appendChild(card);
    });
  }

  // Minimal mode: no episode state or cassette animation

  function setupTapeStackAnimation() {
    // No glow/triangle animations in minimal mode
  }

  function setupSwipeGesture() {
    if (!tapeSheetHandleWrapper) return;
    
    // Also make the entire header draggable
    const tapeSheetHeader = document.querySelector('.tape-sheet-header');
    
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let startTime = 0;
    let hasMoved = false;
    
    // Touch events - improved for iOS (using wrapper for larger touch target)
    tapeSheetHandleWrapper.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent scrolling
      startY = e.touches[0].clientY;
      currentY = startY;
      startTime = Date.now();
      isDragging = false;
      hasMoved = false;
      
      // Add dragging class to disable transitions
      const tapeSheet = document.getElementById('tapeSheet');
      if (tapeSheet) {
        tapeSheet.classList.add('dragging');
      }
      if (playerOverlay) {
        playerOverlay.classList.add('dragging');
      }
      
      console.log('Touch start on handle:', startY);
    }, { passive: false });
    
    tapeSheetHandleWrapper.addEventListener('touchmove', (e) => {
      if (!startY) return;
      
      e.preventDefault(); // Prevent scrolling
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (!hasMoved && Math.abs(deltaY) > 5) {
        hasMoved = true;
      }
      
      // Only consider it dragging if moved more than 5px (reduced threshold)
      if (Math.abs(deltaY) > 5) {
        isDragging = true;
      }
      
      // If dragging, show visual feedback with slide animation
      if (isDragging) {
        // Move the entire player overlay based on drag direction
        if (playerOverlay) {
          // Slide based on drag distance (no maximum limit)
          playerOverlay.style.transform = `translateY(${deltaY}px)`;
        }
      }
    }, { passive: false });
    
    tapeSheetHandleWrapper.addEventListener('touchend', (e) => {
      if (!startY) {
        startY = 0;
        return;
      }
      
      const deltaY = currentY - startY;
      const deltaTime = Date.now() - startTime;
      const velocity = deltaTime > 0 ? deltaY / deltaTime : 0;
      
      console.log('Touch end:', { deltaY, velocity, isDragging, hasMoved });
      
      // Reset slide position and remove dragging class
      if (playerOverlay) {
        playerOverlay.style.transform = '';
        playerOverlay.classList.remove('dragging');
      }
      const tapeSheet = document.getElementById('tapeSheet');
      if (tapeSheet) {
        tapeSheet.classList.remove('dragging');
      }
      
      // Close if dragged down more than 30% of screen height OR fast swipe down
      const screenHeight = window.innerHeight;
      const closeThreshold = screenHeight * 0.3; // 30% of screen height
      
      if (deltaY > closeThreshold || (deltaY > 50 && velocity > 0.3)) {
        console.log('Closing via swipe gesture');
        closeTapePlayer();
      }
      
      // Always reset state
      startY = 0;
      currentY = 0;
      isDragging = false;
      hasMoved = false;
    }, { passive: true });
    
    // Add touchcancel event to handle interrupted touches
    tapeSheetHandleWrapper.addEventListener('touchcancel', (e) => {
      console.log('Touch cancelled on handle');
      
      // Reset slide position and remove dragging class
      if (playerOverlay) {
        playerOverlay.style.transform = '';
        playerOverlay.classList.remove('dragging');
      }
      const tapeSheet = document.getElementById('tapeSheet');
      if (tapeSheet) {
        tapeSheet.classList.remove('dragging');
      }
      
      // Always reset state
      startY = 0;
      currentY = 0;
      isDragging = false;
      hasMoved = false;
    }, { passive: true });
    
    // Also add swipe gesture to the entire header area
    if (tapeSheetHeader) {
      tapeSheetHeader.addEventListener('touchstart', (e) => {
        // Only start if touching the header area, not the handle wrapper
        if (e.target === tapeSheetHandle || e.target === tapeSheetHandleWrapper) return;
        
        e.preventDefault();
        startY = e.touches[0].clientY;
        currentY = startY;
        startTime = Date.now();
        isDragging = false;
        hasMoved = false;
        
        // Add dragging class to disable transitions
        const tapeSheet = document.getElementById('tapeSheet');
        if (tapeSheet) {
          tapeSheet.classList.add('dragging');
        }
        if (playerOverlay) {
          playerOverlay.classList.add('dragging');
        }
        
        console.log('Touch start on header:', startY);
      }, { passive: false });
      
      tapeSheetHeader.addEventListener('touchmove', (e) => {
        if (!startY || e.target === tapeSheetHandle || e.target === tapeSheetHandleWrapper) return;
        
        e.preventDefault();
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        if (!hasMoved && Math.abs(deltaY) > 5) {
          hasMoved = true;
        }
        
        if (Math.abs(deltaY) > 5) {
          isDragging = true;
        }
        
        if (isDragging) {
          // Move the entire player overlay based on drag direction
          if (playerOverlay) {
            // Slide based on drag distance (no maximum limit)
            playerOverlay.style.transform = `translateY(${deltaY}px)`;
          }
        }
      }, { passive: false });
      
      tapeSheetHeader.addEventListener('touchend', (e) => {
        if (!startY || e.target === tapeSheetHandle || e.target === tapeSheetHandleWrapper) {
          startY = 0;
          return;
        }
        
        const deltaY = currentY - startY;
        const deltaTime = Date.now() - startTime;
        const velocity = deltaTime > 0 ? deltaY / deltaTime : 0;
        
        console.log('Touch end on header:', { deltaY, velocity, isDragging, hasMoved });
        
        // Reset slide position and remove dragging class
        if (playerOverlay) {
          playerOverlay.style.transform = '';
          playerOverlay.classList.remove('dragging');
        }
        const tapeSheet = document.getElementById('tapeSheet');
        if (tapeSheet) {
          tapeSheet.classList.remove('dragging');
        }
        
        // Close if dragged down more than 30% of screen height OR fast swipe down
        const screenHeight = window.innerHeight;
        const closeThreshold = screenHeight * 0.3; // 30% of screen height
        
        if (deltaY > closeThreshold || (deltaY > 50 && velocity > 0.3)) {
          console.log('Closing via header swipe gesture');
          closeTapePlayer();
        }
        
        // Always reset state
        startY = 0;
        currentY = 0;
        isDragging = false;
        hasMoved = false;
      }, { passive: true });
      
      // Add touchcancel event to handle interrupted touches
      tapeSheetHeader.addEventListener('touchcancel', (e) => {
        if (e.target === tapeSheetHandle || e.target === tapeSheetHandleWrapper) return;
        
        console.log('Touch cancelled on header');
        
        // Reset slide position and remove dragging class
        if (playerOverlay) {
          playerOverlay.style.transform = '';
          playerOverlay.classList.remove('dragging');
        }
        const tapeSheet = document.getElementById('tapeSheet');
        if (tapeSheet) {
          tapeSheet.classList.remove('dragging');
        }
        
        // Always reset state
        startY = 0;
        currentY = 0;
        isDragging = false;
        hasMoved = false;
      }, { passive: true });
    }
    
    // Mouse events for desktop testing
    tapeSheetHandleWrapper.addEventListener('mousedown', (e) => {
      startY = e.clientY;
      startTime = Date.now();
      isDragging = false;
      
      // Add dragging class to disable transitions
      const tapeSheet = document.getElementById('tapeSheet');
      if (tapeSheet) {
        tapeSheet.classList.add('dragging');
      }
      if (playerOverlay) {
        playerOverlay.classList.add('dragging');
      }
      
      const handleMouseMove = (e) => {
        currentY = e.clientY;
        const deltaY = currentY - startY;
        
        if (Math.abs(deltaY) > 10) {
          isDragging = true;
        }
        
        if (isDragging) {
          // Move the entire player overlay based on drag direction
          if (playerOverlay) {
            // Slide based on drag distance (no maximum limit)
            playerOverlay.style.transform = `translateY(${deltaY}px)`;
          }
        }
      };
      
      const handleMouseUp = (e) => {
        if (!startY) {
          startY = 0;
          return;
        }
        
        const deltaY = currentY - startY;
        const deltaTime = Date.now() - startTime;
        const velocity = deltaTime > 0 ? deltaY / deltaTime : 0;
        
        // Reset slide position and remove dragging class
        if (playerOverlay) {
          playerOverlay.style.transform = '';
          playerOverlay.classList.remove('dragging');
        }
        const tapeSheet = document.getElementById('tapeSheet');
        if (tapeSheet) {
          tapeSheet.classList.remove('dragging');
        }
        
        // Close if dragged down more than 30% of screen height OR fast swipe down
        const screenHeight = window.innerHeight;
        const closeThreshold = screenHeight * 0.3; // 30% of screen height
        
        if (deltaY > closeThreshold || (deltaY > 50 && velocity > 0.3)) {
          closeTapePlayer();
        }
        
        // Always reset state
        startY = 0;
        currentY = 0;
        isDragging = false;
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });
  }

  // Initialize the tape player
  initializeTapePlayer();

  // Debug function (can be called from console)
  window.debugTapePlayer = {
    openTapePlayer,
    closeTapePlayer,
    isAudioBusAvailable: () => typeof window.audioBus === 'object' && window.audioBus !== null,
    getMuteState: () => window.audioBus ? window.audioBus.muted : 'audioBus not available'
  };
});

 