onload = () => {
  const c = setTimeout(() => {
    document.body.classList.remove("not-loaded");
    clearTimeout(c);
  }, 1000);

  const giftTrigger = document.getElementById("giftTrigger");
  const likeModal = document.getElementById("likeModal");
  const likeModalBackdrop = document.getElementById("likeModalBackdrop");
  const likeActions = document.getElementById("likeActions");
  const likeSuccess = document.getElementById("likeSuccess");
  const btnYes = document.getElementById("btnYes");
  const btnNo = document.getElementById("btnNo");

  if (!giftTrigger || !likeModal || !btnNo || !btnYes) return;

  let ignoreYesUntil = 0;
  let suppressYesTimer = null;

  const isMobile = () => window.matchMedia("(max-width: 600px)").matches;

  const getViewport = () => {
    const vv = window.visualViewport;
    if (!vv) {
      return {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
    return {
      left: vv.offsetLeft,
      top: vv.offsetTop,
      width: vv.width,
      height: vv.height,
    };
  };

  const getEdgePad = () => (isMobile() ? 10 : 16);

  const resetNoButton = () => {
    btnNo.style.position = "";
    btnNo.style.left = "";
    btnNo.style.top = "";
    btnNo.style.zIndex = "";
    btnNo.classList.remove("like-btn--escaped");
  };

  const suppressYesActivation = () => {
    ignoreYesUntil = Date.now() + 500;
    btnYes.style.pointerEvents = "none";
    clearTimeout(suppressYesTimer);
    suppressYesTimer = setTimeout(() => {
      btnYes.style.pointerEvents = "";
      ignoreYesUntil = 0;
    }, 500);
  };

  const clampNoButton = () => {
    if (btnNo.style.position !== "fixed") return;

    const pad = getEdgePad();
    const vv = getViewport();
    const rect = btnNo.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    let x = parseFloat(btnNo.style.left) || rect.left;
    let y = parseFloat(btnNo.style.top) || rect.top;

    const minX = vv.left + pad;
    const minY = vv.top + pad;
    const maxX = vv.left + vv.width - w - pad;
    const maxY = vv.top + vv.height - h - pad;

    x = Math.min(Math.max(x, minX), Math.max(minX, maxX));
    y = Math.min(Math.max(y, minY), Math.max(minY, maxY));

    btnNo.style.left = `${x}px`;
    btnNo.style.top = `${y}px`;
  };

  const moveNoButton = () => {
    const pad = getEdgePad();
    const vv = getViewport();
    const rect = btnNo.getBoundingClientRect();
    const w = rect.width || btnNo.offsetWidth;
    const h = rect.height || btnNo.offsetHeight;

    const minX = vv.left + pad;
    const minY = vv.top + pad;
    const maxX = vv.left + vv.width - w - pad;
    const maxY = vv.top + vv.height - h - pad;

    const spanX = Math.max(0, maxX - minX);
    const spanY = Math.max(0, maxY - minY);
    const x = minX + Math.random() * spanX;
    const y = minY + Math.random() * spanY;

    btnNo.style.position = "fixed";
    btnNo.style.left = `${x}px`;
    btnNo.style.top = `${y}px`;
    btnNo.style.zIndex = "10001";
    btnNo.classList.add("like-btn--escaped");
  };

  const onNoPress = (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveNoButton();
    suppressYesActivation();
  };

  const openModal = () => {
    likeModal.classList.remove("like-modal--hidden");
    likeModal.setAttribute("aria-hidden", "false");
    likeActions.classList.remove("like-modal__actions--hidden");
    likeSuccess.classList.add("like-modal__success--hidden");
    ignoreYesUntil = 0;
    btnYes.style.pointerEvents = "";
    resetNoButton();
    document.body.classList.add("like-modal-open");
  };

  const closeModal = () => {
    likeModal.classList.add("like-modal--hidden");
    likeModal.setAttribute("aria-hidden", "true");
    ignoreYesUntil = 0;
    btnYes.style.pointerEvents = "";
    resetNoButton();
    document.body.classList.remove("like-modal-open");
  };

  giftTrigger.addEventListener("click", openModal);

  btnNo.addEventListener("pointerdown", onNoPress);
  btnNo.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  likeModal.addEventListener(
    "touchend",
    (e) => {
      if (Date.now() < ignoreYesUntil) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { passive: false, capture: true },
  );

  likeModal.addEventListener(
    "click",
    (e) => {
      if (Date.now() < ignoreYesUntil && e.target !== btnYes) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true,
  );

  window.visualViewport?.addEventListener("resize", clampNoButton);
  window.visualViewport?.addEventListener("scroll", clampNoButton);

  btnYes.addEventListener("click", (e) => {
    if (Date.now() < ignoreYesUntil) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    likeActions.classList.add("like-modal__actions--hidden");
    likeSuccess.classList.remove("like-modal__success--hidden");
    resetNoButton();
  });
};
