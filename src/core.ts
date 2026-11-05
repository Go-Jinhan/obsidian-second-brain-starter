export type Language = 'en' | 'ko';
export type Entry = { path: string; text?: string; base64?: string };
export type Bundle = { folders: string[]; files: Entry[] };
export interface VaultPort {
  kind(path: string): 'file' | 'folder' | null;
  mkdir(path: string): Promise<void>;
  write(path: string, text: string): Promise<void>;
  writeBinary(path: string, bytes: ArrayBuffer): Promise<void>;
}

const forbidden = /[\\:*?"<>|\u0000-\u001f]/;
const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

// 정규화 전에 경로 이탈 및 숨김 폴더를 거부한다.
export function validateRoot(input: string): string {
  const value = input.trim();
  if (!value) return '';
  if (value.startsWith('/') || forbidden.test(value) || /[\[\]#^`]/.test(value)) throw new Error('Choose a folder inside the vault without link or Markdown punctuation.');
  const parts = value.split('/');
  if (parts.some(part => !part || part !== part.trim() || part.startsWith('.') || /[. ]$/.test(part) || reserved.test(part))) {
    throw new Error('Use ordinary folder names without hidden folders or parent paths.');
  }
  return parts.join('/');
}

export function joinPath(root: string, relative: string): string {
  const safeRoot = validateRoot(root);
  if (!relative || relative.startsWith('/') || relative.split('/').some(part => !part || part.startsWith('.')) || forbidden.test(relative)) {
    throw new Error('Invalid workspace path.');
  }
  return safeRoot ? `${safeRoot}/${relative}` : relative;
}

function parents(path: string): string[] {
  const parts = path.split('/');
  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('/'));
}

export function prepareBundle(bundle: Bundle, root: string): Bundle {
  root = validateRoot(root);
  const targets = new Map(bundle.files.filter(f => f.path.endsWith('.md')).map(f => [f.path.split('/').slice(-1)[0]!.slice(0, -3), f.path.slice(0, -3)]));
  const files = bundle.files.map(entry => {
    let text = entry.text;
    if (text !== undefined) {
      // 템플릿의 이동 경로와 안내의 절대 경로를 설치 위치에 맞춘다.
      if (root) {
        text = text.replace(/(?:10\. Capture|20\. Organize|30\. Express)\//g, top => `${root}/${top}`);
      }
      // 다른 볼트에 같은 이름의 안내가 있어도 설치한 노트로 연결한다.
      text = text.replace(/\[\[([^\]|#]+)(#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (match, name: string, heading: string = '', alias?: string) => {
        const target = targets.get(name);
        if (!target) return match;
        return `[[${joinPath(root, target)}${heading}|${alias || name.replace(/^_/, '').replace(/\.en$/, '')}]]`;
      });
    }
    return { ...entry, path: joinPath(root, entry.path), text };
  });
  const folders = new Set<string>();
  for (const path of [...bundle.folders.map(p => joinPath(root, p)), ...files.map(f => f.path)]) {
    for (const parent of parents(path)) folders.add(parent);
  }
  for (const folder of bundle.folders) folders.add(joinPath(root, folder));
  return { files, folders: [...folders].sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b)) };
}

export function planInstallation(vault: VaultPort, bundle: Bundle) {
  const blocked = bundle.folders.filter(p => vault.kind(p) === 'file');
  blocked.push(...bundle.files.filter(f => vault.kind(f.path) === 'folder').map(f => f.path));
  const missing = bundle.files.filter(f => vault.kind(f.path) === null);
  const skipped = bundle.files.filter(f => vault.kind(f.path) === 'file');
  return { blocked, missing, skipped };
}

export async function ensureFolder(vault: VaultPort, path: string): Promise<void> {
  if (!path) return;
  for (const folder of [...parents(path), path]) {
    const kind = vault.kind(folder);
    if (kind === 'file') throw new Error(`A file blocks this folder: ${folder}`);
    if (kind === null) {
      try { await vault.mkdir(folder); }
      catch (error) { if (vault.kind(folder) !== 'folder') throw error; }
    }
  }
}

export async function installBundle(vault: VaultPort, bundle: Bundle) {
  const plan = planInstallation(vault, bundle);
  if (plan.blocked.length) throw new Error(`A file or folder blocks installation: ${plan.blocked[0]}`);
  for (const folder of bundle.folders) await ensureFolder(vault, folder);
  let created = 0, skipped = 0;
  for (const file of bundle.files) {
    // 미리보기 이후 생긴 파일도 덮어쓰지 않는다.
    if (vault.kind(file.path) === 'file') { skipped++; continue; }
    if (vault.kind(file.path) !== null) throw new Error(`A folder blocks this file: ${file.path}`);
    if (file.text !== undefined) await vault.write(file.path, file.text);
    else if (file.base64 !== undefined) {
      const bytes = Uint8Array.from(atob(file.base64), char => char.charCodeAt(0));
      await vault.writeBinary(file.path, bytes.buffer);
    } else throw new Error(`Missing bundled content: ${file.path}`);
    created++;
  }
  return { created, skipped };
}

export type NoteType = 'Idea' | 'Reference' | 'Book' | 'Project' | 'Permanent';
const destinations: Record<NoteType, string> = {
  Idea: '10. Capture/11. Zettelkasten-FleetingNotes',
  Reference: '10. Capture/12. Zettelkasten-ReferenceNotes',
  Book: '20. Organize/23. Resources/📖500. Humanities and Knowledge/📚501. Books',
  Project: '20. Organize/21. 📦Projects',
  Permanent: '30. Express/31. Zettelkasten-PermanentNotes'
};

export function noteTitle(value: string): string {
  const title = value.trim().replace(/[\\/:*?"<>|\[\]#^\u0000-\u001f]/g, '-').replace(/[. ]+$/, '');
  if (!title || title.startsWith('.') || reserved.test(title) || title.length > 120) throw new Error('Enter a title between 1 and 120 characters, without a leading dot or reserved name.');
  return title;
}

export function noteContent(type: NoteType, title: string, source: string, language: Language, now: string): string {
  const ko = language === 'ko';
  const date = now.slice(0, 10);
  const q = JSON.stringify;
  let front = `---\ncreated: ${q(now)}\nupdated: ${q(now)}\ntype: ${type}\ntags: [note]\nsource: ${JSON.stringify(source.trim() ? [source.trim()] : [])}\n`;
  if (type === 'Project') front += `start_date: ${date}\nend_date: \n`;
  if (type === 'Book') front += `book_title: ${q(title)}\nauthor: \nstatus: Reading\nstart_date: ${date}\nfinish_date: \n`;
  front += '---\n\n';
  if (type === 'Project') return front + `# ${title}\n\n## Twyla Tharp First Memo\n\n## Project Progress\n\n## The Hemingway Bridge\n`;
  if (type === 'Book') return front + (ko ? '## 책 소개\n\n- 읽게 된 계기: \n- 한 줄 요약: \n\n## 핵심 생각과 제텔카스텐\n\n## 핵심 문장과 나의 생각\n\n## 목차\n' : '## About the book\n\n- Why I picked it up: \n- In one sentence: \n\n## Key ideas and Zettelkasten\n\n## Quotations and reflections\n\n## Contents\n');
  if (type === 'Permanent') return front + (ko ? '## 핵심 생각\n\n## 근거와 설명\n\n## 관련 생각\n\n## 활용과 적용 조건\n' : '## Core idea\n\n## Reasoning and evidence\n\n## Related ideas\n\n## Applications and limits\n');
  return front + `> [!abstract] ${ko ? 'Distill(추출, 요약)' : 'Distill'}\n> -\n\n`;
}

export async function createNote(vault: VaultPort, root: string, type: NoteType, input: string, source: string, language: Language, now: string): Promise<string> {
  if (!(type in destinations)) throw new Error('Unknown note type.');
  const title = noteTitle(input);
  const parent = joinPath(root, destinations[type]);
  const grouped = type === 'Book' || type === 'Project';
  const name = (type === 'Book' ? '📓B-' : type === 'Project' ? '📦P-' : '') + title;
  let stem = name, count = 2;
  let folder = grouped ? `${parent}/${stem}` : parent;
  let file = `${folder}/${stem}.md`;
  while (vault.kind(file) !== null || (grouped && vault.kind(folder) !== null)) {
    stem = `${name} (${count++})`;
    folder = grouped ? `${parent}/${stem}` : parent;
    file = `${folder}/${stem}.md`;
  }
  await ensureFolder(vault, folder);
  await vault.write(file, noteContent(type, title, source, language, now));
  return file;
}
