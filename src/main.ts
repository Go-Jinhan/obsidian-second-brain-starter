import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TFolder, normalizePath } from 'obsidian';
import data from './bundle.json';
import { Bundle, Language, NoteType, VaultPort, createNote, installBundle, joinPath, planInstallation, prepareBundle, validateRoot } from './core';

interface StarterSettings { root: string; language: Language }
const defaults: StarterSettings = { root: 'Second Brain', language: 'en' };
const bundle = data as Bundle;
const choose = (language: Language, en: string, ko: string) => language === 'ko' ? ko : en;

export default class SecondBrainStarter extends Plugin {
  settings: StarterSettings = { ...defaults };
  private running = false;

  async onload() {
    const saved: unknown = await this.loadData();
    if (saved && typeof saved === 'object') {
      const value = saved as Partial<StarterSettings>;
      if (value.language === 'ko' || value.language === 'en') this.settings.language = value.language;
      if (typeof value.root === 'string') {
        try { this.settings.root = validateRoot(value.root); } catch { /* 잘못된 저장값에는 기본 경로를 사용한다. */ }
      }
    }
    this.addCommand({ id: 'set-up-workspace', name: 'Set up workspace', callback: () => new SetupModal(this.app, this).open() });
    this.addCommand({ id: 'create-note', name: 'Create note', callback: () => {
      if (!this.app.vault.getAbstractFileByPath(joinPath(this.settings.root, 'Welcome.md'))) {
        new Notice(choose(this.settings.language, 'Set up your workspace first.', '먼저 작업 공간을 설치해주세요.'));
        new SetupModal(this.app, this).open();
        return;
      }
      new CreateNoteModal(this.app, this).open();
    }});
    this.addCommand({ id: 'open-welcome', name: 'Open welcome guide', callback: () => { void this.openWelcome().catch(error => this.reportError(error)); } });
    this.addSettingTab(new StarterSettingsTab(this.app, this));
  }

  port(): VaultPort {
    return {
      kind: path => {
        const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
        return file instanceof TFolder ? 'folder' : file instanceof TFile ? 'file' : null;
      },
      mkdir: async path => { await this.app.vault.createFolder(normalizePath(path)); },
      write: async (path, text) => { await this.app.vault.create(normalizePath(path), text); },
      writeBinary: async (path, bytes) => { await this.app.vault.createBinary(normalizePath(path), bytes); }
    };
  }

  async installWorkspace(root: string, language: Language) {
    if (this.running) throw new Error('Another workspace operation is in progress.');
    this.running = true;
    try {
      const safeRoot = validateRoot(root);
      const result = await installBundle(this.port(), prepareBundle(bundle, safeRoot));
      this.settings = { root: safeRoot, language };
      await this.saveData(this.settings);
      return result;
    } finally { this.running = false; }
  }

  async createWorkspaceNote(type: NoteType, title: string, source: string): Promise<string> {
    if (this.running) throw new Error('Another workspace operation is in progress.');
    this.running = true;
    try {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const now = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
      return await createNote(this.port(), this.settings.root, type, title, source, this.settings.language, now);
    } finally { this.running = false; }
  }

  async openPath(path: string) {
    const file = this.app.vault.getAbstractFileByPath(normalizePath(path));
    if (file instanceof TFile) await this.app.workspace.getLeaf(false).openFile(file);
    else new Notice(choose(this.settings.language, 'The guide is missing. Run Set up workspace to add missing files.', '안내 노트가 없습니다. Set up workspace에서 누락된 파일을 설치해주세요.'));
  }

  async openWelcome() { await this.openPath(joinPath(this.settings.root, this.settings.language === 'ko' ? 'Welcome.md' : 'Welcome.en.md')); }
  reportError(error: unknown) {
    console.error('Second Brain Starter:', error);
    new Notice(choose(this.settings.language, 'Could not finish. Existing files were not overwritten. ', '작업을 완료하지 못했습니다. 기존 파일은 덮어쓰지 않았습니다. ') + (error instanceof Error ? error.message : String(error)), 10000);
  }
}

class SetupModal extends Modal {
  private root: string;
  private language: Language;
  constructor(app: App, private plugin: SecondBrainStarter) {
    super(app);
    this.root = plugin.settings.root;
    this.language = plugin.settings.language;
  }

  onOpen() { this.render(); }
  onClose() { this.contentEl.empty(); }
  private render() {
    const t = (en: string, ko: string) => choose(this.language, en, ko);
    this.setTitle(t('Set up your second brain', '세컨드 브레인 시작하기'));
    const el = this.contentEl;
    el.empty();
    el.createEl('p', { text: t('Install the folder structure, guides, examples, and optional templates. Start with one note and one project.', '폴더 구조와 설명, 예시, 선택적으로 쓸 템플릿을 설치합니다. 처음에는 메모 하나와 프로젝트 하나로 시작해보세요.') });
    new Setting(el).setName(t('Guide language', '안내 언어')).setDesc(t('Both languages are included. This selects the welcome guide and new note content.', '두 언어의 안내를 함께 설치합니다. 처음 열 안내와 새 노트의 언어를 선택합니다.')).addDropdown(drop => drop.addOptions({ en: 'English', ko: '한국어' }).setValue(this.language).onChange(value => { this.language = value as Language; this.render(); }));
    let previewed = false;
    const reset = () => { previewed = false; summary.empty(); button.setButtonText(t('Preview installation', '설치 미리보기')); };
    new Setting(el).setName(t('Workspace folder', '작업 공간 폴더')).setDesc(t('Use a separate folder, or leave blank to install at the vault root.', '별도 폴더 이름을 입력하세요. 빈 볼트의 최상위에 설치하려면 비워두세요.')).addText(text => text.setValue(this.root).setPlaceholder('Second Brain').onChange(value => { this.root = value; reset(); }));
    const summary = el.createDiv({ cls: 'second-brain-starter-summary' });
    const actions = new Setting(el);
    let button: import('obsidian').ButtonComponent;
    actions.addButton(b => {
      button = b;
      b.setButtonText(t('Preview installation', '설치 미리보기')).setCta().onClick(async () => {
        try {
          const prepared = prepareBundle(bundle, this.root);
          const plan = planInstallation(this.plugin.port(), prepared);
          if (plan.blocked.length) throw new Error(`${t('A path is blocked', '경로가 다른 파일 또는 폴더와 충돌합니다')}: ${plan.blocked[0]}`);
          if (!previewed) {
            summary.empty();
            summary.createEl('p', { text: t(`Location: ${validateRoot(this.root) || 'vault root'}`, `설치 위치: ${validateRoot(this.root) || '볼트 최상위'}`) });
            summary.createEl('p', { text: t(`${plan.missing.length} files to create; ${plan.skipped.length} existing files to skip.`, `${plan.missing.length}개 파일을 만들고, 기존 파일 ${plan.skipped.length}개는 건너뜁니다.`) });
            summary.createEl('p', { text: t('Existing notes and vault settings stay in place. Other plugins are not installed or enabled.', '기존 노트와 볼트 설정은 그대로 둡니다. 다른 플러그인을 설치하거나 활성화하지 않습니다.') });
            previewed = true;
            button.setButtonText(t('Install missing files', '없는 파일 설치하기'));
            return;
          }
          button.setDisabled(true);
          const result = await this.plugin.installWorkspace(this.root, this.language);
          new Notice(t(`Created ${result.created} files; skipped ${result.skipped}.`, `${result.created}개를 만들고 ${result.skipped}개는 건너뛰었습니다.`));
          this.close();
          await this.plugin.openWelcome();
        } catch (error) { this.plugin.reportError(error); button.setDisabled(false); reset(); }
      });
    });
    actions.addButton(b => b.setButtonText(t('Cancel', '취소')).onClick(() => this.close()));
  }
}

class CreateNoteModal extends Modal {
  constructor(app: App, private plugin: SecondBrainStarter) { super(app); }
  onClose() { this.contentEl.empty(); }
  onOpen() {
    const t = (en: string, ko: string) => choose(this.plugin.settings.language, en, ko);
    this.setTitle(t('Create a note', '새 노트 만들기'));
    let type: NoteType = 'Idea', title = '', source = '';
    new Setting(this.contentEl).setName(t('Note type', '노트 종류')).addDropdown(drop => drop.addOptions({ Idea: t('Fleeting thought', '떠오른 생각'), Reference: t('Reference', '참고 자료'), Book: t('Book', '책'), Project: t('Project', '프로젝트'), Permanent: t('Permanent idea', '영구 노트') }).onChange(value => { type = value as NoteType; }));
    new Setting(this.contentEl).setName(t('Title', '제목')).addText(text => text.onChange(value => { title = value; }));
    new Setting(this.contentEl).setName(t('Source', '출처')).setDesc(t('Optional URL, book citation, or note link. Saved in the source property.', 'URL, 책 정보, 노트 링크를 입력할 수 있습니다. source 속성에 저장합니다.')).addTextArea(text => text.onChange(value => { source = value; }));
    new Setting(this.contentEl).addButton(button => button.setButtonText(t('Create note', '노트 만들기')).setCta().onClick(async () => {
      button.setDisabled(true);
      try {
        const path = await this.plugin.createWorkspaceNote(type, title, source);
        this.close();
        await this.plugin.openPath(path);
      } catch (error) { this.plugin.reportError(error); button.setDisabled(false); }
    })).addButton(button => button.setButtonText(t('Cancel', '취소')).onClick(() => this.close()));
  }
}

class StarterSettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: SecondBrainStarter) { super(app, plugin); }
  display() {
    this.containerEl.empty();
    const t = (en: string, ko: string) => choose(this.plugin.settings.language, en, ko);
    new Setting(this.containerEl).setName(t('Workspace', '작업 공간')).setDesc(this.plugin.settings.root || t('Vault root', '볼트 최상위')).addButton(button => button.setButtonText(t('Set up', '설치하기')).onClick(() => new SetupModal(this.app, this.plugin).open()));
    new Setting(this.containerEl).setName(t('Language', '언어')).addDropdown(drop => drop.addOptions({ en: 'English', ko: '한국어' }).setValue(this.plugin.settings.language).onChange(async value => {
      this.plugin.settings.language = value as Language;
      await this.plugin.saveData(this.plugin.settings);
      this.display();
    }));
    new Setting(this.containerEl).setName(t('Welcome guide', '시작 안내')).addButton(button => button.setButtonText(t('Open', '열기')).onClick(() => { void this.plugin.openWelcome().catch(error => this.plugin.reportError(error)); }));
  }
}
