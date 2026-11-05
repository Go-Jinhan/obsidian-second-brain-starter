import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { Bundle, VaultPort, validateRoot, prepareBundle, planInstallation, installBundle, createNote, noteContent, noteTitle } from '../src/core';

class MemoryVault implements VaultPort {
  entries = new Map<string, string | ArrayBuffer | null>();
  writes = 0;
  kind(path: string): 'file' | 'folder' | null { return !this.entries.has(path) ? null : this.entries.get(path) === null ? 'folder' : 'file'; }
  async mkdir(path: string) { assert.equal(this.kind(path), null); this.entries.set(path, null); }
  async write(path: string, text: string) { assert.equal(this.kind(path), null); this.entries.set(path, text); this.writes++; }
  async writeBinary(path: string, bytes: ArrayBuffer) { assert.equal(this.kind(path), null); this.entries.set(path, bytes); this.writes++; }
}

const bundle: Bundle = JSON.parse(fs.readFileSync(new URL('../src/bundle.json', import.meta.url), 'utf8'));
const front = (text: string) => YAML.parse(text.split('---')[1]);

test('reject paths outside the vault and hidden/configuration paths', () => {
  for (const value of ['../Other', '/tmp/data', 'A/../B', '.obsidian', 'A/.git', 'C:\\Users', 'A//B', 'A/ B', 'CON', 'A.', 'A#B', 'A[B]', 'A`B', 'A^B']) assert.throws(() => validateRoot(value));
  assert.equal(validateRoot(''), '');
  assert.equal(validateRoot('Second Brain/Notes'), 'Second Brain/Notes');
});

test('the bundle contains both languages, all guides, optional templates and one banner', () => {
  assert.equal(bundle.files.length, 57);
  assert.equal(bundle.files.filter(f => /\/_.*\.en\.md$/.test(f.path)).length, 17);
  assert.equal(bundle.files.filter(f => f.path.endsWith('.png')).length, 1);
  for (const file of bundle.files) {
    assert(!file.path.split('/').some(p => p.startsWith('.')));
    assert(!/[\u1100-\u11ff\uac00-\ud7af]/.test(file.path));
    if (file.text) assert(!/\/Users\/|ghp_[A-Za-z0-9]{20}|BEGIN .*PRIVATE KEY/.test(file.text));
  }
});

for (const root of ['', 'Second Brain', 'Projects/My Brain', '20. Organize/Workspace']) {
  test(`install and repeat without overwriting in ${root || 'vault root'}`, async () => {
    const vault = new MemoryVault();
    const prepared = prepareBundle(bundle, root);
    const result = await installBundle(vault, prepared);
    assert.equal(result.created, 57);
    const welcome = root ? root+'/Welcome.md' : 'Welcome.md';
    vault.entries.set(welcome, 'My edited welcome');
    const repeated = await installBundle(vault, prepared);
    assert.equal(repeated.created, 0);
    assert.equal(repeated.skipped, 57);
    assert.equal(vault.entries.get(welcome), 'My edited welcome');
    assert.equal(vault.writes, 57);
  });
  test(`resolve every internal link and template destination in ${root || 'vault root'}`, () => {
    const prepared = prepareBundle(bundle, root);
    const allPaths = new Set(prepared.files.map(f => f.path));
    for (const file of prepared.files) {
      if (!file.text) continue;
      for (const match of file.text.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]*)?\]\]/g)) assert(allPaths.has(match[1]+'.md'), `${file.path}: ${match[1]}`);
      for (const match of file.text.matchAll(/!?\[[^\]\n]*\]\((?:<([^>]+)>|([^\s)]+))\)/g)) {
        const target = match[1] || match[2];
        if (/^(https?:|#)/.test(target)) continue;
        assert(allPaths.has(path.posix.join(path.posix.dirname(file.path), target)), `${file.path}: ${target}`);
      }
      if (file.path.endsWith('TPL - Basic Note.md') || file.path.endsWith('TPL - Basic Note.en.md')) {
        for (const match of file.text.matchAll(/targetFolderPath = "([^"]+)"/g)) assert(prepared.folders.includes(match[1]), match[1]);
      }
    }
  });
}

test('a file blocking a required folder prevents any installation writes', async () => {
  const vault = new MemoryVault();
  vault.entries.set('Second Brain/20. Organize', 'Keep me');
  const prepared = prepareBundle(bundle, 'Second Brain');
  assert(planInstallation(vault, prepared).blocked.length > 0);
  await assert.rejects(installBundle(vault, prepared));
  assert.equal(vault.writes, 0);
  assert.equal(vault.entries.size, 1);
});

test('a folder blocking a destination file is caught before writes', async () => {
  const vault = new MemoryVault();
  vault.entries.set('Second Brain/Welcome.md', null);
  await assert.rejects(installBundle(vault, prepareBundle(bundle, 'Second Brain')));
  assert.equal(vault.writes, 0);
});

test('files created after preview are skipped', async () => {
  const vault = new MemoryVault();
  const prepared = prepareBundle(bundle, 'Second Brain');
  const preview = planInstallation(vault, prepared);
  assert.equal(preview.missing.length, 57);
  vault.entries.set('Second Brain/Welcome.md', 'Concurrent user note');
  assert.equal((await installBundle(vault, prepared)).skipped, 1);
  assert.equal(vault.entries.get('Second Brain/Welcome.md'), 'Concurrent user note');
});

test('an interrupted installation can resume while preserving completed files', async () => {
  const vault = new MemoryVault();
  const prepared = prepareBundle(bundle, 'Second Brain');
  const original = vault.write.bind(vault);
  vault.write = async (p, t) => { if (vault.writes === 3) throw new Error('Simulated disk error'); await original(p, t); };
  await assert.rejects(installBundle(vault, prepared));
  assert.equal(vault.writes, 3);
  vault.write = original;
  const result = await installBundle(vault, prepared);
  assert.equal(result.created, 54);
  assert.equal(result.skipped, 3);
});

for (const language of ['en', 'ko'] as const) {
  for (const type of ['Idea', 'Reference', 'Book', 'Project', 'Permanent'] as const) {
    test(`create ${language} ${type} with valid properties and a collision-safe name`, async () => {
      const vault = new MemoryVault();
      const title = 'A "title": with / punctuation';
      const source = 'A "quoted" source\nwith another line';
      const first = await createNote(vault, 'Second Brain', type, title, source, language, '2026-11-06 15:30');
      const second = await createNote(vault, 'Second Brain', type, title, source, language, '2026-11-06 15:30');
      assert.notEqual(first, second);
      assert(second.endsWith('(2).md'));
      const text = vault.entries.get(first) as string;
      const fm = front(text);
      assert.equal(fm.type, type);
      assert.deepEqual(fm.source, [source]);
      assert(!text.includes('<%'));
      if (type === 'Project') for (const label of ['Twyla Tharp First Memo', 'Project Progress', 'The Hemingway Bridge']) assert(text.includes(label));
      if (type === 'Book') assert(first.includes('📚501. Books/📓B-'));
      if (type === 'Permanent') assert(first.includes('31. Zettelkasten-PermanentNotes/'));
    });
  }
}

test('invalid note titles never create files', async () => {
  for (const title of ['', '   ', '..', '.obsidian', 'CON', 'a'.repeat(121)]) assert.throws(() => noteTitle(title));
  const vault = new MemoryVault();
  await assert.rejects(createNote(vault, '../Bad', 'Idea', 'Test', '', 'en', '2026-11-06 15:30'));
  assert.equal(vault.entries.size, 0);
  assert.deepEqual(front(noteContent('Reference', 'Test', '', 'en', '2026-11-06 15:30')).source, []);
});
