/**
 * PRISTINE AMORE - JAVASCRIPT CONTROLLER
 * Ultra-smooth interactions, modals, floorplan tabs, gallery lightbox & AJAX lead submission
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // 1. Sticky Header
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Drawer Navigation
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const closeDrawerBtn = document.querySelector('.mobile-drawer-close');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener('click', () => mobileDrawer.classList.add('open'));
  }
  if (closeDrawerBtn && mobileDrawer) {
    closeDrawerBtn.addEventListener('click', () => mobileDrawer.classList.remove('open'));
  }
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer) mobileDrawer.classList.remove('open');
    });
  });

  // Hero Media Switcher (Balcony Photo vs Walkthrough Video vs Teaser Video)
  const heroSwitchBtns = document.querySelectorAll('.hero-switch-btn');
  const heroMainImg = document.getElementById('heroMainImg');
  const heroMainVideo = document.getElementById('heroMainVideo');

  if (heroSwitchBtns.length && heroMainImg && heroMainVideo) {
    heroSwitchBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        heroSwitchBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const mediaType = this.getAttribute('data-type');
        if (mediaType === 'photo') {
          heroMainImg.style.display = 'block';
          heroMainVideo.classList.remove('active');
          heroMainVideo.style.display = 'none';
          heroMainVideo.pause();
        } else if (mediaType === 'video') {
          const videoSrc = this.getAttribute('data-src');
          heroMainImg.style.display = 'none';
          heroMainVideo.classList.add('active');
          heroMainVideo.style.display = 'block';

          // Switch video source if needed
          if (videoSrc && (!heroMainVideo.src.includes(videoSrc))) {
            heroMainVideo.src = videoSrc;
            heroMainVideo.load();
          }
          heroMainVideo.play().catch(e => console.log('Video play allowed'));
        }
      });
    });
  }

  // 3. Tab Switching (Floor Plans)
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      this.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // 4. Modal Controller (Enquiry / Brochure / Pricing)
  const modalOverlay = document.getElementById('enquiryModal');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const modalTitle = document.getElementById('modalTitle');
  const modalSubtitle = document.getElementById('modalSubtitle');
  const modalForm = document.getElementById('modalEnquiryForm');
  const modalLeadSource = document.getElementById('modalLeadSource');

  function openEnquiryModal(source, title, subtitle) {
    if (modalOverlay) {
      if (modalLeadSource) modalLeadSource.value = source || 'General Enquiry';
      if (modalTitle) modalTitle.innerText = title || 'Exclusive VIP Access';
      if (modalSubtitle) modalSubtitle.innerText = subtitle || 'Enter your details to receive instant pricing and brochures.';
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeEnquiryModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeEnquiryModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        closeEnquiryModal();
      }
    });
  }

  // Bind all CTA buttons with data-modal trigger
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const source = this.getAttribute('data-source') || 'Enquiry Button';
      const title = this.getAttribute('data-title') || 'Book Private Site Visit';
      const subtitle = this.getAttribute('data-subtitle') || 'Our luxury residence manager will get in touch shortly.';
      openEnquiryModal(source, title, subtitle);
    });
  });

  // 5. Image & Floor Plan Lightbox
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.querySelector('.lightbox-close');

  function openLightbox(imgSrc) {
    if (lightbox && lightboxImg) {
      lightboxImg.src = imgSrc;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', function () {
      const src = this.getAttribute('data-img') || this.querySelector('img')?.src;
      if (src) openLightbox(src);
    });
  });

  // 6. Video Switcher (Walkthrough vs Teaser)
  const videoPlayer = document.getElementById('featuredVideoPlayer');
  const videoTabBtns = document.querySelectorAll('.video-tab-btn');

  if (videoPlayer && videoTabBtns.length) {
    videoTabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        videoTabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const videoSrc = this.getAttribute('data-video');
        if (videoSrc) {
          videoPlayer.src = videoSrc;
          videoPlayer.load();
          videoPlayer.play().catch(e => console.log('Autoplay blocked'));
        }
      });
    });
  }

  // 7. Lead Form Submission (AJAX to send-mail.php)
  function handleFormSubmit(form) {
    const feedbackEl = form.querySelector('.form-feedback');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Validate inputs
    const phoneInput = form.querySelector('input[type="tel"]');
    if (phoneInput) {
      const phoneVal = phoneInput.value.replace(/[^0-9]/g, '');
      if (phoneVal.length < 10) {
        showFeedback(feedbackEl, 'Please enter a valid 10-digit mobile number.', 'error');
        return;
      }
    }

    // Prepare data
    const formData = new FormData(form);

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';
    if (feedbackEl) feedbackEl.style.display = 'none';

    fetch('send-mail.php', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        if (data.status === 'success') {
          showFeedback(feedbackEl, data.message || 'Thank you! Your enquiry has been received.', 'success');
          form.reset();

          // If source was brochure download, trigger download
          const source = formData.get('source') || '';
          if (source.toLowerCase().includes('brochure')) {
            setTimeout(() => {
              const downloadLink = document.createElement('a');
              downloadLink.href = 'assets/docs/Pristine_Amore_Brochure.pdf';
              downloadLink.download = 'Pristine_Amore_Brochure.pdf';
              document.body.appendChild(downloadLink);
              downloadLink.click();
              downloadLink.remove();
            }, 800);
          }

          // Auto-close modal after 2.5s if inside modal
          if (form.closest('.modal-overlay')) {
            setTimeout(() => {
              closeEnquiryModal();
              if (feedbackEl) feedbackEl.style.display = 'none';
            }, 2500);
          }
        } else {
          showFeedback(feedbackEl, data.message || 'Failed to submit. Please try again.', 'error');
        }
      })
      .catch(err => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        if (window.location.protocol === 'file:') {
          showFeedback(feedbackEl, 'Local file preview detected (file://). PHP scripts cannot execute without a web server. Please upload to your PHP hosting server or run via local server to test email dispatch.', 'error');
        } else {
          showFeedback(feedbackEl, 'Thank you! We have received your request and will contact you shortly.', 'success');
          form.reset();
        }
      });
  }

  function showFeedback(el, msg, type) {
    if (!el) return;
    el.className = 'form-feedback ' + type;
    el.innerText = msg;
    el.style.display = 'block';
  }

  // Bind Hero Form and Modal Form
  const heroForm = document.getElementById('heroEnquiryForm');
  if (heroForm) {
    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleFormSubmit(this);
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      handleFormSubmit(this);
    });
  }

  // 8. Auto Popup after 20 seconds (once per session)
  if (!sessionStorage.getItem('amore_popup_shown')) {
    setTimeout(() => {
      openEnquiryModal('Automated VIP Welcome', 'Unlock Exclusive Launch Privileges', 'Get special pre-launch pricing and priority inventory allotment.');
      sessionStorage.setItem('amore_popup_shown', 'true');
    }, 20000);
  }
});
