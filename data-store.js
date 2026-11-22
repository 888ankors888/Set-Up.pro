(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SetUpDataStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const KEY = 'nt1';
  class StoreError extends Error {
    constructor(code) { super(code); this.name = 'StoreError'; this.code = code; }
  }
  const fail = code => { throw new StoreError(code); };
  function assertJSON(value, seen = new Set()) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
    if (typeof value === 'number') { if (!Number.isFinite(value)) fail('INVALID_JSON'); return; }
    if (typeof value !== 'object' || seen.has(value)) fail('INVALID_JSON');
    const proto = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && proto !== Object.prototype && proto !== null) fail('INVALID_JSON');
    if (Object.getOwnPropertySymbols(value).length) fail('INVALID_JSON');
    if (Object.getOwnPropertyNames(value).some(key => !(Array.isArray(value) && key === 'length') &&
        !Object.getOwnPropertyDescriptor(value, key).enumerable)) fail('INVALID_JSON');
    if (Array.isArray(value) && (Object.keys(value).length !== value.length ||
        Object.keys(value).some(key => !/^(0|[1-9]\d*)$/.test(key) || Number(key) >= value.length))) fail('INVALID_JSON');
    seen.add(value);
    for (const key of Object.keys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) fail('INVALID_JSON');
      assertJSON(descriptor.value, seen);
    }
    seen.delete(value);
  }
  function clone(value) { assertJSON(value); return JSON.parse(JSON.stringify(value)); }
  function createStore({storage, validate} = {}) {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') fail('STORAGE_REQUIRED');
    if (typeof validate !== 'function') fail('VALIDATOR_REQUIRED');
    const listeners = new Set();
    let notifying = false;
    function getRaw() {
      try { return storage.getItem(KEY); } catch (_) { fail('READ_FAILED'); }
    }
    function checked(state) {
      const next = clone(state);
      if (!next || typeof next !== 'object' || Array.isArray(next)) fail('INVALID_STATE');
      let result;
      try { result = validate(next); } catch (_) { fail('VALIDATION_FAILED'); }
      if (result === false || (result && typeof result.then === 'function')) fail('VALIDATION_FAILED');
      assertJSON(next);
      return next;
    }
    function decode(raw) {
      if (raw === null) return {raw: null, state: null};
      if (typeof raw !== 'string') fail('READ_FAILED');
      let value;
      try { value = JSON.parse(raw); } catch (_) { fail('CORRUPT_JSON'); }
      return {raw, state: checked(value)};
    }
    function read() { return decode(getRaw()); }
    function notify(snapshot, source) {
      let listenerErrors = 0;
      notifying = true;
      try {
        for (const listener of [...listeners]) {
          try { listener({raw: snapshot.raw, state: clone(snapshot.state), source}); }
          catch (_) { listenerErrors++; }
        }
      } finally { notifying = false; }
      return listenerErrors;
    }
    function commit(state, snapshot) {
      if (notifying) fail('REENTRANT_WRITE');
      if (!snapshot || !Object.prototype.hasOwnProperty.call(snapshot, 'raw') ||
          !(snapshot.raw === null || typeof snapshot.raw === 'string')) fail('SNAPSHOT_REQUIRED');
      const next = checked(state), serialized = JSON.stringify(next);
      const current = read();
      if (current.raw !== snapshot.raw) fail('CONFLICT');
      try { storage.setItem(KEY, serialized); } catch (_) { fail('WRITE_FAILED'); }
      const result = {raw: serialized, state: clone(next)};
      result.listenerErrors = notify(result, 'local');
      return result;
    }
    function update(change) {
      if (typeof change !== 'function') fail('CHANGE_REQUIRED');
      const before = read();
      if (before.state === null) fail('NOT_INITIALIZED');
      const draft = clone(before.state), result = change(draft);
      if (result !== undefined) fail('SYNC_MUTATOR_REQUIRED');
      return commit(draft, before);
    }
    function subscribe(listener) {
      if (typeof listener !== 'function') fail('LISTENER_REQUIRED');
      listeners.add(listener); return () => listeners.delete(listener);
    }
    function attachStorageEvents(target) {
      if (!target || typeof target.addEventListener !== 'function' || typeof target.removeEventListener !== 'function') fail('EVENT_TARGET_REQUIRED');
      const handler = event => {
        if (event.key !== KEY && event.key !== null) return;
        if (event.storageArea && event.storageArea !== storage) return;
        const snapshot = read();
        notify(snapshot, 'external');
      };
      target.addEventListener('storage', handler);
      return () => target.removeEventListener('storage', handler);
    }
    return Object.freeze({read, commit, update, subscribe, attachStorageEvents});
  }
  return Object.freeze({KEY, StoreError, createStore});
});
