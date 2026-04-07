# Hexo Blog Source

This folder contains the source for `https://raymondstudio.cn`.

## Local Structure

- Hexo source: `Hexo_Blog_Raymond/`
- Deploy target: `RaymondGuoCGI/RaymondGuoCGI.github.io`
- Current theme setting: `butterfly`

## Notes

- Build artifacts are intentionally excluded: `public/`, `.deploy_git/`, `db.json`, `node_modules/`
- Obsidian and assistant working state under `source/_posts/.obsidian/` and `source/_posts/.claude/` is intentionally excluded
- This repository snapshot does not vendor the nested theme git repositories under `themes/`

## Restore Theme Locally

If `themes/butterfly` is missing on another machine, clone the theme into:

```bash
git clone https://gitee.com/immyw/hexo-theme-butterfly.git themes/butterfly
```

Then install dependencies and run:

```bash
npm install
hexo clean
hexo g
hexo d
```
