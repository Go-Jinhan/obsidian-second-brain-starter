---
type: Reference
source:
  - "[[_Getting-Started.en]]"
  - "[[_Second-Brain-Design.en]]"
tags: [guide]
---

![Notes connected through Obsidian](assets/second-brain-banner-obsidian.png)

# Your second brain

[한국어](Welcome.md) · **English**

Write something you want to remember, then try using it in your current work. The *CODE* method gives collected information a path into use. The *PARA* system helps choose where material belongs. The *Zettelkasten* note-taking method helps you explain and connect ideas.

## Start with one note

Run **Second Brain Starter: Create note** from the command palette. Choose a fleeting thought, reference, book, project, or permanent note. Any source you enter is saved in the note’s `source` property.

For a project, gather relevant material into its folder and work with it there. At the end, return reusable material to Resources and keep progress and results in Archives. Record the initial purpose in *Twyla Tharp First Memo*, the work in *Project Progress*, and where to resume in *The Hemingway Bridge*.

## Learn the structure as you use it

Begin with [[_Getting-Started.en]], then follow [[_Capture.en]], [[_Organize.en]], [[_Projects.en]], and [[_Distill.en]]. Each `_` guide explains a folder’s role and gives examples. Adapt the subjects and numbers described in [[_Resources.en]] to your interests.

## Use the optional templates

This plugin’s Create note command works without other plugins. To run the included `TPL -` files yourself, install Templater. For dated journals, install Periodic Notes separately.

Set Templater’s template folder to:

`20. Organize/23. Resources/📖1000. Reference/📚1090. Settings/📚1091. Templates`

Keep daily, weekly, and monthly notes beneath:

`20. Organize/23. Resources/📖1000. Reference/📚1010. Periodic Notes`

- Daily: `1011. Daily`, `YYYY-MM-DD (ddd)`, `TPL - Daily Note.en`
- Weekly: `1012. Weekly`, `GGGG-[W]WW`, `TPL - Weekly Note.en`
- Monthly: `1013. Monthly`, `YYYY-MM`, `TPL - Monthly Note.en`

Each folder above is a subfolder of the full Periodic Notes path. If a newly created note contains `<%` code, run **Templater: Replace templates in the active file**. Read [[_Periodic-Notes.en]] for the review practice.

Running setup again adds only missing files. Disabling or removing the plugin leaves your notes in place.
