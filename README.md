# Second Brain Starter

**English** · [한국어](README.ko.md)

![Connected notes in Obsidian](vault/assets/second-brain-banner-obsidian.png)

Turn a collection of notes into a place you can think and work. Second Brain Starter brings a ready-to-use folder structure, readable guides, and a note creator into your Obsidian vault.

The workspace brings together the *CODE* method, the *PARA* system, and the *Zettelkasten* note-taking method. Capture something worth keeping, bring useful material into your current project, and leave behind ideas you can use again. The guides explain what each part is for, with examples you can follow in English or Korean.

## Start small

1. Enable the plugin, then run **Second Brain Starter: Set up workspace** from the command palette.
2. Choose English or Korean and an installation folder. The default is `Second Brain`; leave the field empty to use the vault root.
3. Preview the files to add, then select **Install missing files**.
4. Read the welcome guide and run **Second Brain Starter: Create note** to capture your first thought or start a project.

Both languages are included. The language setting chooses the welcome guide and the content of newly created notes. You can change it later in the plugin settings.

## A place for each stage of your work

**Capture** holds fleeting thoughts and references before you decide how to use them. **Organize** groups material into Projects, Areas, Resources, and Archives. **Express** gives developed ideas and finished work a home.

*Distill* lives at the top of individual notes: a short summary lets you see why a source matters when you return to it. It does not need a separate folder.

A project is where scattered material comes together for a concrete outcome. Gather the relevant notes and sources there while you work. When the project ends, move reusable material back to Resources and archive the project’s progress and results. Project notes include *Twyla Tharp First Memo*, *Project Progress*, and *The Hemingway Bridge* to help you begin, record the work, and pick it up again.

The numbered shelves in Resources are examples inspired by the *CMDS* knowledge management approach. Rename and simplify them around your own interests; you do not need to fill every folder.

## What the plugin adds

- Seventeen folder and concept guides in both English and Korean, with source properties and links between related ideas.
- Fictional examples showing how capture, projects, references, and permanent notes connect.
- A welcome guide and six optional templates in each language.
- A note creator for fleeting thoughts, references, books, projects, and permanent ideas. Sources you enter go into the `source` property; book and project notes receive their own folders.

The three commands are **Set up workspace**, **Create note**, and **Open welcome guide**. They work without Templater or any other community plugin. To run the optional `TPL -` templates yourself, install Templater separately. The welcome guide also explains how to set up Periodic Notes for journals.

## Your notes stay yours

Enabling the plugin does not install the workspace automatically. Setup previews what it will add and skips existing files. Repeating setup adds missing files; it does not replace your edited guides. If a file blocks a required folder, setup stops and tells you the path.

New notes get a numbered name when the requested name is already taken. All content stays in ordinary Markdown files. Disabling or uninstalling the plugin leaves that content in place.

The plugin works offline. It makes no network requests, collects no telemetry, and does not install other plugins. External sources are ordinary links that open only when you choose to follow them. Its own preferences are stored using Obsidian’s plugin settings API.

## Installation

For a manual installation, download `main.js`, `manifest.json`, and `styles.css` from a published release. Place the three files in `<vault>/.obsidian/plugins/second-brain-starter/`, reload Obsidian, and enable **Second Brain Starter** under **Settings → Community plugins**. A local build produces the same three files in `dist/second-brain-starter/`.

Once the plugin has been published in the community directory, you can find **Second Brain Starter** in **Settings → Community plugins → Browse**. A GitHub release alone does not add it to that search.

Requires Obsidian 1.14.4 or later. Tested on macOS with Obsidian 1.15.0. The implementation uses Obsidian’s cross-platform APIs; mobile has not yet been tested on a device.

## Sources and development

The workspace is based on [Obsidian Second Brain Template](https://github.com/Go-Jinhan/obsidian-second-brain-template). Its design guide explains the influence of Tiago Forte’s *Building a Second Brain* and *The PARA Method*, *Zettelkasten*, and *CMDS*, and links to the sources. The included examples are fictional.

Use Node.js 22 or later to build:

```sh
npm ci
npm run package
```

This checks TypeScript, runs the installation and note-creation tests, and builds the release files. See [testing](docs/TESTING.md) and [releasing](docs/RELEASING.md) for details.

Code and original written material are available under the [MIT license](LICENSE). Third-party quotations and trademarks retain their respective rights; see [NOTICE](NOTICE.md). This is an independent community project, not an official Obsidian product.
