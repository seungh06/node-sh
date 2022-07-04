![banner](https://user-images.githubusercontent.com/41784860/168438812-90eed635-2fe3-477e-8a25-6527036bffce.png)

# 🎉 Node-sh
[![nodejs](https://img.shields.io/badge/NodeJS-339933?style=for-the-badge&logo=Node.js&logoColor=fff)](https://nodejs.org/)
[![typescript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=fff)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/badge/license-MIT-9999FF?style=for-the-badge)](/LICENSE)

Node-sh is an implementations and executions of bash commands for node.js that runs on mac os, linux and windows.
It execute your operating system's shell commands, implement bash commands and functionalize it.

### 🕹 Install
```bash
 $ yarn add node-sh
 $ npm install node-sh
```
### 🛠️ Import
```typescript
 import 'node-sh';  // $.command
 import bash from 'node-sh';  // bash.command
```

## 🔥 Commands
Designed to be easy to use, node-sh uses only one `$`. it can execute commands or implementations.

### 🔐 Execute
```typescript
  const exec = $ `ls -al | grep 'node-sh'`;
```
> Caution: This function uses the [child process](https://nodejs.org/api/child_process.html) module to execute commands directly.

**Environments**
```typescript
 $.env: {
     verbose    : boolean           = false
     prefix     : string            = ''
     shell      : string | boolean  = true
     max_buffer : number            = 200 * 1024 * 1024
 } // structures
 
 $.env.shell = $.which `git`;
```

### 📌 Implement
Node-sh uses syntax similar to bash to improve `user-experience` and implements Unix-like functions based on [linux man page](https://man7.org/linux/man-pages/).

<details>
  <summary>Click here to read command references.</summary> 
  
  ## Syntax
</details>


## 📋 License
Distributed under the MIT License. See ```LICENSE``` for more information.

**© 2022 seungh, All rights reserved.**
