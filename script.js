// Garante que o script só seja executado após todo o HTML ser completamente carregado pelo navegador
document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================================
     1. SISTEMA DE ABAS (TABS) PARA AS 12 TABELAS DO BANCO DE DADOS (SEÇÃO 3)
     ============================================================================ */

  // Seleciona todos os botões de navegação das abas e todos os painéis de conteúdo
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  // Percorre cada botão de aba para adicionar o evento de clique
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 1.1 Obtém o ID do painel correspondente armazenado no atributo customizado 'data-tab-target'
      const targetPaneId = button.getAttribute("data-tab-target");
      const targetPane = document.getElementById(targetPaneId);

      // Se o painel não existir por algum motivo, encerra a execução
      if (!targetPane) return;

      // 1.2 Remove o estado ativo (.active) de TODOS os botões e atualiza acessibilidade aria-selected
      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });

      // 1.3 Esconde TODOS os painéis de tabelas removendo a classe .active
      tabPanes.forEach((pane) => {
        pane.classList.remove("active");
      });

      // 1.4 Ativa exclusivamente o botão que foi clicado
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      // 1.5 Exibe exclusivamente o painel de tabelas correspondente
      targetPane.classList.add("active");
    });
  });


  /* ============================================================================
     2. MODAL NATIVO (<dialog>) PARA ZOOM DOS DIAGRAMAS DER E LÓGICO (SEÇÕES 2 E 3)
     ============================================================================ */

  // Seleciona todos os gatilhos que abrem os modais (botões de zoom e áreas de canvas)
  const openModalTriggers = document.querySelectorAll("[data-modal-target]");

  // Percorre cada gatilho de abertura de modal
  openModalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modalId = trigger.getAttribute("data-modal-target");
      const modal = document.getElementById(modalId);

      // Se o elemento <dialog> existir e suportar o método nativo showModal(), abre com backdrop
      if (modal && typeof modal.showModal === "function") {
        modal.showModal();
      }
    });
  });

  // Seleciona todos os botões de fechar os modais (botão "X" e botão "Fechar Janela")
  const closeModalButtons = document.querySelectorAll("[data-modal-close]");

  closeModalButtons.forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      const modalId = closeBtn.getAttribute("data-modal-close");
      const modal = document.getElementById(modalId);

      // Fecha o modal nativo
      if (modal && typeof modal.close === "function") {
        modal.close();
      }
    });
  });

  // Permite fechar o modal caso o usuário clique diretamente no fundo escuro (backdrop)
  const allModals = document.querySelectorAll("dialog.diagram-modal");

  allModals.forEach((modal) => {
    modal.addEventListener("click", (event) => {
      // Quando o clique for diretamente no elemento <dialog> e não no seu conteúdo interno (.diagram-modal__box)
      if (event.target === modal) {
        modal.close();
      }
    });

    // Reseta o estado de zoom da imagem ao fechar o modal
    modal.addEventListener("close", () => {
      const img = modal.querySelector(".diagram-modal__canvas img");
      if (img) {
        img.classList.remove("is-zoomed");
      }
    });
  });

  // 2.1 Permite alternar o modo Ultra Zoom (175%) ao clicar diretamente na imagem dentro do modal
  const modalImages = document.querySelectorAll(".diagram-modal__canvas img");
  modalImages.forEach((img) => {
    img.addEventListener("click", () => {
      img.classList.toggle("is-zoomed");
    });
  });


  /* ============================================================================
     3. ARQUITETURA FULL-PAGE SCROLL SNAPPING & SCROLL-DRIVEN SCALE/FADE (60FPS)
     ============================================================================ */

  const slidesContainer = document.querySelector(".slides-container");
  const slides = Array.from(document.querySelectorAll(".slides-container > .slide"));
  const dotsNav = document.querySelector(".slide-dots");
  const headerLinks = Array.from(document.querySelectorAll('.header__link[href^="#"]'));

  if (slidesContainer && slides.length > 0 && dotsNav) {
    // Ativa o modo Full-Page Deck no elemento <html>
    document.documentElement.classList.add("has-slides-deck");

    const COOLDOWN_MS = 700;
    const WHEEL_THRESHOLD = 95;
    const TOUCH_THRESHOLD = 65;
    const BOUNDARY_EPSILON = 4;

    let currentIndex = 0;
    let isLocked = false;
    let wheelAccumulator = 0;
    let wheelResetTimer = null;
    let touchStartY = 0;
    let touchCurrentY = 0;
    let isTouching = false;
    let rafId = null;

    // 3.1 Gera dinamicamente os botões de navegação lateral (.slide-dots)
    dotsNav.innerHTML = "";
    const dotButtons = slides.map((slide, index) => {
      const label =
        slide.getAttribute("data-slide-title") ||
        slide.querySelector(".section__title, .footer__title")?.textContent?.trim() ||
        `Etapa ${index + 1}`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slide-dots__btn";
      btn.setAttribute("aria-label", `Ir para ${label}`);
      btn.setAttribute("aria-current", index === 0 ? "true" : "false");
      btn.dataset.slideIndex = String(index);

      const tooltip = document.createElement("span");
      tooltip.className = "slide-dots__tooltip";
      tooltip.textContent = label;
      btn.appendChild(tooltip);

      btn.addEventListener("click", () => {
        goToSlide(index);
      });

      dotsNav.appendChild(btn);
      return btn;
    });

    // 3.2 Verifica se algum modal <dialog> está aberto
    const isAnyModalOpen = () => Boolean(document.querySelector("dialog[open]"));

    // 3.3 Verifica se um elemento interno rolável (ex: janela SQL ou tabela) ainda pode rolar na direção solicitada
    const canInnerElementScroll = (target, direction, stopAtSlide) => {
      let el = target instanceof Element ? target : null;
      while (el && el !== stopAtSlide && el !== document.body) {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        const isScrollable =
          (overflowY === "auto" || overflowY === "scroll") &&
          el.scrollHeight > el.clientHeight + 2;

        if (isScrollable) {
          if (direction > 0 && el.scrollTop + el.clientHeight < el.scrollHeight - 2) {
            return true;
          }
          if (direction < 0 && el.scrollTop > 2) {
            return true;
          }
        }
        el = el.parentElement;
      }
      return false;
    };

    // 3.4 Segurança Mobile/Conteúdo: verifica se o próprio slide possui rolagem interna pendente
    const canSlideScrollInternally = (slide, direction) => {
      if (!slide) return false;
      const hasOverflow = slide.scrollHeight > slide.clientHeight + BOUNDARY_EPSILON;
      if (!hasOverflow) return false;

      if (direction > 0) {
        return Math.ceil(slide.scrollTop + slide.clientHeight) < slide.scrollHeight - BOUNDARY_EPSILON;
      }
      if (direction < 0) {
        return slide.scrollTop > BOUNDARY_EPSILON;
      }
      return false;
    };

    // 3.5 Limpa estilos inline de interpolação progressiva (scrubbing)
    const clearScrubStyles = () => {
      slides.forEach((slide) => {
        slide.classList.remove("is-scrubbing");
        slide.style.transform = "";
        slide.style.opacity = "";
      });
    };

    // 3.6 Interpolação progressiva baseada na rolagem (Scroll-Driven Scale & Fade em 60fps)
    const applyProgressiveTransform = (progress, direction) => {
      const targetIndex = currentIndex + direction;
      if (targetIndex < 0 || targetIndex >= slides.length) return;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[targetIndex];
      const clamped = Math.min(Math.max(progress, 0), 1);

      currentSlide.classList.add("is-scrubbing");
      nextSlide.classList.add("is-scrubbing");

      if (direction > 0) {
        // Slide que sai (indo para cima): scale(1 -> 0.88), translateY(0 -> -40px), opacity(1 -> 0)
        const outScale = 1 - 0.12 * clamped;
        const outY = -40 * clamped;
        const outOpacity = 1 - clamped;

        // Slide que entra (vindo de baixo): scale(0.92 -> 1), translateY(40px -> 0), opacity(0 -> 1)
        const inScale = 0.92 + 0.08 * clamped;
        const inY = 40 * (1 - clamped);
        const inOpacity = clamped;

        currentSlide.style.transform = `translate3d(0, ${outY.toFixed(2)}px, 0) scale(${outScale.toFixed(4)})`;
        currentSlide.style.opacity = outOpacity.toFixed(3);

        nextSlide.style.transform = `translate3d(0, ${inY.toFixed(2)}px, 0) scale(${inScale.toFixed(4)})`;
        nextSlide.style.opacity = inOpacity.toFixed(3);
      } else {
        // Movimento reverso (voltando para o slide anterior que vem de cima)
        const outScale = 1 - 0.08 * clamped;
        const outY = 40 * clamped;
        const outOpacity = 1 - clamped;

        const inScale = 0.88 + 0.12 * clamped;
        const inY = -40 * (1 - clamped);
        const inOpacity = clamped;

        currentSlide.style.transform = `translate3d(0, ${outY.toFixed(2)}px, 0) scale(${outScale.toFixed(4)})`;
        currentSlide.style.opacity = outOpacity.toFixed(3);

        nextSlide.style.transform = `translate3d(0, ${inY.toFixed(2)}px, 0) scale(${inScale.toFixed(4)})`;
        nextSlide.style.opacity = inOpacity.toFixed(3);
      }
    };

    // 3.7 Atualiza classes de estado dos slides, indicadores de progresso (aria-current) e links do cabeçalho
    const syncSlideStates = (activeIndex) => {
      slides.forEach((slide, idx) => {
        slide.classList.remove("is-prev", "is-active", "is-next");
        if (idx < activeIndex) {
          slide.classList.add("is-prev");
          slide.setAttribute("aria-hidden", "true");
        } else if (idx === activeIndex) {
          slide.classList.add("is-active");
          slide.setAttribute("aria-hidden", "false");
        } else {
          slide.classList.add("is-next");
          slide.setAttribute("aria-hidden", "true");
        }
      });

      dotButtons.forEach((btn, idx) => {
        btn.setAttribute("aria-current", idx === activeIndex ? "true" : "false");
      });

      const activeId = slides[activeIndex]?.id;
      if (activeId) {
        headerLinks.forEach((link) => {
          const href = link.getAttribute("href");
          link.classList.toggle("is-active", href === `#${activeId}`);
        });
        history.replaceState(null, "", `#${activeId}`);
      }
    };

    // 3.8 Transição principal controlada com trava de tempo (debounce/cooldown de 700ms)
    const goToSlide = (targetIndex, options = { preserveEdgeScroll: false }) => {
      if (isLocked) return;
      if (targetIndex < 0 || targetIndex >= slides.length || targetIndex === currentIndex) {
        clearScrubStyles();
        syncSlideStates(currentIndex);
        return;
      }

      isLocked = true;
      wheelAccumulator = 0;
      const direction = targetIndex > currentIndex ? 1 : -1;
      const incomingSlide = slides[targetIndex];

      // Posiciona a rolagem interna do slide que entra (topo ao descer, ou base ao subir)
      if (incomingSlide) {
        if (options.preserveEdgeScroll && direction < 0) {
          incomingSlide.scrollTop = incomingSlide.scrollHeight;
        } else {
          incomingSlide.scrollTop = 0;
        }
      }

      clearScrubStyles();
      currentIndex = targetIndex;
      syncSlideStates(currentIndex);

      window.setTimeout(() => {
        isLocked = false;
      }, COOLDOWN_MS);
    };

    // 3.9 Controle de Rolagem (Wheel / Trackpad) com interpolação progressiva e trava de 700ms
    window.addEventListener(
      "wheel",
      (event) => {
        if (isAnyModalOpen()) return;
        if (event.ctrlKey) return; // Permite zoom nativo do navegador

        const direction = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
        if (direction === 0) return;

        const activeSlide = slides[currentIndex];

        // Se o cursor estiver sobre um bloco de código SQL ou tabela com scroll próprio, ou se o slide ainda tiver conteúdo interno para rolar:
        if (
          canInnerElementScroll(event.target, direction, activeSlide) ||
          canSlideScrollInternally(activeSlide, direction)
        ) {
          wheelAccumulator = 0;
          clearScrubStyles();
          return;
        }

        // Impede o scroll nativo e controla a transição do slide
        event.preventDefault();
        if (isLocked) return;

        const targetIndex = currentIndex + direction;
        if (targetIndex < 0 || targetIndex >= slides.length) {
          wheelAccumulator = 0;
          clearScrubStyles();
          return;
        }

        wheelAccumulator += event.deltaY;
        const progress = Math.min(Math.abs(wheelAccumulator) / WHEEL_THRESHOLD, 1);

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          if (progress < 1) {
            applyProgressiveTransform(progress, direction);
          } else {
            goToSlide(targetIndex, { preserveEdgeScroll: true });
          }
        });

        window.clearTimeout(wheelResetTimer);
        wheelResetTimer = window.setTimeout(() => {
          if (!isLocked && Math.abs(wheelAccumulator) > 0 && Math.abs(wheelAccumulator) < WHEEL_THRESHOLD) {
            wheelAccumulator = 0;
            clearScrubStyles();
            syncSlideStates(currentIndex);
          }
        }, 160);
      },
      { passive: false }
    );

    // 3.10 Controle Touch (Mobile / Tablet) com interpolação progressiva
    window.addEventListener(
      "touchstart",
      (event) => {
        if (isAnyModalOpen() || isLocked) return;
        if (event.touches.length !== 1) return;
        touchStartY = event.touches[0].clientY;
        touchCurrentY = touchStartY;
        isTouching = true;
      },
      { passive: true }
    );

    window.addEventListener(
      "touchmove",
      (event) => {
        if (!isTouching || isAnyModalOpen() || isLocked) return;
        touchCurrentY = event.touches[0].clientY;
        const deltaY = touchStartY - touchCurrentY;
        const direction = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0;
        if (direction === 0) return;

        const activeSlide = slides[currentIndex];
        if (
          canInnerElementScroll(event.target, direction, activeSlide) ||
          canSlideScrollInternally(activeSlide, direction)
        ) {
          touchStartY = touchCurrentY;
          clearScrubStyles();
          return;
        }

        const targetIndex = currentIndex + direction;
        if (targetIndex >= 0 && targetIndex < slides.length) {
          const progress = Math.min(Math.abs(deltaY) / (TOUCH_THRESHOLD * 2), 0.85);
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            applyProgressiveTransform(progress, direction);
          });
        }
      },
      { passive: true }
    );

    window.addEventListener(
      "touchend",
      () => {
        if (!isTouching) return;
        isTouching = false;
        if (isAnyModalOpen() || isLocked) return;

        const deltaY = touchStartY - touchCurrentY;
        const direction = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0;
        const activeSlide = slides[currentIndex];

        if (
          direction !== 0 &&
          !canSlideScrollInternally(activeSlide, direction) &&
          Math.abs(deltaY) >= TOUCH_THRESHOLD
        ) {
          const targetIndex = currentIndex + direction;
          if (targetIndex >= 0 && targetIndex < slides.length) {
            goToSlide(targetIndex, { preserveEdgeScroll: true });
            return;
          }
        }

        clearScrubStyles();
        syncSlideStates(currentIndex);
      },
      { passive: true }
    );

    // 3.11 Acessibilidade e Navegação por Teclado (ArrowDown, ArrowUp, PageDown, PageUp, Home, End)
    window.addEventListener("keydown", (event) => {
      if (isAnyModalOpen() || isLocked) return;

      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;

      const activeSlide = slides[currentIndex];

      if (event.key === "ArrowDown" || event.key === "PageDown") {
        if (canSlideScrollInternally(activeSlide, 1)) return;
        event.preventDefault();
        goToSlide(currentIndex + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        if (canSlideScrollInternally(activeSlide, -1)) return;
        event.preventDefault();
        goToSlide(currentIndex - 1, { preserveEdgeScroll: true });
      } else if (event.key === "Home") {
        event.preventDefault();
        goToSlide(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goToSlide(slides.length - 1);
      }
    });

    // 3.12 Intercepta cliques nos links do cabeçalho e no botão "Voltar ao Topo" para navegar via engine de slides
    const allAnchorLinks = document.querySelectorAll('a[href^="#"]');
    allAnchorLinks.forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const targetHash = anchor.getAttribute("href");
        if (!targetHash || targetHash === "#") return;
        const targetId = targetHash.slice(1);
        const targetSlideIndex = slides.findIndex((slide) => slide.id === targetId);

        if (targetSlideIndex !== -1) {
          event.preventDefault();
          goToSlide(targetSlideIndex);
        }
      });
    });

    // 3.13 Inicializa no slide correspondente ao hash da URL (se houver) ou no primeiro slide
    const initialHashId = window.location.hash.replace("#", "");
    const initialIndex = slides.findIndex((slide) => slide.id === initialHashId);
    currentIndex = initialIndex !== -1 ? initialIndex : 0;
    syncSlideStates(currentIndex);
  }

});
