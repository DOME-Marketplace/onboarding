// front/src/components/pocketbase.es.mjs
var ClientResponseError = class _ClientResponseError extends Error {
  constructor(e2) {
    super("ClientResponseError"), this.url = "", this.status = 0, this.response = {}, this.isAbort = false, this.originalError = null, Object.setPrototypeOf(this, _ClientResponseError.prototype), null !== e2 && "object" == typeof e2 && (this.url = "string" == typeof e2.url ? e2.url : "", this.status = "number" == typeof e2.status ? e2.status : 0, this.isAbort = !!e2.isAbort, this.originalError = e2.originalError, null !== e2.response && "object" == typeof e2.response ? this.response = e2.response : null !== e2.data && "object" == typeof e2.data ? this.response = e2.data : this.response = {}), this.originalError || e2 instanceof _ClientResponseError || (this.originalError = e2), "undefined" != typeof DOMException && e2 instanceof DOMException && (this.isAbort = true), this.name = "ClientResponseError " + this.status, this.message = this.response?.message, this.message || (this.isAbort ? this.message = "The request was autocancelled. You can find more info in https://github.com/pocketbase/js-sdk#auto-cancellation." : this.originalError?.cause?.message?.includes("ECONNREFUSED ::1") ? this.message = "Failed to connect to the PocketBase server. Try changing the SDK URL from localhost to 127.0.0.1 (https://github.com/pocketbase/js-sdk/issues/21)." : this.message = "Something went wrong while processing your request.");
  }
  get data() {
    return this.response;
  }
  toJSON() {
    return { ...this };
  }
};
var e = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
function cookieParse(e2, t2) {
  const s2 = {};
  if ("string" != typeof e2) return s2;
  const i2 = Object.assign({}, t2 || {}).decode || defaultDecode;
  let n2 = 0;
  for (; n2 < e2.length; ) {
    const t3 = e2.indexOf("=", n2);
    if (-1 === t3) break;
    let r = e2.indexOf(";", n2);
    if (-1 === r) r = e2.length;
    else if (r < t3) {
      n2 = e2.lastIndexOf(";", t3 - 1) + 1;
      continue;
    }
    const o = e2.slice(n2, t3).trim();
    if (void 0 === s2[o]) {
      let n3 = e2.slice(t3 + 1, r).trim();
      34 === n3.charCodeAt(0) && (n3 = n3.slice(1, -1));
      try {
        s2[o] = i2(n3);
      } catch (e3) {
        s2[o] = n3;
      }
    }
    n2 = r + 1;
  }
  return s2;
}
function cookieSerialize(t2, s2, i2) {
  const n2 = Object.assign({}, i2 || {}), r = n2.encode || defaultEncode;
  if (!e.test(t2)) throw new TypeError("argument name is invalid");
  const o = r(s2);
  if (o && !e.test(o)) throw new TypeError("argument val is invalid");
  let a = t2 + "=" + o;
  if (null != n2.maxAge) {
    const e2 = n2.maxAge - 0;
    if (isNaN(e2) || !isFinite(e2)) throw new TypeError("option maxAge is invalid");
    a += "; Max-Age=" + Math.floor(e2);
  }
  if (n2.domain) {
    if (!e.test(n2.domain)) throw new TypeError("option domain is invalid");
    a += "; Domain=" + n2.domain;
  }
  if (n2.path) {
    if (!e.test(n2.path)) throw new TypeError("option path is invalid");
    a += "; Path=" + n2.path;
  }
  if (n2.expires) {
    if (!function isDate(e2) {
      return "[object Date]" === Object.prototype.toString.call(e2) || e2 instanceof Date;
    }(n2.expires) || isNaN(n2.expires.valueOf())) throw new TypeError("option expires is invalid");
    a += "; Expires=" + n2.expires.toUTCString();
  }
  if (n2.httpOnly && (a += "; HttpOnly"), n2.secure && (a += "; Secure"), n2.priority) {
    switch ("string" == typeof n2.priority ? n2.priority.toLowerCase() : n2.priority) {
      case "low":
        a += "; Priority=Low";
        break;
      case "medium":
        a += "; Priority=Medium";
        break;
      case "high":
        a += "; Priority=High";
        break;
      default:
        throw new TypeError("option priority is invalid");
    }
  }
  if (n2.sameSite) {
    switch ("string" == typeof n2.sameSite ? n2.sameSite.toLowerCase() : n2.sameSite) {
      case true:
        a += "; SameSite=Strict";
        break;
      case "lax":
        a += "; SameSite=Lax";
        break;
      case "strict":
        a += "; SameSite=Strict";
        break;
      case "none":
        a += "; SameSite=None";
        break;
      default:
        throw new TypeError("option sameSite is invalid");
    }
  }
  return a;
}
function defaultDecode(e2) {
  return -1 !== e2.indexOf("%") ? decodeURIComponent(e2) : e2;
}
function defaultEncode(e2) {
  return encodeURIComponent(e2);
}
var t = "undefined" != typeof navigator && "ReactNative" === navigator.product || "undefined" != typeof global && global.HermesInternal;
var s;
function getTokenPayload(e2) {
  if (e2) try {
    const t2 = decodeURIComponent(s(e2.split(".")[1]).split("").map(function(e3) {
      return "%" + ("00" + e3.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    return JSON.parse(t2) || {};
  } catch (e3) {
  }
  return {};
}
function isTokenExpired(e2, t2 = 0) {
  let s2 = getTokenPayload(e2);
  return !(Object.keys(s2).length > 0 && (!s2.exp || s2.exp - t2 > Date.now() / 1e3));
}
s = "function" != typeof atob || t ? (e2) => {
  let t2 = String(e2).replace(/=+$/, "");
  if (t2.length % 4 == 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  for (var s2, i2, n2 = 0, r = 0, o = ""; i2 = t2.charAt(r++); ~i2 && (s2 = n2 % 4 ? 64 * s2 + i2 : i2, n2++ % 4) ? o += String.fromCharCode(255 & s2 >> (-2 * n2 & 6)) : 0) i2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(i2);
  return o;
} : atob;
var i = "pb_auth";
var BaseAuthStore = class {
  constructor() {
    this.baseToken = "", this.baseModel = null, this._onChangeCallbacks = [];
  }
  get token() {
    return this.baseToken;
  }
  get model() {
    return this.baseModel;
  }
  get isValid() {
    return !isTokenExpired(this.token);
  }
  get isAdmin() {
    return "admin" === getTokenPayload(this.token).type;
  }
  get isAuthRecord() {
    return "authRecord" === getTokenPayload(this.token).type;
  }
  save(e2, t2) {
    this.baseToken = e2 || "", this.baseModel = t2 || null, this.triggerChange();
  }
  clear() {
    this.baseToken = "", this.baseModel = null, this.triggerChange();
  }
  loadFromCookie(e2, t2 = i) {
    const s2 = cookieParse(e2 || "")[t2] || "";
    let n2 = {};
    try {
      n2 = JSON.parse(s2), (null === typeof n2 || "object" != typeof n2 || Array.isArray(n2)) && (n2 = {});
    } catch (e3) {
    }
    this.save(n2.token || "", n2.model || null);
  }
  exportToCookie(e2, t2 = i) {
    const s2 = { secure: true, sameSite: true, httpOnly: true, path: "/" }, n2 = getTokenPayload(this.token);
    s2.expires = n2?.exp ? new Date(1e3 * n2.exp) : /* @__PURE__ */ new Date("1970-01-01"), e2 = Object.assign({}, s2, e2);
    const r = { token: this.token, model: this.model ? JSON.parse(JSON.stringify(this.model)) : null };
    let o = cookieSerialize(t2, JSON.stringify(r), e2);
    const a = "undefined" != typeof Blob ? new Blob([o]).size : o.length;
    if (r.model && a > 4096) {
      r.model = { id: r?.model?.id, email: r?.model?.email };
      const s3 = ["collectionId", "username", "verified"];
      for (const e3 in this.model) s3.includes(e3) && (r.model[e3] = this.model[e3]);
      o = cookieSerialize(t2, JSON.stringify(r), e2);
    }
    return o;
  }
  onChange(e2, t2 = false) {
    return this._onChangeCallbacks.push(e2), t2 && e2(this.token, this.model), () => {
      for (let t3 = this._onChangeCallbacks.length - 1; t3 >= 0; t3--) if (this._onChangeCallbacks[t3] == e2) return delete this._onChangeCallbacks[t3], void this._onChangeCallbacks.splice(t3, 1);
    };
  }
  triggerChange() {
    for (const e2 of this._onChangeCallbacks) e2 && e2(this.token, this.model);
  }
};
var LocalAuthStore = class extends BaseAuthStore {
  constructor(e2 = "pocketbase_auth") {
    super(), this.storageFallback = {}, this.storageKey = e2, this._bindStorageEvent();
  }
  get token() {
    return (this._storageGet(this.storageKey) || {}).token || "";
  }
  get model() {
    return (this._storageGet(this.storageKey) || {}).model || null;
  }
  save(e2, t2) {
    this._storageSet(this.storageKey, { token: e2, model: t2 }), super.save(e2, t2);
  }
  clear() {
    this._storageRemove(this.storageKey), super.clear();
  }
  _storageGet(e2) {
    if ("undefined" != typeof window && window?.localStorage) {
      const t2 = window.localStorage.getItem(e2) || "";
      try {
        return JSON.parse(t2);
      } catch (e3) {
        return t2;
      }
    }
    return this.storageFallback[e2];
  }
  _storageSet(e2, t2) {
    if ("undefined" != typeof window && window?.localStorage) {
      let s2 = t2;
      "string" != typeof t2 && (s2 = JSON.stringify(t2)), window.localStorage.setItem(e2, s2);
    } else this.storageFallback[e2] = t2;
  }
  _storageRemove(e2) {
    "undefined" != typeof window && window?.localStorage && window.localStorage?.removeItem(e2), delete this.storageFallback[e2];
  }
  _bindStorageEvent() {
    "undefined" != typeof window && window?.localStorage && window.addEventListener && window.addEventListener("storage", (e2) => {
      if (e2.key != this.storageKey) return;
      const t2 = this._storageGet(this.storageKey) || {};
      super.save(t2.token || "", t2.model || null);
    });
  }
};
var BaseService = class {
  constructor(e2) {
    this.client = e2;
  }
};
var SettingsService = class extends BaseService {
  async getAll(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send("/api/settings", e2);
  }
  async update(e2, t2) {
    return t2 = Object.assign({ method: "PATCH", body: e2 }, t2), this.client.send("/api/settings", t2);
  }
  async testS3(e2 = "storage", t2) {
    return t2 = Object.assign({ method: "POST", body: { filesystem: e2 } }, t2), this.client.send("/api/settings/test/s3", t2).then(() => true);
  }
  async testEmail(e2, t2, s2) {
    return s2 = Object.assign({ method: "POST", body: { email: e2, template: t2 } }, s2), this.client.send("/api/settings/test/email", s2).then(() => true);
  }
  async generateAppleClientSecret(e2, t2, s2, i2, n2, r) {
    return r = Object.assign({ method: "POST", body: { clientId: e2, teamId: t2, keyId: s2, privateKey: i2, duration: n2 } }, r), this.client.send("/api/settings/apple/generate-client-secret", r);
  }
};
var CrudService = class extends BaseService {
  decode(e2) {
    return e2;
  }
  async getFullList(e2, t2) {
    if ("number" == typeof e2) return this._getFullList(e2, t2);
    let s2 = 500;
    return (t2 = Object.assign({}, e2, t2)).batch && (s2 = t2.batch, delete t2.batch), this._getFullList(s2, t2);
  }
  async getList(e2 = 1, t2 = 30, s2) {
    return (s2 = Object.assign({ method: "GET" }, s2)).query = Object.assign({ page: e2, perPage: t2 }, s2.query), this.client.send(this.baseCrudPath, s2).then((e3) => (e3.items = e3.items?.map((e4) => this.decode(e4)) || [], e3));
  }
  async getFirstListItem(e2, t2) {
    return (t2 = Object.assign({ requestKey: "one_by_filter_" + this.baseCrudPath + "_" + e2 }, t2)).query = Object.assign({ filter: e2, skipTotal: 1 }, t2.query), this.getList(1, 1, t2).then((e3) => {
      if (!e3?.items?.length) throw new ClientResponseError({ status: 404, response: { code: 404, message: "The requested resource wasn't found.", data: {} } });
      return e3.items[0];
    });
  }
  async getOne(e2, t2) {
    if (!e2) throw new ClientResponseError({ url: this.client.buildUrl(this.baseCrudPath + "/"), status: 404, response: { code: 404, message: "Missing required record id.", data: {} } });
    return t2 = Object.assign({ method: "GET" }, t2), this.client.send(this.baseCrudPath + "/" + encodeURIComponent(e2), t2).then((e3) => this.decode(e3));
  }
  async create(e2, t2) {
    return t2 = Object.assign({ method: "POST", body: e2 }, t2), this.client.send(this.baseCrudPath, t2).then((e3) => this.decode(e3));
  }
  async update(e2, t2, s2) {
    return s2 = Object.assign({ method: "PATCH", body: t2 }, s2), this.client.send(this.baseCrudPath + "/" + encodeURIComponent(e2), s2).then((e3) => this.decode(e3));
  }
  async delete(e2, t2) {
    return t2 = Object.assign({ method: "DELETE" }, t2), this.client.send(this.baseCrudPath + "/" + encodeURIComponent(e2), t2).then(() => true);
  }
  _getFullList(e2 = 500, t2) {
    (t2 = t2 || {}).query = Object.assign({ skipTotal: 1 }, t2.query);
    let s2 = [], request = async (i2) => this.getList(i2, e2 || 500, t2).then((e3) => {
      const t3 = e3.items;
      return s2 = s2.concat(t3), t3.length == e3.perPage ? request(i2 + 1) : s2;
    });
    return request(1);
  }
};
function normalizeLegacyOptionsArgs(e2, t2, s2, i2) {
  const n2 = void 0 !== i2;
  return n2 || void 0 !== s2 ? n2 ? (console.warn(e2), t2.body = Object.assign({}, t2.body, s2), t2.query = Object.assign({}, t2.query, i2), t2) : Object.assign(t2, s2) : t2;
}
function resetAutoRefresh(e2) {
  e2._resetAutoRefresh?.();
}
var AdminService = class extends CrudService {
  get baseCrudPath() {
    return "/api/admins";
  }
  async update(e2, t2, s2) {
    return super.update(e2, t2, s2).then((e3) => (this.client.authStore.model?.id === e3.id && void 0 === this.client.authStore.model?.collectionId && this.client.authStore.save(this.client.authStore.token, e3), e3));
  }
  async delete(e2, t2) {
    return super.delete(e2, t2).then((t3) => (t3 && this.client.authStore.model?.id === e2 && void 0 === this.client.authStore.model?.collectionId && this.client.authStore.clear(), t3));
  }
  authResponse(e2) {
    const t2 = this.decode(e2?.admin || {});
    return e2?.token && e2?.admin && this.client.authStore.save(e2.token, t2), Object.assign({}, e2, { token: e2?.token || "", admin: t2 });
  }
  async authWithPassword(e2, t2, s2, i2) {
    let n2 = { method: "POST", body: { identity: e2, password: t2 } };
    n2 = normalizeLegacyOptionsArgs("This form of authWithPassword(email, pass, body?, query?) is deprecated. Consider replacing it with authWithPassword(email, pass, options?).", n2, s2, i2);
    const r = n2.autoRefreshThreshold;
    delete n2.autoRefreshThreshold, n2.autoRefresh || resetAutoRefresh(this.client);
    let o = await this.client.send(this.baseCrudPath + "/auth-with-password", n2);
    return o = this.authResponse(o), r && function registerAutoRefresh(e3, t3, s3, i3) {
      resetAutoRefresh(e3);
      const n3 = e3.beforeSend, r2 = e3.authStore.model, o2 = e3.authStore.onChange((t4, s4) => {
        (!t4 || s4?.id != r2?.id || (s4?.collectionId || r2?.collectionId) && s4?.collectionId != r2?.collectionId) && resetAutoRefresh(e3);
      });
      e3._resetAutoRefresh = function() {
        o2(), e3.beforeSend = n3, delete e3._resetAutoRefresh;
      }, e3.beforeSend = async (r3, o3) => {
        const a = e3.authStore.token;
        if (o3.query?.autoRefresh) return n3 ? n3(r3, o3) : { url: r3, sendOptions: o3 };
        let c = e3.authStore.isValid;
        if (c && isTokenExpired(e3.authStore.token, t3)) try {
          await s3();
        } catch (e4) {
          c = false;
        }
        c || await i3();
        const l = o3.headers || {};
        for (let t4 in l) if ("authorization" == t4.toLowerCase() && a == l[t4] && e3.authStore.token) {
          l[t4] = e3.authStore.token;
          break;
        }
        return o3.headers = l, n3 ? n3(r3, o3) : { url: r3, sendOptions: o3 };
      };
    }(this.client, r, () => this.authRefresh({ autoRefresh: true }), () => this.authWithPassword(e2, t2, Object.assign({ autoRefresh: true }, n2))), o;
  }
  async authRefresh(e2, t2) {
    let s2 = { method: "POST" };
    return s2 = normalizeLegacyOptionsArgs("This form of authRefresh(body?, query?) is deprecated. Consider replacing it with authRefresh(options?).", s2, e2, t2), this.client.send(this.baseCrudPath + "/auth-refresh", s2).then(this.authResponse.bind(this));
  }
  async requestPasswordReset(e2, t2, s2) {
    let i2 = { method: "POST", body: { email: e2 } };
    return i2 = normalizeLegacyOptionsArgs("This form of requestPasswordReset(email, body?, query?) is deprecated. Consider replacing it with requestPasswordReset(email, options?).", i2, t2, s2), this.client.send(this.baseCrudPath + "/request-password-reset", i2).then(() => true);
  }
  async confirmPasswordReset(e2, t2, s2, i2, n2) {
    let r = { method: "POST", body: { token: e2, password: t2, passwordConfirm: s2 } };
    return r = normalizeLegacyOptionsArgs("This form of confirmPasswordReset(resetToken, password, passwordConfirm, body?, query?) is deprecated. Consider replacing it with confirmPasswordReset(resetToken, password, passwordConfirm, options?).", r, i2, n2), this.client.send(this.baseCrudPath + "/confirm-password-reset", r).then(() => true);
  }
};
var n = ["requestKey", "$cancelKey", "$autoCancel", "fetch", "headers", "body", "query", "params", "cache", "credentials", "headers", "integrity", "keepalive", "method", "mode", "redirect", "referrer", "referrerPolicy", "signal", "window"];
function normalizeUnknownQueryParams(e2) {
  if (e2) {
    e2.query = e2.query || {};
    for (let t2 in e2) n.includes(t2) || (e2.query[t2] = e2[t2], delete e2[t2]);
  }
}
var RealtimeService = class extends BaseService {
  constructor() {
    super(...arguments), this.clientId = "", this.eventSource = null, this.subscriptions = {}, this.lastSentSubscriptions = [], this.maxConnectTimeout = 15e3, this.reconnectAttempts = 0, this.maxReconnectAttempts = 1 / 0, this.predefinedReconnectIntervals = [200, 300, 500, 1e3, 1200, 1500, 2e3], this.pendingConnects = [];
  }
  get isConnected() {
    return !!this.eventSource && !!this.clientId && !this.pendingConnects.length;
  }
  async subscribe(e2, t2, s2) {
    if (!e2) throw new Error("topic must be set.");
    let i2 = e2;
    if (s2) {
      normalizeUnknownQueryParams(s2 = Object.assign({}, s2));
      const e3 = "options=" + encodeURIComponent(JSON.stringify({ query: s2.query, headers: s2.headers }));
      i2 += (i2.includes("?") ? "&" : "?") + e3;
    }
    const listener = function(e3) {
      const s3 = e3;
      let i3;
      try {
        i3 = JSON.parse(s3?.data);
      } catch {
      }
      t2(i3 || {});
    };
    return this.subscriptions[i2] || (this.subscriptions[i2] = []), this.subscriptions[i2].push(listener), this.isConnected ? 1 === this.subscriptions[i2].length ? await this.submitSubscriptions() : this.eventSource?.addEventListener(i2, listener) : await this.connect(), async () => this.unsubscribeByTopicAndListener(e2, listener);
  }
  async unsubscribe(e2) {
    let t2 = false;
    if (e2) {
      const s2 = this.getSubscriptionsByTopic(e2);
      for (let e3 in s2) if (this.hasSubscriptionListeners(e3)) {
        for (let t3 of this.subscriptions[e3]) this.eventSource?.removeEventListener(e3, t3);
        delete this.subscriptions[e3], t2 || (t2 = true);
      }
    } else this.subscriptions = {};
    this.hasSubscriptionListeners() ? t2 && await this.submitSubscriptions() : this.disconnect();
  }
  async unsubscribeByPrefix(e2) {
    let t2 = false;
    for (let s2 in this.subscriptions) if ((s2 + "?").startsWith(e2)) {
      t2 = true;
      for (let e3 of this.subscriptions[s2]) this.eventSource?.removeEventListener(s2, e3);
      delete this.subscriptions[s2];
    }
    t2 && (this.hasSubscriptionListeners() ? await this.submitSubscriptions() : this.disconnect());
  }
  async unsubscribeByTopicAndListener(e2, t2) {
    let s2 = false;
    const i2 = this.getSubscriptionsByTopic(e2);
    for (let e3 in i2) {
      if (!Array.isArray(this.subscriptions[e3]) || !this.subscriptions[e3].length) continue;
      let i3 = false;
      for (let s3 = this.subscriptions[e3].length - 1; s3 >= 0; s3--) this.subscriptions[e3][s3] === t2 && (i3 = true, delete this.subscriptions[e3][s3], this.subscriptions[e3].splice(s3, 1), this.eventSource?.removeEventListener(e3, t2));
      i3 && (this.subscriptions[e3].length || delete this.subscriptions[e3], s2 || this.hasSubscriptionListeners(e3) || (s2 = true));
    }
    this.hasSubscriptionListeners() ? s2 && await this.submitSubscriptions() : this.disconnect();
  }
  hasSubscriptionListeners(e2) {
    if (this.subscriptions = this.subscriptions || {}, e2) return !!this.subscriptions[e2]?.length;
    for (let e3 in this.subscriptions) if (this.subscriptions[e3]?.length) return true;
    return false;
  }
  async submitSubscriptions() {
    if (this.clientId) return this.addAllSubscriptionListeners(), this.lastSentSubscriptions = this.getNonEmptySubscriptionKeys(), this.client.send("/api/realtime", { method: "POST", body: { clientId: this.clientId, subscriptions: this.lastSentSubscriptions }, requestKey: this.getSubscriptionsCancelKey() }).catch((e2) => {
      if (!e2?.isAbort) throw e2;
    });
  }
  getSubscriptionsCancelKey() {
    return "realtime_" + this.clientId;
  }
  getSubscriptionsByTopic(e2) {
    const t2 = {};
    e2 = e2.includes("?") ? e2 : e2 + "?";
    for (let s2 in this.subscriptions) (s2 + "?").startsWith(e2) && (t2[s2] = this.subscriptions[s2]);
    return t2;
  }
  getNonEmptySubscriptionKeys() {
    const e2 = [];
    for (let t2 in this.subscriptions) this.subscriptions[t2].length && e2.push(t2);
    return e2;
  }
  addAllSubscriptionListeners() {
    if (this.eventSource) {
      this.removeAllSubscriptionListeners();
      for (let e2 in this.subscriptions) for (let t2 of this.subscriptions[e2]) this.eventSource.addEventListener(e2, t2);
    }
  }
  removeAllSubscriptionListeners() {
    if (this.eventSource) for (let e2 in this.subscriptions) for (let t2 of this.subscriptions[e2]) this.eventSource.removeEventListener(e2, t2);
  }
  async connect() {
    if (!(this.reconnectAttempts > 0)) return new Promise((e2, t2) => {
      this.pendingConnects.push({ resolve: e2, reject: t2 }), this.pendingConnects.length > 1 || this.initConnect();
    });
  }
  initConnect() {
    this.disconnect(true), clearTimeout(this.connectTimeoutId), this.connectTimeoutId = setTimeout(() => {
      this.connectErrorHandler(new Error("EventSource connect took too long."));
    }, this.maxConnectTimeout), this.eventSource = new EventSource(this.client.buildUrl("/api/realtime")), this.eventSource.onerror = (e2) => {
      this.connectErrorHandler(new Error("Failed to establish realtime connection."));
    }, this.eventSource.addEventListener("PB_CONNECT", (e2) => {
      const t2 = e2;
      this.clientId = t2?.lastEventId, this.submitSubscriptions().then(async () => {
        let e3 = 3;
        for (; this.hasUnsentSubscriptions() && e3 > 0; ) e3--, await this.submitSubscriptions();
      }).then(() => {
        for (let e3 of this.pendingConnects) e3.resolve();
        this.pendingConnects = [], this.reconnectAttempts = 0, clearTimeout(this.reconnectTimeoutId), clearTimeout(this.connectTimeoutId);
        const t3 = this.getSubscriptionsByTopic("PB_CONNECT");
        for (let s2 in t3) for (let i2 of t3[s2]) i2(e2);
      }).catch((e3) => {
        this.clientId = "", this.connectErrorHandler(e3);
      });
    });
  }
  hasUnsentSubscriptions() {
    const e2 = this.getNonEmptySubscriptionKeys();
    if (e2.length != this.lastSentSubscriptions.length) return true;
    for (const t2 of e2) if (!this.lastSentSubscriptions.includes(t2)) return true;
    return false;
  }
  connectErrorHandler(e2) {
    if (clearTimeout(this.connectTimeoutId), clearTimeout(this.reconnectTimeoutId), !this.clientId && !this.reconnectAttempts || this.reconnectAttempts > this.maxReconnectAttempts) {
      for (let t3 of this.pendingConnects) t3.reject(new ClientResponseError(e2));
      return this.pendingConnects = [], void this.disconnect();
    }
    this.disconnect(true);
    const t2 = this.predefinedReconnectIntervals[this.reconnectAttempts] || this.predefinedReconnectIntervals[this.predefinedReconnectIntervals.length - 1];
    this.reconnectAttempts++, this.reconnectTimeoutId = setTimeout(() => {
      this.initConnect();
    }, t2);
  }
  disconnect(e2 = false) {
    if (clearTimeout(this.connectTimeoutId), clearTimeout(this.reconnectTimeoutId), this.removeAllSubscriptionListeners(), this.client.cancelRequest(this.getSubscriptionsCancelKey()), this.eventSource?.close(), this.eventSource = null, this.clientId = "", !e2) {
      this.reconnectAttempts = 0;
      for (let e3 of this.pendingConnects) e3.resolve();
      this.pendingConnects = [];
    }
  }
};
var RecordService = class extends CrudService {
  constructor(e2, t2) {
    super(e2), this.collectionIdOrName = t2;
  }
  get baseCrudPath() {
    return this.baseCollectionPath + "/records";
  }
  get baseCollectionPath() {
    return "/api/collections/" + encodeURIComponent(this.collectionIdOrName);
  }
  async subscribe(e2, t2, s2) {
    if (!e2) throw new Error("Missing topic.");
    if (!t2) throw new Error("Missing subscription callback.");
    return this.client.realtime.subscribe(this.collectionIdOrName + "/" + e2, t2, s2);
  }
  async unsubscribe(e2) {
    return e2 ? this.client.realtime.unsubscribe(this.collectionIdOrName + "/" + e2) : this.client.realtime.unsubscribeByPrefix(this.collectionIdOrName);
  }
  async getFullList(e2, t2) {
    if ("number" == typeof e2) return super.getFullList(e2, t2);
    const s2 = Object.assign({}, e2, t2);
    return super.getFullList(s2);
  }
  async getList(e2 = 1, t2 = 30, s2) {
    return super.getList(e2, t2, s2);
  }
  async getFirstListItem(e2, t2) {
    return super.getFirstListItem(e2, t2);
  }
  async getOne(e2, t2) {
    return super.getOne(e2, t2);
  }
  async create(e2, t2) {
    return super.create(e2, t2);
  }
  async update(e2, t2, s2) {
    return super.update(e2, t2, s2).then((e3) => (this.client.authStore.model?.id !== e3?.id || this.client.authStore.model?.collectionId !== this.collectionIdOrName && this.client.authStore.model?.collectionName !== this.collectionIdOrName || this.client.authStore.save(this.client.authStore.token, e3), e3));
  }
  async delete(e2, t2) {
    return super.delete(e2, t2).then((t3) => (!t3 || this.client.authStore.model?.id !== e2 || this.client.authStore.model?.collectionId !== this.collectionIdOrName && this.client.authStore.model?.collectionName !== this.collectionIdOrName || this.client.authStore.clear(), t3));
  }
  authResponse(e2) {
    const t2 = this.decode(e2?.record || {});
    return this.client.authStore.save(e2?.token, t2), Object.assign({}, e2, { token: e2?.token || "", record: t2 });
  }
  async listAuthMethods(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send(this.baseCollectionPath + "/auth-methods", e2).then((e3) => Object.assign({}, e3, { usernamePassword: !!e3?.usernamePassword, emailPassword: !!e3?.emailPassword, authProviders: Array.isArray(e3?.authProviders) ? e3?.authProviders : [] }));
  }
  async authWithPassword(e2, t2, s2, i2) {
    let n2 = { method: "POST", body: { identity: e2, password: t2 } };
    return n2 = normalizeLegacyOptionsArgs("This form of authWithPassword(usernameOrEmail, pass, body?, query?) is deprecated. Consider replacing it with authWithPassword(usernameOrEmail, pass, options?).", n2, s2, i2), this.client.send(this.baseCollectionPath + "/auth-with-password", n2).then((e3) => this.authResponse(e3));
  }
  async authWithOAuth2Code(e2, t2, s2, i2, n2, r, o) {
    let a = { method: "POST", body: { provider: e2, code: t2, codeVerifier: s2, redirectUrl: i2, createData: n2 } };
    return a = normalizeLegacyOptionsArgs("This form of authWithOAuth2Code(provider, code, codeVerifier, redirectUrl, createData?, body?, query?) is deprecated. Consider replacing it with authWithOAuth2Code(provider, code, codeVerifier, redirectUrl, createData?, options?).", a, r, o), this.client.send(this.baseCollectionPath + "/auth-with-oauth2", a).then((e3) => this.authResponse(e3));
  }
  authWithOAuth2(...e2) {
    if (e2.length > 1 || "string" == typeof e2?.[0]) return console.warn("PocketBase: This form of authWithOAuth2() is deprecated and may get removed in the future. Please replace with authWithOAuth2Code() OR use the authWithOAuth2() realtime form as shown in https://pocketbase.io/docs/authentication/#oauth2-integration."), this.authWithOAuth2Code(e2?.[0] || "", e2?.[1] || "", e2?.[2] || "", e2?.[3] || "", e2?.[4] || {}, e2?.[5] || {}, e2?.[6] || {});
    const t2 = e2?.[0] || {};
    let s2 = null;
    t2.urlCallback || (s2 = openBrowserPopup(void 0));
    const i2 = new RealtimeService(this.client);
    function cleanup() {
      s2?.close(), i2.unsubscribe();
    }
    const n2 = {}, r = t2.requestKey;
    return r && (n2.requestKey = r), this.listAuthMethods(n2).then((e3) => {
      const n3 = e3.authProviders.find((e4) => e4.name === t2.provider);
      if (!n3) throw new ClientResponseError(new Error(`Missing or invalid provider "${t2.provider}".`));
      const o = this.client.buildUrl("/api/oauth2-redirect"), a = r ? this.client.cancelControllers?.[r] : void 0;
      return a && (a.signal.onabort = () => {
        cleanup();
      }), new Promise(async (e4, r2) => {
        try {
          await i2.subscribe("@oauth2", async (s3) => {
            const c2 = i2.clientId;
            try {
              if (!s3.state || c2 !== s3.state) throw new Error("State parameters don't match.");
              if (s3.error || !s3.code) throw new Error("OAuth2 redirect error or missing code: " + s3.error);
              const i3 = Object.assign({}, t2);
              delete i3.provider, delete i3.scopes, delete i3.createData, delete i3.urlCallback, a?.signal?.onabort && (a.signal.onabort = null);
              const r3 = await this.authWithOAuth2Code(n3.name, s3.code, n3.codeVerifier, o, t2.createData, i3);
              e4(r3);
            } catch (e5) {
              r2(new ClientResponseError(e5));
            }
            cleanup();
          });
          const c = { state: i2.clientId };
          t2.scopes?.length && (c.scope = t2.scopes.join(" "));
          const l = this._replaceQueryParams(n3.authUrl + o, c);
          let h = t2.urlCallback || function(e5) {
            s2 ? s2.location.href = e5 : s2 = openBrowserPopup(e5);
          };
          await h(l);
        } catch (e5) {
          cleanup(), r2(new ClientResponseError(e5));
        }
      });
    }).catch((e3) => {
      throw cleanup(), e3;
    });
  }
  async authRefresh(e2, t2) {
    let s2 = { method: "POST" };
    return s2 = normalizeLegacyOptionsArgs("This form of authRefresh(body?, query?) is deprecated. Consider replacing it with authRefresh(options?).", s2, e2, t2), this.client.send(this.baseCollectionPath + "/auth-refresh", s2).then((e3) => this.authResponse(e3));
  }
  async requestPasswordReset(e2, t2, s2) {
    let i2 = { method: "POST", body: { email: e2 } };
    return i2 = normalizeLegacyOptionsArgs("This form of requestPasswordReset(email, body?, query?) is deprecated. Consider replacing it with requestPasswordReset(email, options?).", i2, t2, s2), this.client.send(this.baseCollectionPath + "/request-password-reset", i2).then(() => true);
  }
  async confirmPasswordReset(e2, t2, s2, i2, n2) {
    let r = { method: "POST", body: { token: e2, password: t2, passwordConfirm: s2 } };
    return r = normalizeLegacyOptionsArgs("This form of confirmPasswordReset(token, password, passwordConfirm, body?, query?) is deprecated. Consider replacing it with confirmPasswordReset(token, password, passwordConfirm, options?).", r, i2, n2), this.client.send(this.baseCollectionPath + "/confirm-password-reset", r).then(() => true);
  }
  async requestVerification(e2, t2, s2) {
    let i2 = { method: "POST", body: { email: e2 } };
    return i2 = normalizeLegacyOptionsArgs("This form of requestVerification(email, body?, query?) is deprecated. Consider replacing it with requestVerification(email, options?).", i2, t2, s2), this.client.send(this.baseCollectionPath + "/request-verification", i2).then(() => true);
  }
  async confirmVerification(e2, t2, s2) {
    let i2 = { method: "POST", body: { token: e2 } };
    return i2 = normalizeLegacyOptionsArgs("This form of confirmVerification(token, body?, query?) is deprecated. Consider replacing it with confirmVerification(token, options?).", i2, t2, s2), this.client.send(this.baseCollectionPath + "/confirm-verification", i2).then(() => {
      const t3 = getTokenPayload(e2), s3 = this.client.authStore.model;
      return s3 && !s3.verified && s3.id === t3.id && s3.collectionId === t3.collectionId && (s3.verified = true, this.client.authStore.save(this.client.authStore.token, s3)), true;
    });
  }
  async requestEmailChange(e2, t2, s2) {
    let i2 = { method: "POST", body: { newEmail: e2 } };
    return i2 = normalizeLegacyOptionsArgs("This form of requestEmailChange(newEmail, body?, query?) is deprecated. Consider replacing it with requestEmailChange(newEmail, options?).", i2, t2, s2), this.client.send(this.baseCollectionPath + "/request-email-change", i2).then(() => true);
  }
  async confirmEmailChange(e2, t2, s2, i2) {
    let n2 = { method: "POST", body: { token: e2, password: t2 } };
    return n2 = normalizeLegacyOptionsArgs("This form of confirmEmailChange(token, password, body?, query?) is deprecated. Consider replacing it with confirmEmailChange(token, password, options?).", n2, s2, i2), this.client.send(this.baseCollectionPath + "/confirm-email-change", n2).then(() => {
      const t3 = getTokenPayload(e2), s3 = this.client.authStore.model;
      return s3 && s3.id === t3.id && s3.collectionId === t3.collectionId && this.client.authStore.clear(), true;
    });
  }
  async listExternalAuths(e2, t2) {
    return t2 = Object.assign({ method: "GET" }, t2), this.client.send(this.baseCrudPath + "/" + encodeURIComponent(e2) + "/external-auths", t2);
  }
  async unlinkExternalAuth(e2, t2, s2) {
    return s2 = Object.assign({ method: "DELETE" }, s2), this.client.send(this.baseCrudPath + "/" + encodeURIComponent(e2) + "/external-auths/" + encodeURIComponent(t2), s2).then(() => true);
  }
  _replaceQueryParams(e2, t2 = {}) {
    let s2 = e2, i2 = "";
    e2.indexOf("?") >= 0 && (s2 = e2.substring(0, e2.indexOf("?")), i2 = e2.substring(e2.indexOf("?") + 1));
    const n2 = {}, r = i2.split("&");
    for (const e3 of r) {
      if ("" == e3) continue;
      const t3 = e3.split("=");
      n2[decodeURIComponent(t3[0].replace(/\+/g, " "))] = decodeURIComponent((t3[1] || "").replace(/\+/g, " "));
    }
    for (let e3 in t2) t2.hasOwnProperty(e3) && (null == t2[e3] ? delete n2[e3] : n2[e3] = t2[e3]);
    i2 = "";
    for (let e3 in n2) n2.hasOwnProperty(e3) && ("" != i2 && (i2 += "&"), i2 += encodeURIComponent(e3.replace(/%20/g, "+")) + "=" + encodeURIComponent(n2[e3].replace(/%20/g, "+")));
    return "" != i2 ? s2 + "?" + i2 : s2;
  }
};
function openBrowserPopup(e2) {
  if ("undefined" == typeof window || !window?.open) throw new ClientResponseError(new Error("Not in a browser context - please pass a custom urlCallback function."));
  let t2 = 1024, s2 = 768, i2 = window.innerWidth, n2 = window.innerHeight;
  t2 = t2 > i2 ? i2 : t2, s2 = s2 > n2 ? n2 : s2;
  let r = i2 / 2 - t2 / 2, o = n2 / 2 - s2 / 2;
  return window.open(e2, "popup_window", "width=" + t2 + ",height=" + s2 + ",top=" + o + ",left=" + r + ",resizable,menubar=no");
}
var CollectionService = class extends CrudService {
  get baseCrudPath() {
    return "/api/collections";
  }
  async import(e2, t2 = false, s2) {
    return s2 = Object.assign({ method: "PUT", body: { collections: e2, deleteMissing: t2 } }, s2), this.client.send(this.baseCrudPath + "/import", s2).then(() => true);
  }
};
var LogService = class extends BaseService {
  async getList(e2 = 1, t2 = 30, s2) {
    return (s2 = Object.assign({ method: "GET" }, s2)).query = Object.assign({ page: e2, perPage: t2 }, s2.query), this.client.send("/api/logs", s2);
  }
  async getOne(e2, t2) {
    if (!e2) throw new ClientResponseError({ url: this.client.buildUrl("/api/logs/"), status: 404, response: { code: 404, message: "Missing required log id.", data: {} } });
    return t2 = Object.assign({ method: "GET" }, t2), this.client.send("/api/logs/" + encodeURIComponent(e2), t2);
  }
  async getStats(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send("/api/logs/stats", e2);
  }
};
var HealthService = class extends BaseService {
  async check(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send("/api/health", e2);
  }
};
var FileService = class extends BaseService {
  getUrl(e2, t2, s2 = {}) {
    if (!t2 || !e2?.id || !e2?.collectionId && !e2?.collectionName) return "";
    const i2 = [];
    i2.push("api"), i2.push("files"), i2.push(encodeURIComponent(e2.collectionId || e2.collectionName)), i2.push(encodeURIComponent(e2.id)), i2.push(encodeURIComponent(t2));
    let n2 = this.client.buildUrl(i2.join("/"));
    if (Object.keys(s2).length) {
      false === s2.download && delete s2.download;
      const e3 = new URLSearchParams(s2);
      n2 += (n2.includes("?") ? "&" : "?") + e3;
    }
    return n2;
  }
  async getToken(e2) {
    return e2 = Object.assign({ method: "POST" }, e2), this.client.send("/api/files/token", e2).then((e3) => e3?.token || "");
  }
};
var BackupService = class extends BaseService {
  async getFullList(e2) {
    return e2 = Object.assign({ method: "GET" }, e2), this.client.send("/api/backups", e2);
  }
  async create(e2, t2) {
    return t2 = Object.assign({ method: "POST", body: { name: e2 } }, t2), this.client.send("/api/backups", t2).then(() => true);
  }
  async upload(e2, t2) {
    return t2 = Object.assign({ method: "POST", body: e2 }, t2), this.client.send("/api/backups/upload", t2).then(() => true);
  }
  async delete(e2, t2) {
    return t2 = Object.assign({ method: "DELETE" }, t2), this.client.send(`/api/backups/${encodeURIComponent(e2)}`, t2).then(() => true);
  }
  async restore(e2, t2) {
    return t2 = Object.assign({ method: "POST" }, t2), this.client.send(`/api/backups/${encodeURIComponent(e2)}/restore`, t2).then(() => true);
  }
  getDownloadUrl(e2, t2) {
    return this.client.buildUrl(`/api/backups/${encodeURIComponent(t2)}?token=${encodeURIComponent(e2)}`);
  }
};
var Client = class {
  constructor(e2 = "/", t2, s2 = "en-US") {
    this.cancelControllers = {}, this.recordServices = {}, this.enableAutoCancellation = true, this.baseUrl = e2, this.lang = s2, this.authStore = t2 || new LocalAuthStore(), this.admins = new AdminService(this), this.collections = new CollectionService(this), this.files = new FileService(this), this.logs = new LogService(this), this.settings = new SettingsService(this), this.realtime = new RealtimeService(this), this.health = new HealthService(this), this.backups = new BackupService(this);
  }
  collection(e2) {
    return this.recordServices[e2] || (this.recordServices[e2] = new RecordService(this, e2)), this.recordServices[e2];
  }
  autoCancellation(e2) {
    return this.enableAutoCancellation = !!e2, this;
  }
  cancelRequest(e2) {
    return this.cancelControllers[e2] && (this.cancelControllers[e2].abort(), delete this.cancelControllers[e2]), this;
  }
  cancelAllRequests() {
    for (let e2 in this.cancelControllers) this.cancelControllers[e2].abort();
    return this.cancelControllers = {}, this;
  }
  filter(e2, t2) {
    if (!t2) return e2;
    for (let s2 in t2) {
      let i2 = t2[s2];
      switch (typeof i2) {
        case "boolean":
        case "number":
          i2 = "" + i2;
          break;
        case "string":
          i2 = "'" + i2.replace(/'/g, "\\'") + "'";
          break;
        default:
          i2 = null === i2 ? "null" : i2 instanceof Date ? "'" + i2.toISOString().replace("T", " ") + "'" : "'" + JSON.stringify(i2).replace(/'/g, "\\'") + "'";
      }
      e2 = e2.replaceAll("{:" + s2 + "}", i2);
    }
    return e2;
  }
  getFileUrl(e2, t2, s2 = {}) {
    return this.files.getUrl(e2, t2, s2);
  }
  buildUrl(e2) {
    let t2 = this.baseUrl;
    return "undefined" == typeof window || !window.location || t2.startsWith("https://") || t2.startsWith("http://") || (t2 = window.location.origin?.endsWith("/") ? window.location.origin.substring(0, window.location.origin.length - 1) : window.location.origin || "", this.baseUrl.startsWith("/") || (t2 += window.location.pathname || "/", t2 += t2.endsWith("/") ? "" : "/"), t2 += this.baseUrl), e2 && (t2 += t2.endsWith("/") ? "" : "/", t2 += e2.startsWith("/") ? e2.substring(1) : e2), t2;
  }
  async send(e2, t2) {
    t2 = this.initSendOptions(e2, t2);
    let s2 = this.buildUrl(e2);
    if (this.beforeSend) {
      const e3 = Object.assign({}, await this.beforeSend(s2, t2));
      void 0 !== e3.url || void 0 !== e3.options ? (s2 = e3.url || s2, t2 = e3.options || t2) : Object.keys(e3).length && (t2 = e3, console?.warn && console.warn("Deprecated format of beforeSend return: please use `return { url, options }`, instead of `return options`."));
    }
    if (void 0 !== t2.query) {
      const e3 = this.serializeQueryParams(t2.query);
      e3 && (s2 += (s2.includes("?") ? "&" : "?") + e3), delete t2.query;
    }
    "application/json" == this.getHeader(t2.headers, "Content-Type") && t2.body && "string" != typeof t2.body && (t2.body = JSON.stringify(t2.body));
    return (t2.fetch || fetch)(s2, t2).then(async (e3) => {
      let t3 = {};
      try {
        t3 = await e3.json();
      } catch (e4) {
      }
      if (this.afterSend && (t3 = await this.afterSend(e3, t3)), e3.status >= 400) throw new ClientResponseError({ url: e3.url, status: e3.status, data: t3 });
      return t3;
    }).catch((e3) => {
      throw new ClientResponseError(e3);
    });
  }
  initSendOptions(e2, t2) {
    if ((t2 = Object.assign({ method: "GET" }, t2)).body = this.convertToFormDataIfNeeded(t2.body), normalizeUnknownQueryParams(t2), t2.query = Object.assign({}, t2.params, t2.query), void 0 === t2.requestKey && (false === t2.$autoCancel || false === t2.query.$autoCancel ? t2.requestKey = null : (t2.$cancelKey || t2.query.$cancelKey) && (t2.requestKey = t2.$cancelKey || t2.query.$cancelKey)), delete t2.$autoCancel, delete t2.query.$autoCancel, delete t2.$cancelKey, delete t2.query.$cancelKey, null !== this.getHeader(t2.headers, "Content-Type") || this.isFormData(t2.body) || (t2.headers = Object.assign({}, t2.headers, { "Content-Type": "application/json" })), null === this.getHeader(t2.headers, "Accept-Language") && (t2.headers = Object.assign({}, t2.headers, { "Accept-Language": this.lang })), this.authStore.token && null === this.getHeader(t2.headers, "Authorization") && (t2.headers = Object.assign({}, t2.headers, { Authorization: this.authStore.token })), this.enableAutoCancellation && null !== t2.requestKey) {
      const s2 = t2.requestKey || (t2.method || "GET") + e2;
      delete t2.requestKey, this.cancelRequest(s2);
      const i2 = new AbortController();
      this.cancelControllers[s2] = i2, t2.signal = i2.signal;
    }
    return t2;
  }
  convertToFormDataIfNeeded(e2) {
    if ("undefined" == typeof FormData || void 0 === e2 || "object" != typeof e2 || null === e2 || this.isFormData(e2) || !this.hasBlobField(e2)) return e2;
    const t2 = new FormData();
    for (const s2 in e2) {
      const i2 = e2[s2];
      if ("object" != typeof i2 || this.hasBlobField({ data: i2 })) {
        const e3 = Array.isArray(i2) ? i2 : [i2];
        for (let i3 of e3) t2.append(s2, i3);
      } else {
        let e3 = {};
        e3[s2] = i2, t2.append("@jsonPayload", JSON.stringify(e3));
      }
    }
    return t2;
  }
  hasBlobField(e2) {
    for (const t2 in e2) {
      const s2 = Array.isArray(e2[t2]) ? e2[t2] : [e2[t2]];
      for (const e3 of s2) if ("undefined" != typeof Blob && e3 instanceof Blob || "undefined" != typeof File && e3 instanceof File) return true;
    }
    return false;
  }
  getHeader(e2, t2) {
    e2 = e2 || {}, t2 = t2.toLowerCase();
    for (let s2 in e2) if (s2.toLowerCase() == t2) return e2[s2];
    return null;
  }
  isFormData(e2) {
    return e2 && ("FormData" === e2.constructor.name || "undefined" != typeof FormData && e2 instanceof FormData);
  }
  serializeQueryParams(e2) {
    const t2 = [];
    for (const s2 in e2) {
      if (null === e2[s2]) continue;
      const i2 = e2[s2], n2 = encodeURIComponent(s2);
      if (Array.isArray(i2)) for (const e3 of i2) t2.push(n2 + "=" + encodeURIComponent(e3));
      else i2 instanceof Date ? t2.push(n2 + "=" + encodeURIComponent(i2.toISOString())) : null !== typeof i2 && "object" == typeof i2 ? t2.push(n2 + "=" + encodeURIComponent(JSON.stringify(i2))) : t2.push(n2 + "=" + encodeURIComponent(i2));
    }
    return t2.join("&");
  }
};

// front/src/pages/OnboardingHome.js
var pb = new Client(window.location.origin);
var MHR = window.MHR;
var FV = window.FormValidator;
var gotoPage = MHR.gotoPage;
var goHome = MHR.goHome;
var storage = MHR.storage;
var myerror = MHR.storage.myerror;
var mylog = MHR.storage.mylog;
var html = MHR.html;
var cleanReload = MHR.cleanReload;
MHR.register("OnboardingHome", class extends MHR.AbstractPage {
  /**
   * @param {string} id
   */
  constructor(id) {
    super(id);
  }
  async enter() {
    var theHtml;
    gotoPage("OnboardingForm");
  }
});
MHR.register("LogoffPage", class extends MHR.AbstractPage {
  constructor(id) {
    super(id);
  }
  async enter() {
    console.log("AuthStore is valid:", pb.authStore.isValid);
    console.log(pb.authStore.model);
    var email, verified;
    if (pb.authStore.isValid) {
      email = pb.authStore.model.email;
      verified = pb.authStore.model.verified;
    }
    var theHtml = html`
        <ion-card>
            <ion-card-header>
                <ion-card-title>Confirm logoff</ion-card-title>
            </ion-card-header>
    
            <ion-card-content>
    
                <div class="ion-margin-top">
                <ion-text class="ion-margin-top">Please confirm logoff.</ion-text>
                </div>
    
            </ion-card-content>
    
            <div class="ion-margin-start ion-margin-bottom">
                <ion-button @click=${() => {
      pb.authStore.clear();
      MHR.cleanReload();
    }}>
                    ${T("Logoff")}
                </ion-button>
            </div>
    
        </ion-card>
        `;
    this.render(theHtml, false);
  }
});
MHR.register("OnboardingForm", class extends MHR.AbstractPage {
  constructor(id) {
    super(id);
  }
  async enter() {
    var theHtml = html`

  <!-- Header -->
  <div class="dome-header">
    <div class="dome-content">
      <div class="w3-bar">
        <div class="w3-bar-item padding-right-0">
          <a href="#">
            <img src="assets/logos/DOME_Icon_White.svg" alt="DOME Icon" style="width:100%;max-height:32px">
          </a>
        </div>
        <div class="w3-bar-item">
          <span class="blinker-semibold w3-xlarge nowrap">DOME MARKETPLACE</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Jumbo -->
  <div class="bg-cover" style="background-image: url(assets/images/bg_1_shadow.png);">
    <div class="dome-content w3-text-white">
      <div class="text-jumbo blinker-bold w3-padding-top-48">Information for</div>
      <div class="text-jumbo blinker-bold">Onboarding in DOME.</div>
      <p class="w3-xlarge">The Marketplace is a digital platform that enables CSPs to offer cloud and edge computing
        services to customers across Europe. The main goal of the onboarding process is the creation of an operating
        account for the CSPs from which they can operate within the Marketplace and start publishing their offerings.
      </p>
    </div>
    <div class="w3-padding-32"></div>
  </div>

  <div class="w3-padding-32" style="background-color: #EDF2FA;">

    <!-- Process structure -->
    <div class="w3-card-4 dome-content w3-round-large w3-white">
      <div class="w3-container">
        <h2>The process is structured in three main steps</h2>

        <div class="w3-row-padding">
          <div class="w3-third">
            <div class="parent">
              <div class="child padding-right-8">
                <span class="material-symbols-outlined dome-color w3-xxxlarge">
                  counter_1
                </span>
              </div>
              <div class="child padding-right-24">
                <p>Launching of the process and provision of company information and documentation</p>
              </div>
            </div>
          </div>
          <div class="w3-third">
            <div class="parent">
              <div class="child padding-right-8">
                <span class="material-symbols-outlined dome-color w3-xxxlarge">
                  counter_2
                </span>
              </div>
              <div class="child padding-right-24">
                <p>Verification of the company documentation and contract signature</p>
              </div>
            </div>

          </div>
          <div class="w3-third">
            <div class="parent">
              <div class="child padding-right-8">
                <span class="material-symbols-outlined dome-color w3-xxxlarge">
                  counter_3
                </span>
              </div>
              <div class="child padding-right-24">
                <p>Generation of the verifiable credential for the Legal Entity Appointed Representative (LEAR)</p>
              </div>
            </div>


          </div>
        </div>
        <h4>Upon the generation of the LEAR verifiable credential, the CSP account is fully operational.</h4>

      </div>

    </div>
  </div>

  <!-- Eligibility -->
  <div class="w3-panel dome-content">
    <h1>Eligibility Verification</h1>

    <div class="w3-row">
      <div class="w3-half">
        <p class="w3-large padding-right-large">Before launching the onboarding process, make sure that you meet the
          following criteria:</p>
      </div>
      <div class="w3-half">

        <div class="w3-cell-row w3-padding-16" style="border-bottom: 1px solid #ddd">
          <div class="w3-cell w3-cell-top padding-top-small padding-right-4">
            <span class="material-symbols-outlined dome-color">
              check_circle
            </span>
          </div>
          <div class="w3-cell w3-cell-top">
            <div class="w3-xlarge blinker-semibold">You are a legal entity duly registered in an EU country</div>
          </div>
        </div>

        <div class="w3-cell-row w3-padding-16">
          <div class="w3-cell w3-cell-middle padding-top-small padding-right-4">
            <span class="material-symbols-outlined dome-color">
              check_circle
            </span>
          </div>
          <div class="w3-cell w3-cell-middle">
            <div class="w3-xlarge blinker-semibold">You have the capability to offer cloud or edge services</div>
          </div>
        </div>


      </div>

    </div>
  </div>

  <div class="w3-padding-32" style="background-color: #EDF2FA;">

    <div class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom">

      <div class="parent">
        <div class="child">
          <div class="w3-panel">
            <h1>Filling Out Forms</h1>
            <p class="w3-large">
              In this page you will find a form with three sections. Fill in all the fields (all of them are required),
              making sure to use Latin characters.
            </p>
            <p class="w3-large">
              The information you enter in the forms will be used to generate two of the documents required for the
              onboarding process. The whole process is described in more detail in the DOME knowledge base: Company
              Onboarding Process. You can read the description in the knowledgebase and come back here whenever you
              want.
            </p>
            <p class="w3-large">
              The forms are below. Please, click the "Submit and create documents" after filling all the fields.
            </p class="w3-large">
            <p class="w3-large">
              For testing purposes, you can click the "Fill with test data" button to create and print documents with
              test data but with the final legal prose, so they can be reviewed by your legal department in advance of
              creating the real documents.</p>
            </p>
          </div>
        </div>
        <div class="">
          <img src="assets/images/form.png" alt="DOME Icon" style="max-width:450px">
        </div>
      </div>
    </div>


    <div class="dome-content">

      <form name="theform" id="formElements" class="w3-margin-bottom">
    
        <div class="card w3-card-2 w3-white">
    
          <div class="w3-container">
            <h1>Legal representative of the company</h1>
          </div>
    
          <div class="w3-row">
    
            <div class="w3-quarter w3-container">
              <p>We need information identifying the legal representative of the company who is going to sign the document.
              </p>
            </div>
    
            <div class="w3-rest w3-container">
    
              <div class="w3-panel w3-card-2  w3-light-grey">
    
                <p><label><b>First Name</b></label>
                  <input name="LegalRepFirstName" class="w3-input w3-border" type="text" placeholder="First name">
                </p>
    
    
                <p><label><b>Last Name</b></label>
                  <input name="LegalRepLastName" class="w3-input w3-border" type="text" placeholder="Last name">
                </p>
    
                <p><label><b>Nationality</b></label>
                  <input name="LegalRepNationality" class="w3-input w3-border" type="text" placeholder="Nationality">
                </p>
    
                <p><label><b>ID card number</b></label>
                  <input name="LegalRepIDNumber" class="w3-input w3-border" type="text" placeholder="ID card number">
                </p>
    
                <p><label><b>Email</b></label>
                  <input name="LegalRepEmail" class="w3-input w3-border" type="text" placeholder="Email">
                </p>
    
              </div>
            </div>
          </div>
        </div>
    
    
        <div class="card w3-card-2 w3-white">
    
          <div class="w3-container">
            <h1>Company information</h1>
          </div>
    
          <div class="w3-row">
    
            <div class="w3-quarter w3-container">
              <p>
                We also need information about the company so we can register it in DOME.
              </p>
              <p>
                Make sure that the name is the legal name of the company as found in the commercial registry or equivalent
                institution in your jurisdiction. The address must be that of the official place of incorporation of your
                company.
              </p>
              <p>
                We need the VAT number of your company because we use it as a unique identifier in our database. At this
                moment, this is not used to charge you anything. Whenever in the future we provide paid services to you, a
                specific authorisation will be requested, and you will have to adhere to new terms of contract.
              </p>
    
            </div>
    
            <div class="w3-rest w3-container">
    
              <div class="w3-panel w3-card-2  w3-light-grey">
    
                <p><label><b>Name</b></label>
                  <input name="CompanyName" class="w3-input w3-border" type="text" placeholder="Name">
                </p>
    
                <p><label><b>Street name and number</b></label>
                  <input name="CompanyStreetName" class="w3-input w3-border" type="text"
                    placeholder="Street name and number">
                </p>
    
                <p><label><b>City</b></label>
                  <input name="CompanyCity" class="w3-input w3-border" type="text" placeholder="City">
                </p>
    
                <p><label><b>Postal code</b></label>
                  <input name="CompanyPostal" class="w3-input w3-border" type="text" placeholder="Postal code">
                </p>
    
                <p><label><b>Country</b></label>
                  <input name="CompanyCountry" class="w3-input w3-border" type="text" placeholder="Country">
                </p>
    
                <p><label><b>VAT number</b></label>
                  <input name="CompanyVATID" class="w3-input w3-border" type="text" placeholder="VAT number">
                </p>
    
    
              </div>
            </div>
          </div>
    
        </div>
    
        <div class="card w3-card-2 w3-white">
    
          <div class="w3-container">
            <h1>Information about the LEAR</h1>
          </div>
    
          <div class="w3-row">
    
            <div class="w3-quarter w3-container">
              <p>
                This section identifies an employee of the company who will act as the LEAR.
              </p>
              <p>
                The LEAR is the Legal Entity Appointed Representative. Do not confuse with the Legal Representative, who has
                to appear in the official records in the commercial registry or equivalent institution in your jurisdiction.
                Instead, the LEAR can be any person who is authorised by a Legal Representative to interact with DOME and
                act on behalf of the company. There is specific information about the LEAR in the knowledge base.
              </p>
              <p>
                Of course, the Legal Representative can appoint him/herself as the LEAR for DOME, if this is what is
                suitable for you.
              </p>
            </div>
    
            <div class="w3-rest w3-container">
    
              <div class="w3-panel w3-card-2  w3-light-grey">
    
                <p><label><b>First name</b></label>
                  <input name="LEARFirstName" class="w3-input w3-border" type="text" placeholder="First name">
                </p>
    
                <p><label><b>Last name</b></label>
                  <input name="LEARLastName" class="w3-input w3-border" type="text" placeholder="Last name">
                </p>
    
                <p><label><b>Nationality</b></label>
                  <input name="LEARNationality" class="w3-input w3-border" type="text" placeholder="Nationality">
                </p>
    
                <p><label><b>ID card number</b></label>
                  <input name="LEARIDNumber" class="w3-input w3-border" type="text" placeholder="ID card number">
                </p>
    
                <p><label><b>Complete postal professional address</b></label>
                  <input name="LEARPostalAddress" class="w3-input w3-border" type="text" placeholder="Complete postal professional address">
                </p>
    
                <p><label><b>Email</b></label>
                  <input name="LEAREmail" class="w3-input w3-border" type="text" placeholder="Email">
                </p>
    
                <p><label><b>Mobile phone</b></label>
                  <input name="LEARMobilePhone" class="w3-input w3-border" type="text" placeholder="Mobile phone">
                </p>
    
    
              </div>
            </div>
          </div>
    
        </div>
    
        <div class="w3-bar w3-center">
          <button class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold" title="Submit and create documents">Submit and create documents</button>
          <button @click=${this.fillTestData} class="w3-btn dome-color border-2 w3-round-large w3-margin-left blinker-semibold">Fill with test data (only for
            testing)</button>
        </div>
    
      </form>

      <div class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom">
        <div class="w3-container">

          <p>
            Click the "<b>Submit and create documents</b>" button above to create the documents automatically including the data you entered.
          </p>
          <p>
            If you are not yet ready and want to see how the final documents look like, click the button "<b>Fill with test data</b>" and then the "<b>Submit and create documents</b>" button to create the documents with test data.
          </p>
  
        </div>

      </div>

    
    </div>
    
  </div>

`;
    this.render(theHtml, false);
    var validations = [
      {
        name: "LegalRepFirstName",
        display: "required",
        rules: "required"
      },
      {
        name: "LegalRepLastName",
        display: "required",
        rules: "required"
      },
      {
        name: "LegalRepNationality",
        display: "required",
        rules: "required"
      },
      {
        name: "LegalRepIDNumber",
        display: "required",
        rules: "required"
      },
      {
        name: "LegalRepEmail",
        display: "required",
        rules: "required"
      },
      {
        name: "CompanyName",
        display: "required",
        rules: "required"
      },
      {
        name: "CompanyStreetName",
        display: "required",
        rules: "required"
      },
      {
        name: "CompanyCity",
        display: "required",
        rules: "required"
      },
      {
        name: "CompanyPostal",
        display: "required",
        rules: "required"
      },
      {
        name: "CompanyCountry",
        display: "required",
        rules: "required"
      },
      {
        name: "CompanyVATID",
        display: "required",
        rules: "required"
      },
      {
        name: "LEARFirstName",
        display: "required",
        rules: "required"
      },
      {
        name: "LEARLastName",
        display: "required",
        rules: "required"
      },
      {
        name: "LEARNationality",
        display: "required",
        rules: "required"
      },
      {
        name: "LEARIDNumber",
        display: "required",
        rules: "required"
      },
      {
        name: "LEARPostalAddress",
        display: "required",
        rules: "required"
      },
      {
        name: "LEAREmail",
        display: "required",
        rules: "required"
      },
      {
        name: "LEARMobilePhone",
        display: "required",
        rules: "required"
      }
    ];
    var validator = new FV(
      "theform",
      validations,
      this.createDocument
    );
  }
  async fillTestData(ev) {
    ev.preventDefault();
    document.forms["theform"].elements["LegalRepFirstName"].value = "Jesus";
    document.forms["theform"].elements["LegalRepLastName"].value = "Ruiz";
    document.forms["theform"].elements["LegalRepNationality"].value = "Spanish";
    document.forms["theform"].elements["LegalRepIDNumber"].value = "24676932R";
    document.forms["theform"].elements["LegalRepEmail"].value = "jr@airquality.com";
    document.forms["theform"].elements["CompanyName"].value = "Air Quality Cloud";
    document.forms["theform"].elements["CompanyStreetName"].value = "C/ Academia 54";
    document.forms["theform"].elements["CompanyCity"].value = "Madrid";
    document.forms["theform"].elements["CompanyPostal"].value = "28654";
    document.forms["theform"].elements["CompanyCountry"].value = "Spain";
    document.forms["theform"].elements["CompanyVATID"].value = "B35664875";
    document.forms["theform"].elements["LEARFirstName"].value = "John";
    document.forms["theform"].elements["LEARLastName"].value = "Doe";
    document.forms["theform"].elements["LEARNationality"].value = "Spanish";
    document.forms["theform"].elements["LEARIDNumber"].value = "56332876F";
    document.forms["theform"].elements["LEARPostalAddress"].value = "C/ Academia 54, Madrid - 28654, Spain";
    document.forms["theform"].elements["LEAREmail"].value = "john.doe@airquality.com";
    document.forms["theform"].elements["LEARMobilePhone"].value = "+34876549022";
  }
  async createDocument(errors, ev) {
    ev.preventDefault();
    var form = {};
    any("form input").classRemove("w3-lightred");
    any("form input").run((el2) => {
      if (el2.value.length > 0) {
        form[el2.name] = el2.value;
      } else {
        form[el2.name] = "[" + el2.name + "]";
      }
    });
    console.log(form);
    if (errors.length > 0) {
      for (var i2 = 0, errorLength = errors.length; i2 < errorLength; i2++) {
        var el = errors[i2].element;
        console.log(el);
        me(el).classAdd("w3-lightred");
      }
      return;
    }
    gotoPage("OnboardingDocument", form);
  }
});
MHR.register("OnboardingDocument", class extends MHR.AbstractPage {
  constructor(id) {
    super(id);
  }
  /**
   * @param {Object} form
   */
  async enter(form) {
    console.log("AuthStore is valid:", pb.authStore.isValid);
    console.log(pb.authStore.model);
    var email, verified;
    if (pb.authStore.isValid) {
      email = pb.authStore.model.email;
      verified = pb.authStore.model.verified;
    }
    const today = /* @__PURE__ */ new Date();
    var theHtml = html`

<div class="onlyscreen">
  <!-- Header -->
  <div class="dome-header">
    <div class="dome-content">
      <div class="w3-bar">
        <div class="w3-bar-item padding-right-0">
          <a href="#">
            <img src="assets/logos/DOME_Icon_White.svg" alt="DOME Icon" style="width:100%;max-height:32px">
          </a>
        </div>
        <div class="w3-bar-item">
          <span class="blinker-semibold w3-xlarge nowrap">DOME MARKETPLACE</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Jumbo -->
  <div class="bg-cover" style="background-image: url(assets/images/bg_1_shadow.png);">
    <div class="dome-content w3-text-white">
      <div class="text-jumbo blinker-bold w3-padding-top-48">Prefilled Onboarding documents</div>
      <p class="w3-xlarge">The documents below have to be sent to <b>onboarding@dome-marketplace.eu</b> duly signed.
      </p>
    </div>
    <div class="w3-padding-16"></div>
  </div>

</div>

<div class="dome-content forprint">

<!-- DOH -->
<div id="doh" class="document w3-panel w3-card-2">

  <div class="w3-bar">
    <div class="w3-bar-item">DOME DoH for CSP</div>
    <div class="w3-bar-item w3-right">version October 2024</div>
  </div>

  <div class="w3-center">
    <h3>DOME DECLARATION OF HONOR</h3>
  </div>

  <p>Date: ${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}</p>

  <p>
    I, the undersigned, 
  </p>

  <table class="dometable">
    <tr>
      <td>Name</td>
      <td><b>${form.LegalRepFirstName}</b></td>
    </tr>
    <tr>
      <td>Surname</td>
      <td><b>${form.LegalRepLastName}</b></td>
    </tr>
    <tr>
      <td>ID card number</td>
      <td><b>${form.LegalRepIDNumber}</b></td>
    </tr>
    <tr>
      <td>Country</td>
      <td><b>${form.LegalRepNationality}</b></td>
    </tr>
    <tr>
      <td>Email</td>
      <td><b>${form.LegalRepEmail}</b></td>
    </tr>
  </table>

  <p>acting for and on behalf of</p>

  <table class="dometable">
    <tr>
      <td>Entity full legal name</td>
      <td><b>${form.CompanyName}</b></td>
    </tr>
    <tr>
      <td>Registered office full address</td>
      <td>
        <div><b>${form.CompanyStreetName}</b></div>
        <div><b>${form.CompanyCity} - ${form.CompanyPostal}</b></div>
      </td>
    </tr>
    <tr>
      <td>Country of incorporation</td>
      <td><b>${form.CompanyCountry}</b></td>
    </tr>
    <tr>
      <td>Tax ID number</td>
      <td><b>${form.CompanyVATID}</b></td>
    </tr>
  </table>

  <p>(hereinafter, the Company)</p>

  <div class="w3-center">
    <p>
    do hereby confirm:
  </p>
  </div>

  <p>that:</p>

  <ol>
    <li>
      The address above is correct and that I am reachable there
    </li>
    <li>
      The information we have provided for the Company in the context of onboarding Company on the DOME Marketplace is correct and updated
    </li>
    <li>
      That my powers of representation of the Company are in full force an effect on the date of this declaration and that of the appointment of the LEAR of Company
    </li>
    <li>
      That my powers of representation of the Company are not limited in whichever fashion
    </li>
    <li>
      That the Company is an actual, existing and operating entity
    </li>
    <li>
      That Company is not bankrupt, being wound up, having the affairs administered by the courts, entered into an arrangement with creditors, suspended business activities or subject to any other similar proceedings or procedures
    </li>
  </ol>

  <div class="signature">
    <p>
      In witness whereof, I sign this present declaration on behalf of Company on the date above.
    </p>

    <div class="w3-row">
      <div class="w3-half w3-container w3-border" style="padding-top:5px;padding-bottom:100px;padding-left:16px">
        <div>For and on behalf of Company</div>
      </div>
    </div>
    <div>
      <p style="overflow-wrap: anywhere;">Signed: Mr./Mrs. ${form.LegalRepFirstName} ${form.LegalRepLastName}</p>
    </div>

  </div>
</div>

<div id="learappointment" class="document">

<div class="pagebreak onlyscreen"></div>

${await this.createLEARDocument(form)}

</div>

<div class="onlyscreen">

<div class="w3-bar w3-center">
    <button class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold" @click=${() => this.printDocument("#doh")}>Print Declaration of Honour</button>
    <button class="w3-btn dome-bgcolor w3-round-large w3-margin-right blinker-semibold" @click=${() => this.printDocument("#learappointment")}>Print LEAR appointment</button>
</div>


<div class="dome-content">
<p>
    Click each of the buttons above to start printing the documents. If you want to electronically sign PDFs, you can "print to PDF" to save the documents in your disk and then sign them with whatever program you use for signing (e.g., Acrobat Reader).
</p>
</div>

<div class="card w3-card-4 dome-content w3-round-large dome-bgcolor w3-margin-bottom">
<div class="w3-container">

<h2>Next steps</h2>

<p>To complete the onboarding process in DOME, you will have to submit some documentation to <a href="mailto:onboarding@dome-marketplace.org">onboarding@dome-marketplace.org</a>.
</p>
<p>
    The amount of documents to submit will depend on whether your company is able to electronically sign documents or not.
</p>
<p>
    <b>If your company has a valid qualified Digital Certificate</b> in the sense of the eIDAS Regulation, the two documents generated above are the only ones that you have to submit for the onboarding process in DOME:
</p>

<ul>
    <li>Declaration of Honor Form: Completed and signed using the qualified Digital Certificate of the company.
    </li>

    <li>
        Appointment of the Legal Entity Appointed Representative (LEAR) Form: Completed and signed using the qualified Digital Certificate of the company.
    </li>
</ul>

<p>
    <b>If your company is not able to electronically sign documents</b>, you have to submit additional documents, <b>in addition to the two described above</b>. Please, see the whole description of the onboarding process in the DOME knowledgebase: <a href="https://knowledgebase.dome-marketplace-prd.org/shelves/company-onboarding-process">Company Onboarding Process</a>.
</p>

</div>

</div>



<div class="w3-padding-48"></div>

</div>
</div>
`;
    this.render(theHtml, false);
  }
  /**
   * @param {string} identifier
   */
  printDocument(identifier) {
    any(".document").classAdd("onlyscreen");
    me(identifier).classRemove("onlyscreen");
    print();
    any(".document").classRemove("onlyscreen");
  }
  /**
   * @param {Object} form
   */
  async createLEARDocument(form) {
    const today = /* @__PURE__ */ new Date();
    var theHtml = html`

        <div class="w3-panel w3-card-2">
        
          <div class="w3-bar">
            <div class="w3-bar-item">DOME LEAR appointment form</div>
            <div class="w3-bar-item w3-right">version October 2024</div>
          </div>
        
          <div class="w3-center">
            <h3>APPOINTMENT OF LEGAL ENTITY APPOINTED REPRESENTATIVE FORM</h3>
          </div>
        

          <div style="padding:8px;margin-bottom: 16px;border: 1px solid">

            <p>Before designating the Legal Entity Appointed Representative, please, read carefully all
              the document. It gives a detailed overview of the implications of designating a LEAR
              and the acts a LEAR can perform on behalf of your entity.
            </p>
            <p>
              Should you have any questions regarding the process or any other topic concerning the LEAR and the verifiable credentials generated by the Marketplace, please contact us at legal.helpdesk@dome-markeplace.org.
            </p>
            <p>
              You may also wish to read the Practical Considerations for Entities on the appointment of Legal Entity Appointed Representative Form where you can find some useful additional information.
            </p>

          </div>

          <div style="padding:8px;border: 1px solid">

            <p>
              <b>NOTE</b>: you must only modify the fields where the input of specific information is needed. Should you modify any other section, sentence or portion of the document, your onboarding request may not be approved.
            </p>

          </div>
          

        
          <h3>LEAR APPOINTMENT FORM</h3>
          <p>Date: ${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}</p>
        
          <p>Subject: designation of legal entity appointed representative (LEAR) in DOME Marketplace</p>
        
          <p>
            I, the undersigned, 
          </p>
        
          <table class="dometable">
            <tr>
              <td>Name</td>
              <td><b>${form.LegalRepFirstName}</b></td>
            </tr>
            <tr>
              <td>Surname</td>
              <td><b>${form.LegalRepLastName}</b></td>
            </tr>
            <tr>
              <td>ID card number</td>
              <td><b>${form.LegalRepIDNumber}</b></td>
            </tr>
            <tr>
              <td>Country</td>
              <td><b>${form.LegalRepNationality}</b></td>
            </tr>
            <tr>
              <td>Email</td>
              <td><b>${form.LegalRepEmail}</b></td>
            </tr>
          </table>
        
          <p>acting, as legal representative, for and on behalf of:</p>
        
          <table class="dometable">
            <tr>
              <td>Entity full legal name</td>
              <td><b>${form.CompanyName}</b></td>
            </tr>
            <tr>
              <td>Registered office full address</td>
              <td>
                <div><b>${form.CompanyStreetName}</b></div>
                <div><b>${form.CompanyCity} - ${form.CompanyPostal}</b></div>
              </td>
            </tr>
            <tr>
              <td>Country of incorporation<sup>1</sup></td>
              <td><b>${form.CompanyCountry}</b></td>
            </tr>
            <tr>
              <td>Tax ID number</td>
              <td><b>${form.CompanyVATID}</b></td>
            </tr>
          </table>

          <p><sup>1</sup>For designating the country of incorporation, please use the two-letter country code. You can find such code <a href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Glossary:Country_codes" target="_blank">here</a>.</p>
        
          <p>(hereinafter, the Company)</p>
        
          <p>after having read and understood the information below concerning the designation and the powers of a LEAR within the DOME Marketplace, do hereby designate as the LEAR of Company:</p>

          <table class="dometable">
            <tr>
              <td>Name</td>
              <td><b>${form.LEARFirstName}</b></td>
            </tr>
            <tr>
              <td>Surname</td>
              <td><b>${form.LEARLastName}</b></td>
            </tr>
            <tr>
              <td>ID card number</td>
              <td><b>${form.LEARIDNumber}</b></td>
            </tr>
            <tr>
              <td>Complete postal professional address</td>
              <td><b>${form.LEARPostalAddress}</b></td>
            </tr>
            <tr>
              <td>Email</td>
              <td><b>${form.LEAREmail}</b></td>
            </tr>
          </table>


        
          <h3>ROLE AND POWERS OF THE LEAR</h3>
        
          <p>
            The Legal Entity Appointed Representative (hereinafter, the LEAR) is the person that any entity willing to onboard on the DOME Marketplace (hereinafter, the Marketplace) must designate to act, within the scope of the operation of the Marketplace, as the representative of the entity.
          </p>
        
          <p>
            Designating a LEAR is the first step of the onboarding process of the Marketplace.
          </p>
        
          <p>
            The LEAR will be responsible for providing and checking that all the information concerning the entity is accurate and remains up to date at any time.
          </p>
        
          <p>
            The LEAR must have all the capacity and powers to legally represent and bind your entity she/he represents for:
          </p>
        
        
          <ul>
            <li>
              Signing contracts on behalf of the Company for the sale or lease of the entity’s products and services of whatever nature;
            </li>
        
            <li>
              Signing contracts on behalf of the Company for the purchase of goods and services of whatever nature from third parties;
            </li>
        
            <li>
              Represent the Company before any other third party, be it an individual, a private entity or any public entity or public authority in any kind of proceedings, regardless of their nature (e.g., informal complaints, arbitration proceedings, jurisdictional proceedings, mediation, negotiation, administrative proceedings, etc.), either as claimant or defendant or interested party or otherwise;
            </li>
        
            <li>
              Accept payments in whichever form on behalf of the Company;
            </li>
        
            <li>
              Order payments on behalf of the Company;
            </li>
        
            <li>
              Make declarations on behalf of the entity, including the submission of offers or proposals (e.g., making a description of cloud or edge services in the Marketplace);
            </li>
        
            <li>
              Settling any complaint, claim or dispute on behalf of the Company;
            </li>
        
            <li>
              Delegate any of those faculties to other individuals.
            </li>
        
          </ul>
        
          <p>
            Once the LEAR is correctly registered in the Marketplace, the system will generate for her/him a verifiable credential that univocally identifies the LEAR within the Marketplace and enables her/him to digitally sign documents and perform some actions in a secure and non-repudiable fashion vis-à-vis the Marketplace.
          </p>
        
          <p>
            The LEAR will be entitled to delegate some of its faculties to other individuals, who will normally belong to your Company’s organisation. Those delegated persons will also have verifiable credentials enabling them to act within the Marketplace on behalf of your Company within the scope of the delegation. The delegated persons shall not be entitled to further delegate any of their powers and/or faculties.
          </p>
        
          <p>
            The Company shall be bound by any act or omission performed by the LEAR or the delegated representatives.
          </p>
        
          <p>
            The contract with the Marketplace must be signed either by the LEAR or by the legal representative of the Company.
          </p>
        
          <p>
            The appointment of the LEAR is indefinite in time. Nonetheless, the Company can change its LEAR at any moment. Any acts, actions or omissions performed by the former LEAR will still be valid and binding on the Company represented by the LEAR.
          </p>

          <p>
            A single Company can appoint more than one LEAR at the same time.
          </p>
        
          <p>
            It is the responsibility of the Company to revoke the designation of an individual as LEAR or as a delegated individual vested with powers to legally bind the entity within the scope of operation of the Marketplace once the Company does not wish to be represented within the Marketplace by such individuals.
          </p>

          <p>
            The LEAR(s) of the Company are the people who will have to manage the delegation and revocation of powers to Account Operators.
          </p>

          <p>
            There can be a delay between the decision to revoke the representation powers of a LEAR and its actual cancellation in the system. Therefore, in the meantime, when revoking the appointment of a LEAR, the Company should take internal steps to control that the LEAR cannot perform any action that may cause any prejudice to your Company or adversely.
          </p>

          <hr/>


        
          <div class="signature">
            <p>
              In witness whereof I sign this appointment letter on the date set at the beginning of the letter.
            </p>
        
            <div class="w3-cell-row">
              <div class="w3-container w3-cell w3-border" style="width:50%">
        
                <div>For and on behalf of Company</div>
        
                <div class="w3-container" style="padding-bottom:100px;"></div>
        
              </div>
        
              <div class="w3-container w3-cell w3-border" style="width:50%">
                <div>Acceptance of the appointment by the LEAR</div>
        
                <div class="w3-container" style="padding-bottom:100px;"></div>
        
              </div>
        
            </div>
        
            <div class="w3-cell-row">
              <div class="w3-container w3-cell" style="width:50%">
        
                <div>
                  <p style="overflow-wrap: anywhere;">Signed: Mr./Mrs. ${form.LegalRepFirstName} ${form.LegalRepLastName}</p>
                </div>
        
              </div>
        
              <div class="w3-container w3-cell" style="width:50%">
        
                <div>
                  <p style="overflow-wrap: anywhere;">Accepted and signed: Mr./Mrs. ${form.LEARFirstName} ${form.LEARLastName}</p>
                </div>
        
              </div>
        
            </div>
        
          </div>
        </div>
        `;
    return theHtml;
  }
});