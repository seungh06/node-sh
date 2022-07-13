![banner](https://user-images.githubusercontent.com/41784860/168438812-90eed635-2fe3-477e-8a25-6527036bffce.png)

[![nodejs](https://img.shields.io/badge/NodeJS-339933?style=for-the-badge&logo=Node.js&logoColor=fff)](https://nodejs.org/)
[![typescript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=fff)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/badge/license-MIT-9999FF?style=for-the-badge)](/LICENSE)

Node-sh is a bash command implementation and os shell command execution for node.js that runs on mac os, linux and windows. It makes you easier to execute your os shell commands. implement bash commands and functionalize it.

### 🕹 Install
```bash
 $ yarn add node-sh
 $ npm install node-sh
```

## 🔥 Features
- TypeScript based, zero dependencies. 📦
- Simple command execution with user environment.
- **21** bash commands implemented.
- Each command supports type-based JavaScript API and pipe commands.
- Provides details about exceptions in user command with rendered code. 

## 📌 Import
If the `$` namespace conflicts, you can use named import rather than global import.
```typescript
 import 'node-sh' // $.commands
 import bash from 'node-sh' // bash.commands
```

## 📝 Commands
Designed to be easy to use, node-sh uses only one interface. it can execute commands and implementations.

### 🔐 Execute
```typescript
  const exec = $ `ls -al | grep 'node-sh'`
```

> **Caution**: This function uses the [child process](https://nodejs.org/api/child_process.html) module to execute commands directly.

**Environments**
```typescript
 $.env: {
     verbose    : boolean           = false
     prefix     : string            = ''
     shell      : string | boolean  = true
     max_buffer : number            = 200 * 1024 * 1024
 } // structures
 
 $.env.shell = $.which `git`
```

### 💡 Implement
Node-sh has implemented syntax and options, etc. similar to `bash` based on [linux man page](https://man7.org/linux/man-pages/) to improve the user-experience.

<details>
  <summary><b>📁 Show Command References</b></summary>

</details>

## 🔗 UnixExtension
Each function (except void functions) returns stdout to `UnixExtension` class that can use JavaScript API according to the type of stdout or pipe functions such as grep, sort, uniq, etc.

<details>
  <summary><b>✏️ Show Usage Example</b></summary>
  
  #### 📖 **Check the module has a default export.**
  ```typescript
   import 'node-sh'
   
   const output = $.cat `src/test.ts`.includes('export default')
  ```
  
  #### 📖 **Get only directories.**
  ```typescript
   import 'node-sh'
     
   // Use JavaScript API
   const api = $.ls `-al`.filter(data => data.startsWith('d'))
     
   // Use UnixExtension
   const extension = $.ls `-al`.grep `^d`
  ```
</details>

##  🛠  Exceptions
Node-sh provides detail of the exceptions that occurred in user commands or internal and suggests solutions for them.
> **Note**: It is only used for errors handled within the module and cannot be used externally.

![exception](https://user-images.githubusercontent.com/41784860/177758975-93b8b637-8906-457d-9424-354428ffbc82.png)
