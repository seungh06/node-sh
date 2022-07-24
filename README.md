![banner](https://user-images.githubusercontent.com/41784860/168438812-90eed635-2fe3-477e-8a25-6527036bffce.png)

[![nodejs](https://img.shields.io/badge/NodeJS-339933?style=for-the-badge&logo=Node.js&logoColor=fff)](https://nodejs.org/)
[![typescript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=fff)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/badge/license-MIT-9999FF?style=for-the-badge)](/LICENSE)

Node-sh is a bash command implementation and os shell command execution for node.js that runs on mac os, linux and windows. It makes you easier to execute your os shell commands. implement bash commands and functionalize it.

### 🕹 Install
```bash
 $ yarn add node-sh@npm:@seung_h/node-sh
 $ npm install node-sh@npm:@seung_h/node-sh
```

## 🔥 Features
- TypeScript based, light weight `8kb`, zero dependencies. 📦
- Simple command execution with user environment.
- **25** bash commands implemented.
- Each command supports type-based JavaScript API and pipe commands.
- Provides details about exceptions in user command with rendered code. 

## 📌 Import
```typescript
 import 'node-sh' // $.commands
 import bash from 'node-sh' // bash.commands (named)
```

## 📝 Usage
```typescript
 import 'node-sh'
 
 const version = $.cat `package.json`.grep `version`
 
 if(version.includes('dev') || process.env.dev) {
     $.cp `-r bin asm`
     $.chmod `--reference bin/exec asm/*`
     $.rm `-rf bin`
 }
 
 const bash = $.which `bash`
 $.set `shell=${ bash }` //$.env.shell = bash.stdout
 $.echo `execution environment: $shell`
 
 $.chmod `u+x build.sh`
 $ `build.sh` // exec
```

## 🔐 Command Reference
All commands run synchronously and return `UnixExtension` class (except void functions) that can use JavaScript API, redirection and pipe functions. Interpreter accept glob characters and change `$variable` to environment variable, `${...}` expression to escape and quotes. etc.

### ``$ `command` ``
Executes a command directly in the shell specified by the `shell` variable, using [child process](https://nodejs.org/api/child_process.html) module.
```typescript
 const exec = $ `ls -al | grep node-sh` // UnixExtension<string>
```

### ``$.cat `[OPTION]... [FILE]...` ``
Return the contents of a given FILE or concatenated FILE(s) to standard output.

 - `-n, --number` : number all output lines.
 - `-E, --show-ends` : display `$` at end of each line.
 - `-T, --show-tabs` : display `TAB` characters as `^I`

```typescript
 const cat = $.cat `-nE src/*.ts` // UnixExtension<string>
```

### ``$.cd `[DIR]` ``
Change the current directory to `DIR`. Change to the previous directory using the `-` or `$OLDPWD` variable. If no stdin is supplied or `-`, change to `HOME` directory.
```typescript
 $.cd `src`
 $.cd `$OLDPWD/dist`
```

### ``$.chmod `[OPTION]... MODE[RFILE] FILE...` ``
Change the mode of each FILE to `MODE`. If `reference` options is supplied, change the mode of each FILE to that of `RFILE`.

 - `-c, --changes` : report only when a change is made.
 - `--reference=RFILE` : use `RFILE`'s mode instead of `MODE` values.
 - `-R, --recursive` : change files and directories recursively.

```typescript
 $.chmod `755 build.sh`
 $.chmod `-R a=rwx dist`
 $.chmod `--reference test.sh build.sh`
```

### ``$.cp `[OPTION]... SOURCE... DEST[DIRECTORY]` ``
Copy `SOURCE` to `DEST`, or multiple `SOURCE(s)` to `DIRECTORY`.

 - `-b, --backup` : make a backup of each existing destination file.
 - `-S, --suffix=SUFFIX` : override the usual backup suffix (`~`).
 - `-l, --dereference` : always follow symbolic links in `SOURCE`.
 - `-p, --no-dereference` : never follow symbolic links in `SOURCE`.
 - `-r, -R, --recursive` : copy directories recursively.
 - `-u, --update` : copy only when the `SOURCE` file is newer than the destination file or when the destination file is missing.
 
```typescript
 $.cp `test.ts src`
 $.cp `test.ts test1.ts src`
 $.cp `-rbS BACKUP_ build src` // backup suffix = BACKUP_
```
 
### ``$.dirs `[+N] [N]` ``
Display the list of currently remembered directories. Add the directory stack using the `pushd` command and back up with the `popd` command.
 
 - `-c` : clear the directory stack by deleting all of the elements.
  
 Arguments:
 - `+N` : Displays the `N`th entry counting from the left of the list when invoked without options, starting with zero.
 - `N` : Displays the `N`th entry counting from the right of the list when invoked without options, starting with zero.

```typescript
 const dirs = $.dirs `` // UnixExtension<string[]> 
```

### ``$.echo `[OPTION]... [STRING]...` ``
Echo the STRING(s) to standard output and print it.
 
 - `-n` : do not output the trailing newline.
 
```typescript
 const echo = $.echo `Hello World!` // UnixExtension<string>
 $.echo `Print`
```
