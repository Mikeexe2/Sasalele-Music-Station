import {
  ref,
  set,
  get,
  onValue,
  query,
  orderByChild,
  limitToLast,
  endBefore,
  push,
} from "firebase/database";
import { db } from "./utils.js";
import { createIcon } from "./icons.js";

import {
  onAuthChange,
  signUp,
  signIn,
  signInAnonymouslyUser,
  signOutUser,
  getDisplayName,
  reserveDisplayName,
  validateDisplayName,
  normalizeName,
  mapAuthError,
} from "./auth.js";

export class ChatApp {
  constructor(config) {
    if (!config?.chatPath || !config?.containerEl) {
      throw new Error("ChatApp requires { chatPath, containerEl }");
    }
    this.config = {
      joinFormEl: config.containerEl,
      pageSize: 40,
      ...config,
    };

    this.currentChatPath = this.config.chatPath;
    this.currentUser = null;
    this.activeListener = null;
    this.unsubscribeAuth = null;
    this.isSending = false;
    this.oldestTimestamp = null;
    this.chatContainerEl = this.config.containerEl;
    this.joinFormEl = this.config.joinFormEl;
    this.panelEl = this.config.panel?.panelEl ?? null;
    this.toggleEl = this.config.panel?.toggleEl ?? null;
    this.closeEl = this.config.panel?.closeEl ?? null;
    this.init();
  }

  init() {
    this.setupPanel();
    this.unsubscribeAuth = onAuthChange((user) => this.handleAuthState(user));
  }

  async handleAuthState(user) {
    if (!user) {
      this.currentUser = null;
      this.stopListening();
      this.showJoinForm();
      return;
    }

    let displayName = null;
    try {
      displayName = await getDisplayName(user.uid);
    } catch (e) {
      console.error("[chat] failed to load display name:", e);
    }

    this.currentUser = {
      uid: user.uid,
      email: user.email,
      displayName,
    };

    if (!displayName) {
      this.showDisplayNameForm();
    } else {
      this.showChat();
    }
  }

  setupPanel() {
    if (!this.panelEl) return;
    if (this.toggleEl) {
      this.toggleEl.addEventListener("click", () => this.togglePanel());
    }
    if (this.closeEl) {
      this.closeEl.addEventListener("click", () => this.togglePanel());
    }
    const isOpen = this.panelEl.classList.contains("open");
    this.toggleEl?.setAttribute("aria-expanded", String(isOpen));
    this.updateToggleIcon(isOpen);
  }

  togglePanel() {
    if (!this.panelEl) return;
    const isOpen = this.panelEl.classList.toggle("open");
    this.toggleEl?.setAttribute("aria-expanded", String(isOpen));
    this.updateToggleIcon(isOpen);
  }

  updateToggleIcon(isOpen) {
    if (!this.toggleEl) return;
    this.toggleEl.innerHTML = createIcon(isOpen ? "times" : "comments");
  }

  showJoinForm() {
    this.chatContainerEl.innerHTML = "";
    this.chatContainerEl.style.display = "none";
    this.joinFormEl.innerHTML = `
      <div class="container mt-3 auth-form">
        <div class="auth-tabs d-flex mb-3 gap-1">
          <button type="button" class="btn btn-sm flex-fill auth-tab active" data-mode="signin">Sign In</button>
          <button type="button" class="btn btn-sm flex-fill auth-tab" data-mode="signup">Sign Up</button>
        </div>

        <div class="mb-3">
          <input type="email" class="form-control" id="authEmail"
                 placeholder="Email" autocomplete="email" required>
        </div>

        <div class="mb-3">
          <input type="password" class="form-control" id="authPassword"
                 placeholder="Password" autocomplete="current-password" required>
        </div>

        <div class="mb-3 d-none" id="authConfirmWrap">
          <input type="password" class="form-control" id="authConfirm"
                 placeholder="Confirm Password">
        </div>

        <div class="text-danger small mb-2 d-none" id="authError"></div>

        <button type="button" class="btn btn-primary w-100" id="authSubmitBtn" disabled>
          Sign In
        </button>

        <div class="d-flex align-items-center my-3">
          <hr class="flex-grow-1 my-0">
          <span class="px-2 text-muted small">OR</span>
          <hr class="flex-grow-1 my-0">
        </div>

        <button type="button" class="btn btn-outline-secondary w-100" id="guestBtn">
          Continue as Guest
        </button>

        <p class="text-muted small mt-3 mb-0 text-center">
          Sign up so that you can sync your favourite stations across devices.
        </p>
      </div>
    `;
    this.joinFormEl.style.display = "block";
    this.setupAuthForm();
  }

  setupAuthForm() {
    const tabs = this.joinFormEl.querySelectorAll(".auth-tab");
    const emailEl = this.joinFormEl.querySelector("#authEmail");
    const passEl = this.joinFormEl.querySelector("#authPassword");
    const confirmWrap = this.joinFormEl.querySelector("#authConfirmWrap");
    const confirmEl = this.joinFormEl.querySelector("#authConfirm");
    const submitBtn = this.joinFormEl.querySelector("#authSubmitBtn");
    const guestBtn = this.joinFormEl.querySelector("#guestBtn");
    const errorEl = this.joinFormEl.querySelector("#authError");

    let mode = "signin";

    const setMode = (next) => {
      mode = next;
      tabs.forEach((t) =>
        t.classList.toggle("active", t.dataset.mode === mode),
      );
      confirmWrap.classList.toggle("d-none", mode !== "signup");
      submitBtn.textContent = mode === "signin" ? "Sign In" : "Sign Up";
      passEl.setAttribute(
        "autocomplete",
        mode === "signin" ? "current-password" : "new-password",
      );
      errorEl.classList.add("d-none");
      validate();
    };

    const validate = () => {
      const email = emailEl.value.trim();
      const pass = passEl.value;
      const confirm = confirmEl.value;
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const passOk = pass.length >= 6;
      const confirmOk = mode === "signin" || pass === confirm;
      submitBtn.disabled = !(emailOk && passOk && confirmOk);
    };

    tabs.forEach((t) =>
      t.addEventListener("click", () => setMode(t.dataset.mode)),
    );
    [emailEl, passEl, confirmEl].forEach((el) =>
      el.addEventListener("input", validate),
    );

    const submit = async () => {
      const email = emailEl.value.trim();
      const password = passEl.value;
      errorEl.classList.add("d-none");
      submitBtn.disabled = true;
      submitBtn.textContent =
        mode === "signin" ? "Signing in..." : "Creating...";

      try {
        if (mode === "signin") {
          await signIn(email, password);
        } else {
          await signUp(email, password);
        }
      } catch (err) {
        console.error("[auth]", err);
        errorEl.textContent = mapAuthError(err);
        errorEl.classList.remove("d-none");
        submitBtn.disabled = false;
        submitBtn.textContent = mode === "signin" ? "Sign In" : "Sign Up";
      }
    };

    const handleGuestSignIn = async () => {
      errorEl.classList.add("d-none");
      guestBtn.disabled = true;
      submitBtn.disabled = true;
      guestBtn.textContent = "Connecting as Guest...";

      try {
        await signInAnonymouslyUser();
      } catch (err) {
        console.error("[guest auth]", err);
        errorEl.textContent = mapAuthError(err);
        errorEl.classList.remove("d-none");
        guestBtn.disabled = false;
        submitBtn.disabled = false;
        guestBtn.textContent = "Continue as Guest";
      }
    };

    submitBtn.addEventListener("click", submit);
    guestBtn.addEventListener("click", handleGuestSignIn);

    this.joinFormEl.querySelectorAll("input").forEach((el) => {
      el.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !submitBtn.disabled) {
          e.preventDefault();
          submit();
        }
      });
    });

    emailEl.focus();
    setMode("signin");
  }

  showDisplayNameForm() {
    this.chatContainerEl.innerHTML = "";
    this.chatContainerEl.style.display = "none";
    this.joinFormEl.innerHTML = `
      <div class="container mt-3">
        <h6 class="mb-2">Choose a display name</h6>
        <p class="text-muted small mb-3">
          This is the name shown in chat. It must be unique.
        </p>
        <div class="mb-3">
          <input type="text" id="displayNameInput" class="form-control"
                 placeholder="e.g. YourName" maxlength="20" autocomplete="off">
        </div>
        <div class="text-danger small mb-2 d-none" id="displayNameError"></div>
        <button type="button" id="displayNameBtn"
                class="btn btn-primary w-100" disabled>Save</button>
        <div class="text-center mt-3">
          <button type="button" class="btn btn-link btn-sm" id="signOutFromName">
            Cancel & Back to Login
          </button>
        </div>
      </div>
    `;
    this.joinFormEl.style.display = "block";

    const input = this.joinFormEl.querySelector("#displayNameInput");
    const btn = this.joinFormEl.querySelector("#displayNameBtn");
    const errEl = this.joinFormEl.querySelector("#displayNameError");
    const signOutBtn = this.joinFormEl.querySelector("#signOutFromName");

    const validate = () => {
      const err = validateDisplayName(input.value);
      btn.disabled = !!err || !input.value.trim();
      if (input.value.trim()) {
        errEl.textContent = err || "";
        errEl.classList.toggle("d-none", !err);
      } else {
        errEl.classList.add("d-none");
      }
    };
    input.addEventListener("input", validate);

    const submit = async () => {
      const name = input.value.trim();
      const err = validateDisplayName(name);
      if (err) return;

      btn.disabled = true;
      btn.textContent = "Saving...";
      errEl.classList.add("d-none");

      try {
        await reserveDisplayName(name, this.currentUser.uid);
        this.currentUser.displayName = name;
        this.showChat();
      } catch (e) {
        console.error("[displayName]", e);
        errEl.textContent = e.message || "Failed to save display name";
        errEl.classList.remove("d-none");
        btn.disabled = false;
        btn.textContent = "Save";
      }
    };

    btn.addEventListener("click", submit);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !btn.disabled) {
        e.preventDefault();
        submit();
      }
    });
    signOutBtn.addEventListener("click", () => signOutUser());

    input.focus();
    validate();
  }

  showChat() {
    if (!this.currentUser?.displayName) {
      this.showDisplayNameForm();
      return;
    }
    this.joinFormEl.style.display = "none";
    this.joinFormEl.innerHTML = "";
    this.buildChatUI();
    this.chatContainerEl.style.display = "block";
    this.startListening();
  }

  buildChatUI() {
    const name = this.currentUser.displayName;
    this.chatContainerEl.innerHTML = `
      <div class="chat-content-wrapper">
        <div class="messages-container" data-role="messages">
          <div class="text-center py-2" data-role="loadMoreArea">
            <button class="btn btn-sm btn-link" data-role="loadMoreBtn">Load Older Messages</button>
          </div>
          <div data-role="history"></div>
          <div data-role="live"></div>
        </div>
        <div class="message-input-area">
          <div class="input-group">
            <input type="text" class="form-control" data-role="messageInput"
                   placeholder="Hi ${this.escapeHtml(name)}. Say Something..." maxlength="2000">
            <button class="btn btn-primary" data-role="sendBtn" disabled>
              ${createIcon("paper-plane")}
            </button>
          </div>
        </div>
        <div class="text-center mt-2">
          <button class="btn btn-outline-secondary btn-sm logoutBtn" data-role="logoutBtn">
            ${createIcon("right-from-bracket")} Logout
          </button>
        </div>
      </div>
    `;
    this.el = {
      messages: this.chatContainerEl.querySelector('[data-role="messages"]'),
      loadMoreArea: this.chatContainerEl.querySelector(
        '[data-role="loadMoreArea"]',
      ),
      loadMoreBtn: this.chatContainerEl.querySelector(
        '[data-role="loadMoreBtn"]',
      ),
      history: this.chatContainerEl.querySelector('[data-role="history"]'),
      live: this.chatContainerEl.querySelector('[data-role="live"]'),
      input: this.chatContainerEl.querySelector('[data-role="messageInput"]'),
      sendBtn: this.chatContainerEl.querySelector('[data-role="sendBtn"]'),
      logoutBtn: this.chatContainerEl.querySelector('[data-role="logoutBtn"]'),
    };
    this.setupChatEvents();
  }

  setupChatEvents() {
    this.el.input.addEventListener("input", () => {
      this.el.sendBtn.disabled = this.el.input.value.trim().length === 0;
    });
    this.el.input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !this.el.sendBtn.disabled) {
        this.sendMessage(this.el.input.value.trim());
        this.el.input.value = "";
        this.el.sendBtn.disabled = true;
      }
    });
    this.el.sendBtn.addEventListener("click", () => {
      this.sendMessage(this.el.input.value.trim());
      this.el.input.value = "";
      this.el.sendBtn.disabled = true;
    });
    this.el.loadMoreBtn.addEventListener("click", () => this.loadMore());
    this.el.logoutBtn.addEventListener("click", () => this.logout());
    setTimeout(() => this.el.input.focus(), 100);
  }

  async sendMessage(text) {
    if (!text || !this.currentUser || this.isSending) return;
    this.isSending = true;
    try {
      const newMessageRef = push(ref(db, this.currentChatPath));
      await set(newMessageRef, {
        message: String(text),
        name: String(this.currentUser.displayName),
        uid: String(this.currentUser.uid),
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      this.isSending = false;
    }
  }

  clearMessages() {
    this.el.history.innerHTML = "";
    this.el.live.innerHTML = "";
  }

  startListening() {
    if (!this.el?.live) return;
    this.el.live.innerHTML = "";
    this.el.history.innerHTML = "";
    this.oldestTimestamp = null;
    this.resetLoadMoreUI();

    const chatQuery = query(
      ref(db, this.currentChatPath),
      orderByChild("createdAt"),
      limitToLast(this.config.pageSize),
    );
    this.activeListener = onValue(chatQuery, (snap) =>
      this.handleMessages(snap),
    );
  }

  handleMessages(snapshot) {
    if (!snapshot.exists()) {
      this.el.live.innerHTML =
        '<div class="text-center text-muted py-3">No messages.</div>';
      return;
    }
    const messages = [];
    snapshot.forEach((c) => {
      messages.push({ id: c.key, ...c.val() });
    });
    messages.sort((a, b) => a.createdAt - b.createdAt);

    if (this.oldestTimestamp === null && messages.length) {
      this.oldestTimestamp = messages[0].createdAt;
    }

    this.el.live.innerHTML = "";
    messages.forEach((msg) =>
      this.el.live.appendChild(this.createMessageElement(msg)),
    );

    setTimeout(() => {
      if (this.el?.messages) {
        this.el.messages.scrollTop = this.el.messages.scrollHeight;
      }
    }, 100);
  }

  async loadMore() {
    if (!this.oldestTimestamp) return;
    const btn = this.el.loadMoreBtn;
    btn.disabled = true;
    btn.innerText = "Loading...";

    const oldQuery = query(
      ref(db, this.currentChatPath),
      orderByChild("createdAt"),
      endBefore(this.oldestTimestamp),
      limitToLast(this.config.pageSize),
    );
    try {
      const snapshot = await get(oldQuery);
      if (snapshot.exists()) {
        const oldMessages = [];
        snapshot.forEach((c) => {
          oldMessages.push({ id: c.key, ...c.val() });
        });
        oldMessages.sort((a, b) => a.createdAt - b.createdAt);
        this.oldestTimestamp = oldMessages[0].createdAt;
        oldMessages
          .reverse()
          .forEach((msg) =>
            this.el.history.prepend(this.createMessageElement(msg)),
          );
        if (oldMessages.length < this.config.pageSize) {
          this.el.loadMoreArea.innerHTML =
            '<span class="text-muted small">Beginning of chat</span>';
        } else {
          btn.innerText = "Load Older Messages";
          btn.disabled = false;
        }
      } else {
        this.el.loadMoreArea.innerHTML =
          '<span class="text-muted small">Beginning of chat</span>';
      }
    } catch (e) {
      console.error("Load more failed:", e);
      btn.disabled = false;
      btn.innerText = "Error - Try Again";
    }
  }

  createMessageElement(msg) {
    const isOwnMessage =
      this.currentUser && msg.uid && msg.uid === this.currentUser.uid;
    const div = document.createElement("div");
    div.className = `message ${isOwnMessage ? "own-message" : "other-message"}`;
    div.innerHTML = `
      <div class="message-header">
        <span class="message-user">${this.escapeHtml(msg.name || "Unknown")}</span>
        <span class="message-time">${this.formatTime(msg.createdAt)}</span>
      </div>
      <div class="message-body">
        ${this.linkifyText(this.escapeHtml(msg.message || ""))}
      </div>
    `;
    return div;
  }

  resetLoadMoreUI() {
    if (!this.el?.loadMoreArea) return;
    this.el.loadMoreArea.innerHTML = `
      <button class="btn btn-sm btn-link" data-role="loadMoreBtn">Load Older Messages</button>
    `;
    this.el.loadMoreBtn = this.chatContainerEl.querySelector(
      '[data-role="loadMoreBtn"]',
    );
    this.el.loadMoreBtn.addEventListener("click", () => this.loadMore());
  }

  stopListening() {
    if (this.activeListener) {
      this.activeListener();
      this.activeListener = null;
    }
  }

  async logout() {
    this.stopListening();
    try {
      await signOutUser();
    } catch (e) {
      console.error("[logout] failed:", e);
    }
  }

  destroy() {
    this.stopListening();
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
      this.unsubscribeAuth = null;
    }
  }

  escapeHtml(text) {
    if (typeof text !== "string") return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  linkifyText(text) {
    if (!text) return "";
    return text.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`,
    );
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const fmtDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}/${m}/${day}`;
    };
    const fmtTime = (d) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (date.toDateString() === now.toDateString()) return fmtTime(date);
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    if (date.toDateString() === yest.toDateString())
      return `Yesterday ${fmtTime(date)}`;
    return `${fmtDate(date)} ${fmtTime(date)}`;
  }
}

