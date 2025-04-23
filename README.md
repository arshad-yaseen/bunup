<!-- markdownlint-disable first-line-h1 -->

<!-- markdownlint-start-capture -->
<!-- markdownlint-disable-file no-inline-html -->
<div align="center">

  <!-- markdownlint-disable-next-line no-alt-text -->
  ![](https://bunup.dev/logo.svg)

  [![NPM Downloads](https://img.shields.io/npm/dm/bunup?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAtOTYwIDk2MCA5NjAiIHdpZHRoPSIyNHB4IiBmaWxsPSIjMDAwMDAwIj48cGF0aCBkPSJNNDgwLTMyMCAyODAtNTIwbDU2LTU4IDEwNCAxMDR2LTMyNmg4MHYzMjZsMTA0LTEwNCA1NiA1OC0yMDAgMjAwWk0xNjAtMTYwdi0yMDBoODB2MTIwaDQ4MHYtMTIwaDgwdjIwMEgxNjBaIi8%2BPC9zdmc%2B&labelColor=ffc44e&color=212121)](https://www.npmjs.com/package/bunup) [![NPM Version](https://img.shields.io/npm/v/bunup?logo=npm&logoColor=212121&label=version&labelColor=ffc44e&color=212121)](https://npmjs.com/package/bunup) [![Built with Bun](https://img.shields.io/badge/Built_with-Bun-fbf0df?logo=bun&labelColor=212121)](https://bun.sh) [![sponsor](https://img.shields.io/badge/sponsor-EA4AAA?logo=githubsponsors&labelColor=FAFAFA)](https://github.com/sponsors/arshad-yaseen)
</div>
<!-- markdownlint-restore -->

Bunup is the **blazing-fast build tool** for TypeScript and JavaScript libraries, designed for beautiful developer experience and speed, **powered by Bun's native bundler** — up to **~50× faster than Tsup**.

| Bundler   | Format       | Build Time     | Build Time (with dts) |
| --------- | ------------ | -------------- | --------------------- |
| **bunup** | **esm, cjs** | **3.52ms ⚡️** | **20.84ms ⚡️**       |
| tsdown    | esm, cjs     | 5.81ms         | 35.84ms               |
| unbuild   | esm, cjs     | 42.47ms        | 314.54ms              |
| tsup      | esm, cjs     | 63.59ms        | 943.61ms              |

## Key Features

- 🚀 **Easy to Use**: Bunup preconfigures everything you need out-of-the-box. Just focus on your code.
- 🔥 **Bytecode Generation**: Faster startups by compiling to Bun bytecode—perfect for CLIs.
- 📦 **[Workspace](https://bunup.dev/workspaces) Support**: Build multiple packages within one config file and command.
- 🔄 **Tsup Familiarity**: Familiar tsup-like CLI and config.
- 🎯 **Bun Target**: First-class bundling support for libraries built with Bun.

## 📚 Documentation

To get started, visit the [documentation](https://bunup.dev/documentation).

## ❤️ Contributing

For guidelines on contributing, please read the [contributing guide](https://github.com/arshad-yaseen/bunup/blob/main/CONTRIBUTING.md).

We welcome contributions from the community to enhance Bunup's capabilities and make it even more powerful.
