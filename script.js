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
  });

});
