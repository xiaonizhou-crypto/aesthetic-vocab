const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

for (const [repo, legacyKey] of [['aesthetic-vocab', 'gk']]) {
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  const start = html.indexOf('// Credentials remain');
  const end = html.indexOf("keyInput.addEventListener('keydown'", start);
  const code = html.slice(start, html.indexOf('\n', end));

  function page({ blockedStorage = false } = {}) {
    const local = new Map([[legacyKey, 'old-test-key']]);
    const session = new Map([[legacyKey, 'old-test-key']]);
    const input = { value: '', focus() {}, addEventListener() {} };
    const hidden = new Set();
    const bar = { classList: { add: name => hidden.add(name), remove: name => hidden.delete(name) } };
    const events = {};
    function storage(map) {
      return {
        getItem() { throw new Error('keys must never be restored'); },
        setItem() { throw new Error('keys must never be persisted'); },
        removeItem(key) { if (blockedStorage) throw new Error('storage disabled'); map.delete(key); },
      };
    }
    const context = vm.createContext({
      localStorage: storage(local), sessionStorage: storage(session),
      window: { addEventListener(name, callback) { events[name] = callback; } },
      document: { getElementById: id => id === 'key-bar' ? bar : input },
    });
    vm.runInContext(code, context);
    return { local, session, input, hidden, events, context, readKey: () => vm.runInContext('apiKey', context) };
  }

  test(`${repo}: old saved keys are removed without restoring them`, () => {
    const p = page();
    assert.equal(p.local.has(legacyKey), false);
    assert.equal(p.session.has(legacyKey), false);
    assert.equal(p.readKey(), '');
  });

  test(`${repo}: save uses page memory, clears the input, and clear/exit erases the current key`, () => {
    const p = page();
    p.input.value = '  fake-key-for-regression-test  ';
    vm.runInContext('saveKey()', p.context);
    assert.equal(p.readKey(), 'fake-key-for-regression-test');
    assert.equal(p.input.value, '');
    assert.equal(p.hidden.has('gone'), true);
    vm.runInContext('clearKey()', p.context);
    assert.equal(p.readKey(), '');
    assert.equal(p.hidden.has('gone'), false);
    p.input.value = 'another-fake-key';
    vm.runInContext('saveKey()', p.context);
    p.events.pagehide();
    assert.equal(p.readKey(), '');
  });

  test(`${repo}: blocked browser storage does not break key entry`, () => {
    const p = page({ blockedStorage: true });
    p.input.value = 'fake-key';
    vm.runInContext('saveKey()', p.context);
    assert.equal(p.readKey(), 'fake-key');
    vm.runInContext('clearKey()', p.context);
    assert.equal(p.readKey(), '');
  });

  test(`${repo}: empty input cannot dismiss the key prompt`, () => {
    const p = page();
    p.input.value = '   ';
    vm.runInContext('saveKey()', p.context);
    assert.equal(p.readKey(), '');
    assert.equal(p.hidden.has('gone'), false);
  });

  test(`${repo}: every Gemini request uses a header, without a key in its URL`, () => {
    assert.equal(html.includes('?key=${apiKey}'), false);
    const calls = html.match(/fetch\(\s*`https:\/\/generativelanguage\.googleapis\.com[\s\S]*?headers:\s*\{[^}]+\}/g);
    assert.ok(calls?.length);
    for (const call of calls) assert.match(call, /['"]x-goog-api-key['"]\s*:\s*apiKey/);
    assert.doesNotMatch(html, /onclick="[^"]*\$\{esc\(item\.english\)/);
  });
}
