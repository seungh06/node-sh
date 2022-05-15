![banner](https://user-images.githubusercontent.com/41784860/168438812-90eed635-2fe3-477e-8a25-6527036bffce.png)

# 🎉 NODE-SH
[![license](https://img.shields.io/badge/NodeJS-339933?style=for-the-badge&logo=Node.js&logoColor=fff)](https://nodejs.org/)
[![license](https://img.shields.io/badge/TypeSciprt-3178C6?style=for-the-badge&logo=TypeScript&logoColor=fff)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/badge/license-MIT-9999FF?style=for-the-badge)](/LICENSE)

Node-sh is an implementations and executions of unix shell commands for node.js that runs on mac os, linux and windows.
It helps execute your operating system's shell commands, implement and functionalize unix commands.

### 🕹 Install
```bash
 $ yarn add node-sh
 $ npm install node-sh
```

---

### 📐 Usage
```ts
 import 'node-sh';

 const shell = $.which `git`;
 
 $.env.shell = shell;
```
