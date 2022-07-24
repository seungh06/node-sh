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

<details>
    <summary><b>✏️ Show Command References</b></summary>

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
Change the mode of each FILE to `MODE`. If `reference` option is supplied, change the mode of each FILE to that of `RFILE`.

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
 
 $.dirs `-c`
 $.dirs `+3`
```

### ``$.echo `[OPTION]... [STRING]...` ``
Echo the STRING(s) to standard output and print it.
 
 - `-n` : do not output the trailing newline.
 
```typescript
 const echo = $.echo `Hello World!` // UnixExtension<string>
 $.echo `Print`
```

### ``$.grep  `[OPTION]... PATTERN [FILE]...` ``
Search for `PATTERN(REGEX)` in each `FILE`.

 - `-i, --ignore-case` : ignore case distinctions in patterns and data.
 - `-v, --invert-match` : select non-matching lines.
 - `-n, --line-number` : print line number with output lines.
 - `-H, --with-filename` : print file name with output lines.
 - `-r, --recursive` : read all files under each directory, recursively.
 - `-l, --files-with-matches` : print only names of `FILE`s with selected lines.
 
``` typescript
 const grep = $.grep `-i ^import src/*.ts` // UnixExtension<string[]>
```

### ``$.head  `[OPTION]... [FILE]...` ``
Print the first `10` lines of each `FILE` to standard output. If multiple files are supplied, prepend each with a header indicating the file name.
 - `-c, --bytes=NUM` : print the first `NUM` bytes of each file
 - `-n, --lines=NUM` : print the first `NUM` lines instead of the first `10`.
 - `-q, --quiet, --silent` : never print headers giving file names.
 
```typescript
 const head = $.head `-n 15 src/test.ts` // UnixExtension<string>
 
 $.head `-c 100 src/test.ts`
 $.head `-q src/*.ts`
```

### ``$.ln  `[OPTION]... SOURCE DEST` ``
By default, create hard link from `SOURCE` to `DEST`. If `-s` or `--symbolic` option is supplied, create symbolic link.

 - `-b, --backup` : make a backup of each existing destination file.
 - `-f, --force` : remove existing destination files.
 - `-s, --symbolic` : make symbolic links instead of hard links.
 - `-S, --suffix=SUFFIX` : override the usual backup suffix(`~`).
 
```typescript
 $.ln `file link`
 $.ln `-bS BACKUP_ file exist` // backup suffix = BACKUP_
```

### ``$.ls  `[OPTION]... [FILE]...` ``
List information about the `FILE(s)`. If `FILE` is not supplied, list information about the current directory.

 - `-a, --all` : do not ignore entries starting with `.`.
 - `-A, --almost-all` : do not list implied `.` and `..`.
 - `-d, --directory` : list directories themselves, not their contents.
 - `-l` : use a long listing format.
 - `-L, --dereference` : show information for the file the link references rather than for the link itself.
 - `-r, --reverse` : reverse order while sorting.
 - `-R, --recursive` : list subdirectories recursively.
 
```typescript
 const ls = $.ls `-al`
 
 $.ls `-R src dist`
 $.ls `-l src/**/*.ts`
```
 
### ``$.mkdir  `[OPTION]... DIRECTORY...` ``
Create the `DIRECTORY(ies)`, if they do not already exist.

 - `-m, --mode=MODE` : set file mode (must be octal - unmask).
 - `-p, --parents` : no error if existing, make parent directories as needed.

```typescript
 $.mkdir `test test1`
 $.mkdir `-m 777 test`
 $.mkdir `-p test/test1` // if 'test' is not exist, make it.
```

### ``$.mv  `[OPTION]... SOURCE... DEST[DIRECTORY]` ``
Rename `SOURCE` to `DEST`, or move `SOURCE(s)` to `DIRECTORY`.
 
 - `-b, --backup` : make a backup of each existing destination file.
 - `-S, --suffix=SUFFIX` : override the usual backup suffix(`~`).
 
```typescript
 $.mv `file file_renamed`
 $.mv `file file1 dir` // rename to 'dir/file', 'dir/file1'.
```

### ``$.popd `[-n] [+N | N]` ``
Remove directories from stack. If no arguments are supplied, remove the top directory from the stack, and changes to the new top directory.

 - `-n` : Suppresses the normal change of directory when removing directories from the stack, so only the stack is manipulated.
 
Arguments:
 - `+N` : Removes the `N`th entry counting from the left of the list, starting with zero.
 - `N` : Removes the `N`th entry counting from the right of the list, starting with zero.
 
```typescript
 const popd = $.popd `` // UnixExtension<string[]> - directory stack.
 $.popd `-n`
 $.popd `+3`
```

### ``$.pushd `[-n] [+N | N | DIR]` ``
Add directories to stack. If no arguments are supplied, exchanges the top two directories.

 - `-n` : Suppresses the normal change of directory when adding directories to the stack, so only the stack is manipulated.
 
Arguments:
 - `+N` : Rotates the stack so that the `N`th directory counting from the left of the list, starting with zero is at the top.
 - `N` : Rotates the stack so that the `N`th directory counting from the right of the list, starting with zero is at the top.
 - `DIR` : Adds `DIR` to the directory stack at the top, making it the new current working directory.
 
```typescript
 const pushd = $.pushd `` // UnixExtension<string[]> - directory stack.
 $.pushd `-n hello`
 $.pushd `dir`
```

### ``$.pwd ` ` ``
Print the name of the current working directory.

```typescript
 const pwd = $.pwd `` // UnixExtension<string>
```

</details>
