---
name: graybird-motion
description: Restrained motion and accessible feedback for the existing Graybird site, using its lightweight native stack.
---
Preserve working scene behavior; do not replace native scrolling. CSS transitions and event-driven rAF are the default. Animate transform/opacity, avoid layout work inside raw scroll handlers, and pause unnecessary work while hidden/offscreen. Reset geometry after layout changes using the existing measured/ResizeObserver approach.

Each active control needs visible focus and a useful pressed/selected state. Disabled, pending and empty states must be honest. Touch must work without hover. Search and filtering do not need theatrical scanning or loading delays.

Reduced motion disables spatial/continuous animation and shows complete static content. Mark moving layers with data-qa="motion" or pause them for consistent screenshots. GSAP/ScrollTrigger/Lenis are optional only for a demonstrated need; if introduced, clean up listeners/triggers and provide a native fallback. The current site needs none of them.
