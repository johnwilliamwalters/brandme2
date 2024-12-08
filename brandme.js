let lastPage = "/";
const nav = document.querySelector(".nav");
const logoNav = document.querySelector(".logo.is-nav");
const svgLogo = document.querySelector(".svg-logo");

//Barba Set-up

//Barba Hook - Enter - // Update lastPage URL, set the next container to centered, kill scroll triggers and GSAP timelines, and reset Webflow transitions

barba.hooks.enter((data) => {
  if (data.next.namespace !== "getintouch") {
    console.log("Setting lastPage to:", window.location.href);
    lastPage = window.location.href;
  }
  gsap.set(data.next.container, {
    position: "fixed",
    top: 0,
    left: "50%",
    xPercent: -50,
    width: "100%",
  });
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.globalTimeline.clear();
  resetWebflow(data);
});

//Barba Hook - After - Set next container back to relative, Initialise Animations, Scroll to top of screen and Reset Scroll Triggers

barba.hooks.after((data) => {
  gsap.set(data.next.container, {
    position: "relative",
    clearProps: "top,left,xPercent",
  });
  if (data.next.namespace !== "getintouch" && data.next.namespace !== "home") {
    resetLogo();
  }
  $(window).scrollTop(0);
  ScrollTrigger.refresh(true);
  setupAnimations();
});

//Barba Tranistions & Views

barba.init({
  preventRunning: true,
  transitions: [
    // Default transition for all page changes
    {
      name: "default",
      beforeEnter(data) {
        let tl = gsap.timeline({
          defaults: { duration: 0.5, ease: "power2.out" },
        });
        tl.to(data.current.container, { opacity: 0, y: 50 }, "<");
        return tl;
      },
      after(data) {
        let tl = gsap.timeline({
          defaults: { duration: 1, ease: "power2.out" },
        });
        tl.from(data.next.container, { opacity: 0 });
        return tl;
      },
    },
    // Self transition: only trigger if navigating to the current page
    {
      name: "self",
      enter() {
        $(window).scrollTop(0);
      },
      to: {
        namespace: (ns) => ns === window.location.pathname,
      },
    },
    {
      // Contact transition
      name: "slide",
      to: { namespace: ["getintouch"] },
      enter(data) {
        // Slide-in animation for the next container
        let tl = gsap.timeline({
          defaults: { duration: 0.75, ease: "power2.out" },
        });
        tl.from(data.next.container, { y: "100vh" });
        return tl;
      },
    },
    {
      // Contact back transition
      name: "slide",
      from: { namespace: ["getintouch"] },
      beforeEnter(data) {
        // Timeline for fade-out and background color change
        let tl = gsap.timeline({
          defaults: { duration: 0.75, ease: "power2.out" },
        });
        tl.to(data.current.container, { y: "100vh" }, "<"); // Simultaneous fade-out and move
        return tl;
      },
      after(data) {
        // Fade-in animation for the next container
        let tl = gsap.timeline({
          defaults: { duration: 0.5, ease: "power2.out" },
        });
        tl.from(data.next.container, { opacity: 0 });
        return tl;
      },
    },
  ],
  views: [
    {
      namespace: "getintouch",
      afterEnter({ current, next }) {
        // Only reduceNavbar if navigating from a different namespace
        if (current.namespace !== next.namespace) {
          reduceNavbar();
        }
        formWatch();
      },
      afterLeave({ current, next }) {
        // Only restoreNavbar if navigating to a different namespace
        if (current.namespace !== next.namespace) {
          restoreNavbar();
        }
      },
    },
    {
      namespace: "work",
      afterEnter() {
        workVideo();
      },
    },
    {
      namespace: "home",
      afterEnter() {
        hideLogo();
        displayLogoAnimation();
      },
    },
  ],
});

//Reset Webflow

function resetWebflow(data) {
  let dom = $(
    new DOMParser().parseFromString(data.next.html, "text/html")
  ).find("html");
  // reset webflow interactions
  $("html").attr("data-wf-page", dom.attr("data-wf-page"));
  window.Webflow && window.Webflow.destroy();
  window.Webflow && window.Webflow.ready();
  window.Webflow && window.Webflow.require("ix2").init();
  // reset w--current class
  $(".w--current").removeClass("w--current");
  $("a").each(function () {
    if ($(this).attr("href") === window.location.pathname) {
      $(this).addClass("w--current");
    }
  });
}

//Animations & Interactions

function setupAnimations() {
  // GSAP Animations

  gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

  // GSAP - Homepage - Squiggle

  const squiggleElements = document.querySelectorAll(".squiggle");
  squiggleElements.forEach((squiggle) => {
    gsap.fromTo(
      squiggle,
      { drawSVG: "100% 100%" },
      {
        duration: 1,
        ease: "power1.out",
        drawSVG: "100% 0",
        scrollTrigger: {
          trigger: squiggle,
          start: "top bottom",
          end: "bottom 10%",
          scrub: 2,
        },
      }
    );
  });

  // GSAP - Homepage - Intro

  if (document.querySelector(".header-homepage")) {
    let headeranimation = gsap.timeline();
    headeranimation
      .from(".header-homepage .heading_xxl", {
        y: 100,
        autoAlpha: 0,
        duration: 1,
        delay: 1,
        ease: "power1.out",
      })
      .from(
        ".header-homepage .heading_s",
        { y: 100, autoAlpha: 0, duration: 1, ease: "power1.out" },
        "<0.2"
      )
      .from(
        ".section-large-slider",
        { y: 100, autoAlpha: 0, duration: 1, ease: "power1.out" },
        "<0.2"
      );
  }

  // GSAP - Homepage - Links

  const hoverLinks = document.querySelectorAll(".homepage-link");
  hoverLinks.forEach((linkHover) => {
    let linkHoverAnimation = gsap.timeline({ paused: true });
    linkHoverAnimation
      .to(linkHover, { color: "#2D46CD", duration: 0.2, ease: "power1.out" })
      .to(
        linkHover.querySelector(".homepage-link_hover"),
        { y: "0%", duration: 0.2, ease: "power1.out" },
        "<"
      );

    linkHover.addEventListener("mouseenter", () => linkHoverAnimation.play());
    linkHover.addEventListener("mouseleave", () =>
      linkHoverAnimation.reverse()
    );
  });

  // GSAP - About Page

  function setupAboutPageAnimation() {
    const aboutSection = document.querySelector(".section-about-us-images");

    if (aboutSection) {
      let aboutPageSlideshow = gsap.timeline({ repeat: -1, delay: -2 });
      let aboutPageSlideshow2 = gsap.timeline({ repeat: -1 });

      gsap.set(["#about-3", "#about-2", "#about-5", "#about-6"], {
        opacity: 0,
      });

      aboutPageSlideshow
        .to("#about-2", { delay: 4, opacity: 1, duration: 1 })
        .to("#about-3", { opacity: 1, duration: 1 }, "<+=4")
        .to("#about-2", { opacity: 0, duration: 1 }, "<+=4")
        .to("#about-3", { opacity: 0, duration: 1 }, "<");

      aboutPageSlideshow2
        .to("#about-5", { delay: 4, opacity: 1, duration: 1 })
        .to("#about-6", { opacity: 1, duration: 1 }, "<+=4")
        .to("#about-5", { opacity: 0, duration: 1 }, "<+=4")
        .to("#about-6", { opacity: 0, duration: 1 }, "<");
    }
  }

  setupAboutPageAnimation();

  // GSAP - Generic - Footer

  if (document.querySelector(".footer-container")) {
    gsap.from(".footer", {
      y: "100%",
      duration: 1,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".footer-container",
        start: "top 90%",
      },
    });
  }

  // GSAP - Generic - Fade Animation - Simple

  gsap.utils.toArray("[animation='fade']").forEach((elem) => {
    gsap.from(elem, {
      y: 100,
      autoAlpha: 0,
      duration: 0.5,
      ease: "power1.out",
      scrollTrigger: {
        trigger: elem,
        start: "top 70%",
      },
    });
  });

  // GSAP - Generic - Fade Animation - Children

  gsap.utils
    .toArray("[animation='childfade'], [animation='childfadefast']")
    .forEach((elem) => {
      const isQuick = elem.getAttribute("animation") === "childfadefast";
      gsap.from(gsap.utils.toArray(elem.children), {
        y: 100,
        autoAlpha: 0,
        duration: 0.5,
        ease: "power1.out",
        stagger: isQuick ? 0.05 : 0.2,
        scrollTrigger: {
          trigger: elem,
          start: "top 70%",
        },
      });
    });

  // GSAP - Generic - Color Change

  function initializeColorChangeTriggers({
    duration = 0.5, // default duration for color changes
    hardChangeStart = "top 10%", // default start for hard-change sections
    softChangeStart = "top 70%", // default start for non-hard-change sections
    portfolioHardChangeStart = "top 10%", // new start for portfolio hard-change sections
    portfolioSoftChangeStart = "top 40%", // new start for portfolio soft-change sections
  } = {}) {
    function changeColors(logoColor, bodyColor) {
      if (logoColor) {
        gsap.to(".logo-wrapper", {
          color: logoColor.trim(),
          duration: duration,
          overwrite: true,
        });
      }
      if (bodyColor) {
        gsap.to("body", {
          backgroundColor: bodyColor.trim(),
          duration: duration,
          overwrite: true,
        });
      }
    }

    document
      .querySelectorAll(".color-change")
      .forEach((section, index, sections) => {
        let logoColor = section.getAttribute("data-logo-color");
        let bodyColor = section.getAttribute("data-body-color");
        const isHardChange = section.getAttribute("hard-change") === "true";
        const customChange = section.getAttribute("data-custom-change");

        // Check for classes 'a', 'b', or 'c' and dynamically set data-body-color
        if (section.classList.contains("a")) {
          bodyColor =
            getComputedStyle(section).getPropertyValue("--brand-color-a");
        } else if (section.classList.contains("b")) {
          bodyColor =
            getComputedStyle(section).getPropertyValue("--brand-color-b");
        } else if (section.classList.contains("c")) {
          bodyColor =
            getComputedStyle(section).getPropertyValue("--brand-color-c");
        }

        // Check if the parent has the `portfolio` attribute set to true
        const parentHasPortfolio =
          section.closest('[portfolio="true"]') !== null;

        // Determine the appropriate start based on the parent attribute and customChange
        const adjustedHardChangeStart = parentHasPortfolio
          ? portfolioHardChangeStart
          : hardChangeStart;
        const adjustedSoftChangeStart = parentHasPortfolio
          ? portfolioSoftChangeStart
          : softChangeStart;

        // Check if it's a mobile device
        const isMobile = window.innerWidth < 768;

        const triggerStart =
          customChange ||
          (isHardChange
            ? adjustedHardChangeStart
            : isMobile
            ? "top 50%"
            : adjustedSoftChangeStart);

        ScrollTrigger.create({
          trigger: section,
          start: triggerStart,
          onEnter: () => {
            changeColors(logoColor || "#000", bodyColor || "#fff");
          },
          onLeaveBack: () => {
            // Get the previous section and its colors
            const prevSection = sections[index - 1];
            if (prevSection) {
              const prevLogoColor = prevSection.getAttribute("data-logo-color");
              let prevBodyColor = prevSection.getAttribute("data-body-color");

              // Check for classes 'a', 'b', or 'c' on the previous section
              if (prevSection.classList.contains("a")) {
                prevBodyColor =
                  getComputedStyle(prevSection).getPropertyValue(
                    "--brand-color-a"
                  );
              } else if (prevSection.classList.contains("b")) {
                prevBodyColor =
                  getComputedStyle(prevSection).getPropertyValue(
                    "--brand-color-b"
                  );
              } else if (prevSection.classList.contains("c")) {
                prevBodyColor =
                  getComputedStyle(prevSection).getPropertyValue(
                    "--brand-color-c"
                  );
              }

              // Apply the previous section's colors
              changeColors(prevLogoColor || "#000", prevBodyColor || "#fff");
            } else {
              // If no previous section, fallback to defaults
              changeColors("#000", "#fff");
            }
          },
        });
      });
  }

  initializeColorChangeTriggers();

  // Non GSAP

  // Video Card Interaction

  const containers = document.querySelectorAll(".image-container_video-card");
  containers.forEach((container) => {
    const video = container.querySelector("video");
    const cursor = container.querySelector(".cursor_view-project");
    if (container.hasAttribute("hover")) {
      container.addEventListener("mouseover", () => video.play());
      container.addEventListener("mouseout", () => video.pause());
    }
    container.addEventListener("mousemove", (e) => {
      cursor.style.left = e.offsetX + "px";
      cursor.style.top = e.offsetY + "px";
    });
  });

  const projectCards = document.querySelectorAll(".card.is-project, .video-container.is-portfolio, .portfolio-video");

  if (projectCards.length > 0) {
    projectCards.forEach((card) => {
      const videoSrc = card.getAttribute("video");
      const videoElement = card.querySelector("video");

      if (videoSrc) {
        videoElement.src = videoSrc;
      } else {
        videoElement.remove();
      }
    });
  }

  // Swipers

  const projectswiper = new Swiper(".swiper.is-projects", {
    slidesPerView: 1.5,
    spaceBetween: 16,
    navigation: {
      nextEl: ".swiper-button-next.is-projects",
      prevEl: ".swiper-button-prev.is-projects",
    },
    breakpoints: {
      568: {
        slidesPerView: 2,
      },
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
      },
    },
  });

  const bigswiper = new Swiper(".swiper.is-large-swiper", {
    slidesPerView: 1,
    spaceBetween: 16,
    pagination: {
      el: ".swiper-pagination.is-large-swiper",
      clickable: true,
    },
  });

  const testimonialsswiper = new Swiper(".swiper.is-testimonials", {
    slidesPerView: "auto",
    spaceBetween: 16,
    loop: true,
    navigation: {
      nextEl: ".swiper-button-next.is-testimonials",
      prevEl: ".swiper-button-prev.is-testimonials",
    },
  });
}

// Call the setup function to initialize all animations and interactions
setupAnimations();

//----------------------- SINGLE PAGE FUNCTIONS

//Nav Bar Change when going to contact

function reduceNavbar() {
  const navLinksDiv = document.querySelector(".nav-links");

  if (navLinksDiv) {
    gsap.to(navLinksDiv, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        const navLinks = navLinksDiv.querySelectorAll("a");

        navLinks.forEach((link) => {
          if (!link.classList.contains("is-contact")) {
            link.style.display = "none";
          } else {
            const divContent = link.querySelector("div");
            if (divContent) divContent.textContent = "back to site";

            // Set the "back to site" link to lastPage URL
            link.setAttribute("href", lastPage);

            // Update colors for the is-contact link
            link.style.color = "#2D46CD";
            link.style.backgroundColor = "#FCF5EB";

            const svg = link.querySelector("svg");
            if (svg) {
              svg.setAttribute("viewBox", "0 0 24 24");
              const path = svg.querySelector("path");
              if (path) {
                path.setAttribute(
                  "d",
                  "M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z"
                );
              }
            }
          }
        });

        // Fade back in after changes
        gsap.to(navLinksDiv, {
          opacity: 1,
          duration: 0.2,
        });
      },
    });
  }
}

function restoreNavbar() {
  const navLinksDiv = document.querySelector(".nav-links");

  if (navLinksDiv) {
    gsap.to(navLinksDiv, {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        const navLinks = navLinksDiv.querySelectorAll("a");

        navLinks.forEach((link) => {
          link.style.display = "flex";

          if (link.classList.contains("is-contact")) {
            const divContent = link.querySelector("div");
            if (divContent) divContent.textContent = "let's chat";

            link.setAttribute("href", "/get-in-touch");

            // Revert colors for the is-contact link
            link.style.color = "#FCF5EB";
            link.style.backgroundColor = "#2D46CD";

            const svg = link.querySelector("svg");
            if (svg) {
              svg.setAttribute("viewBox", "0 0 16 16");
              const path = svg.querySelector("path");
              if (path) {
                path.setAttribute(
                  "d",
                  "M16 0.727264V11.7273H5.71094L2 15.4382V11.7273H0V0.727264H16Z"
                );
              }
            }
          }
        });

        // Fade back in after changes
        gsap.to(navLinksDiv, {
          opacity: 1,
          duration: 0.2,
        });
      },
    });
  }
}

function formWatch() {
  // Set the min-height of `.w-form-done` elements to match their sibling form's height
  $(window).bind("load resize submit", function (e) {
    $("form").each(function () {
      var formHeight = $(this).height();
      $(this).siblings(".w-form-done").css({ "min-height": formHeight });
    });
  });

  // Select the target node to observe
  const targetNode = document.querySelector(".w-form-done");
  const fadeElement = document.getElementById("form-fade");

  // Define the callback function for the observer
  const callback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.attributeName === "style") {
        const computedStyle = window.getComputedStyle(targetNode);
        if (computedStyle.display === "block") {
          // Fade out the element with ID 'form-fade'
          if (fadeElement) {
            fadeElement.style.transition = "opacity 0.5s ease";
            fadeElement.style.opacity = "0";
          }

          // Trigger a Barba.js transition
          barba.go("https://brandmeuk.webflow.io/get-in-touch/thank-you");
        }
      }
    }
  };

  // Create a new MutationObserver instance
  const observer = new MutationObserver(callback);

  // Start observing the target node for attribute changes
  if (targetNode) {
    observer.observe(targetNode, { attributes: true });
  } else {
    console.error("Element with class .w-form-done not found.");
  }
}

function handleNavbarVisibility() {
  let lastScrollY = window.scrollY;
  const nav = document.querySelector('.nav'); // Update selector to match your navbar
  const logoNav = document.querySelector('.logo-nav'); // Update selector
  const svgLogo = document.querySelector('.svg-logo'); // Update selector

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY === 0) {
      // At the very top of the page, always show the navbar
      nav.style.transition = "transform 0.3s ease";
      nav.style.transform = "translateY(0)";
    } else if (currentScrollY > lastScrollY) {
      // Scrolling down - hide the navbar
      nav.style.transition = "transform 0.3s ease";
      nav.style.transform = "translateY(-200%)";
      logoNav.style.opacity = "1";
      logoNav.style.transition = "opacity 0.3s ease 300ms";
      svgLogo.style.opacity = "0";
      svgLogo.style.transition = "opacity 0.3s ease 300ms";
    } else {
      // Scrolling up - show the navbar
      nav.style.transition = "transform 0.3s ease";
      nav.style.transform = "translateY(0)";
    }

    lastScrollY = currentScrollY;
  });
}

handleNavbarVisibility();


function resetLogo() {
  if (logoNav && svgLogo) {
    // Ensure transition is applied before changing opacity
    logoNav.style.transition = "opacity 0.3s ease";
    svgLogo.style.transition = "opacity 0.3s ease";

    // Update opacity
    logoNav.style.opacity = "0";
    svgLogo.style.opacity = "1";
  }
}

function hideLogo() {
  if (logoNav && svgLogo) {
    // Ensure transition is applied before changing opacity
    logoNav.style.transition = "opacity 0.3s ease";
    svgLogo.style.transition = "opacity 0.3s ease";

    // Update opacity
    logoNav.style.opacity = "0";
    svgLogo.style.opacity = "0";
  }
}


function workVideo() {
  const video = document.getElementById("work");

  video.addEventListener("ended", () => {
    window.scrollBy({
      top: window.innerHeight * 0.5, // Calculate 50vh dynamically
      behavior: "smooth", // Optional for a smooth scroll animation
    });
  });
}

function displayLogoAnimation() {
  // Select the container where the Lottie animation will be added
  const logoAnimationContainer = document.querySelector(".logo-animation");

  // Create the Lottie animation div
  const lottieLogo = document.createElement("div");
  lottieLogo.classList.add("lottie-logo"); // Add the class
  logoAnimationContainer.appendChild(lottieLogo); // Append it to the container

  // Initialize the Lottie animation
  const lottieAnimation = lottie.loadAnimation({
    container: lottieLogo,
    renderer: "svg",
    loop: false,
    autoplay: true,
    path: "https://cdn.prod.website-files.com/66e944fb4d433ab0e986db0d/67448ad4bda802c1c9e745a0_logoloop.json",
  });

  // Playback logic
  lottieAnimation.addEventListener("complete", () => {
    const startFrame = 90;
    lottieAnimation.loop = true;
    lottieAnimation.playSegments(
      [startFrame, lottieAnimation.totalFrames],
      true
    );
  });
}

// Mobile Menu
const mobileMenuButton = document.getElementById("mobile-menu");
const navMobile = document.querySelector(".nav-mobile");
const body = document.querySelector("body");
const navLinks = document.querySelectorAll(".nav-mobile a");

let menuOpen = false;

mobileMenuButton.addEventListener("click", () => {
  if (!menuOpen) {
    navMobile.style.display = "block"; // Ensure the menu is visible

    // GSAP animation for fading in
    gsap.to(navMobile, {
      opacity: 1,
      duration: 0.3,
      ease: "ease-in-out",
    });

    body.style.overflow = "hidden";

    // Store the current logo color
    const currentLogoColor = getComputedStyle(
      document.querySelector(".logo-wrapper")
    ).color;

    // Change logo color to FCF5EB when menu opens
    gsap.to(".logo-wrapper", {
      color: "#FCF5EB",
      duration: 0.3,
      overwrite: true,
    });

    // Store the current logo color in a variable accessible to the closing event
    mobileMenuButton.dataset.currentLogoColor = currentLogoColor;

    gsap.fromTo(
      navLinks,
      { y: "100%", opacity: 0 },
      {
        y: "0%",
        opacity: 1,
        duration: 0.3,
        stagger: 0.1,
        ease: "ease-in-out",
        delay: 0.2,
      }
    );
  } else {
    // GSAP animation for fading out
    gsap.to(navMobile, {
      opacity: 0,
      duration: 0.3,
      ease: "ease-in-out",
      onComplete: () => {
        navMobile.style.display = "none"; // Hide the menu after fading out
      },
    });

    body.style.overflow = "auto";

    // Retrieve the stored logo color
    const currentLogoColor = mobileMenuButton.dataset.currentLogoColor;

    // Change logo color back to the original color when menu closes
    gsap.to(".logo-wrapper", {
      color: currentLogoColor,
      duration: 0.3,
      overwrite: true,
    });

    gsap.to(navLinks, {
      y: "100%",
      opacity: 0,
      duration: 0.3,
      stagger: 0.1,
      ease: "ease-in-out",
    });
  }
  menuOpen = !menuOpen;
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (menuOpen) {
      // GSAP animation for fading out (same as above)
      gsap.to(navMobile, {
        opacity: 0,
        duration: 0.3,
        ease: "ease-in-out",
        onComplete: () => {
          navMobile.style.display = "none"; // Hide the menu after fading out
        },
      });

      body.style.overflow = "auto";

      // Retrieve the stored logo color
      const currentLogoColor = mobileMenuButton.dataset.currentLogoColor;

      // Change logo color back to the original color when menu closes
      gsap.to(".logo-wrapper", {
        color: currentLogoColor,
        duration: 0.3,
        overwrite: true,
      });

      gsap.to(navLinks, {
        y: "100%",
        opacity: 0,
        duration: 0.3,
        stagger: 0.1,
        ease: "ease-in-out",
      });

      menuOpen = false;
    }
  });
