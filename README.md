![banner](https://user-images.githubusercontent.com/41784860/168438812-90eed635-2fe3-477e-8a25-6527036bffce.png)

[![nodejs](https://img.shields.io/badge/NodeJS-339933?style=for-the-badge&logo=Node.js&logoColor=fff)](https://nodejs.org/)
[![typescript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=TypeScript&logoColor=fff)](https://www.typescriptlang.org/)
[![license](https://img.shields.io/badge/license-MIT-9999FF?style=for-the-badge)](/LICENSE)

Node-sh is a bash command implementation and os shell command execution for node.js that runs on mac os, linux and windows. It makes you easier to execute your os shell commands, implement bash commands and functionalize it.

### 🕹 Install
```bash
 $ yarn add node-sh@npm:@seung_h/node-sh
 $ npm install node-sh@npm:@seung_h/node-sh
```

## 🔥 Features
- TypeScript based, zero dependencies. 📦
- Simple command execution with user environment.
- **26** bash commands implemented.
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

### ``.redirect `OPERATOR FILE` ``
Create stdout redirection of executed commands. use `>` operator to overwrite and `>>` operator to insert.
```typescript
 $.cat `-n build.sh`.redirect `>> output.txt`
```

<details>
    <summary><b>✏️ Show All Command References</b></summary>

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

### ``$.rm `[OPTION]... [FILE]...` ``
Remove (unlink) the `FILE(s)`.

 - `-f, --force` : ignore nonexistent files and arguments, never prompt.
 - `-r, --recursive` : remove directories and their contents recursively.
 
```typescript
 $.rm `file`
 $.rm `file file1 file2`
 $.rm `-rf dir`
```

### ``$.rmdir `[OPTION]... DIRECTORY...` ``
Remove the `DIRECTORY(ies)`, if they are empty.
 
 - `-p, --parents` : remove `DIRECTORY` and its ancestors; `rmdir -p a/b/c` -> `rmdir a/b/c a/b a`
 
```typescript
 $.rmdir `dir`
 $.rmdir `-p parent/dir`
```

### ``$.set `[-fvC]` ``
Set or unset, change the value of shell variables and attributes. If no arguments or options are supplied, display the names and values of shell variables.
Using `+` rather than `-` causes these flags to be turned off.

 - `-f` : Disable file name generation (globbing).
 - `-v` : Print shell input lines as they are read(verbose).
 - `-C` : If set, disallow existing regular files to be overwritten by redirection(`>`) of output.
 
```typescript
 const set = $.set ``
 
 $.set `-fC`
 $.set `+f`
 $.set `var1=value`
```

### ``$.sleep  `NUMBER[SUFFIX]` ``
Pause for `NUMBER` seconds. `SUFFIX` may be 's' for seconds (default), 'm' for minutes, 'h' for hours or 'd' for days.

```typescript
 $.sleep `5`  // 5 seconds
 $.sleep `5m` // 5 minutes
```

### ``$.sort  `[OPTION]... [FILE]...` ``
Write sorted concatenation of all `FILE(s)` to standard output.
 
 - `-f, --ignore-case` : fold lower case to upper case characters.
 - `-n, --numeric-sort` : compare according to string numerical value.
 - `-r, --reverse` : reverse the result of comparisons.
 
```typescript
 const sort = $.sort `-f file` // UnixExtension<string>
 $.sort `-r *.ts file`
```

### ``$.tail  `[OPTION]... [FILE]...` ``
Print the last `10` lines of each `FILE` to standard output. If multiple files are supplied, prepend each with a header indicating the file name.

 - `-c, --bytes=NUM` : output the last `NUM` bytes; or use `+NUM` to output starting with byte `NUM` of each file.
 - `-n, --lines=NUM` :  output the last `NUM` lines, instead of the last `10`; or use `+NUM` to output starting with line `NUM`.
 - `-q, --quiet, --silent` : never print headers giving file names.
 
```typescript
 const tail = $.tail `-n 15 src/test.ts` // UnixExtension<string>
 
 $.tail `-n +15 src/test.ts`
 $.tail `*.ts files`
```
 
### ``$.touch  `[OPTION]... [FILE]...` ``
Update the access and modification times of each `FILE` to the current time. A `FILE` argument that does not exist is created empty unless `-c` option is supplied.

 - `-a` : change only the access time.
 - `-c, --no-create` : do not create any files.
 - `-d, --date=STRING` : parse `STRING` and use it instead of current time.
 - `-m` : change only the modification time.
 - `-r, --reference=RFILE` : use this `RFILE`'s times instead of current time.
 
``` typescript
 $.touch `not_exist.js`     // create 'not_exist.js'
 $.touch `exist.js`         // change access and modification times.
 $.touch `-r file exist.js` // change times of 'exist.js' to 'file's time.
 $.touch `-d 1234-03-21 exist.js` // change times of 'exist.js' to Mar 21, 1234
```

### ``$.uniq  `[OPTION]... [INPUT [OUTPUT]]` ``
Filter adjacent matching lines from `INPUT`, writing to `OUTPUT` or standard output.

 - `-c, --count` : prefix lines by the number of occurrences.
 - `-d, --repeated` : only print duplicate lines, one for each group.
 - `-i, --ignore-case` : ignore differences in case when comparing.
 
```typescript
 const uniq = $.uniq `-c file`
 
 $.uniq `file output` // write to 'output'.
```

### ``$.unset  `name...` ``
Each environment variable specified by `name` shall be unset.

``` typescript
 $.set `user=Test pass=1234` 
 $.unset `user pass`
```

### ``$.which  `[OPTION]...  PROGRAM` ``
Search an executable or script in the directories listed in the environment variable PATH and print full path to standard output.

 - `-a, --all` : Print all matching executables in PATH, not just the first.
 
```typescript
 const which = $.which `git` // UnixExtension<string>
 $.which `-a node`
```

### ``$.whoami ` ` ``
Print the user name associated with the current effective user ID.
```typescript
 const user = $.whoami `` // UnixExtension<string>
```
</details>

## 📐 Environment Variable
Variables in default structures are used only in the `exec` command. User can set the variable using `set` command or $.env.`name`. All commands change the `$variable` syntax to the value of it.

**Default Environments**
```typescript
 $.env: {
     verbose    : boolean           = false
     prefix     : string            = ''
     shell      : string | boolean  = true
     max_buffer : number            = 200 * 1024 * 1024
 } // default structures
 
 $.env.noglob    : boolean = undefined
 $.env.noclobber : boolean = undefined
 $.env.OLDPWD    : string  = undefined
 ...
```
**User Environments**
```typescript
 import 'node-sh'
 
 $.set `name=Jack`      // $.env.name = 'seungh'
 $.echo `Hello, $name`  // Hello, seungh
```

##  🛠  Exceptions
Node-sh provides detail of the exceptions that occurred in user commands or internal and suggests solutions for them.


![exception](https://user-images.githubusercontent.com/41784860/177758975-93b8b637-8906-457d-9424-354428ffbc82.png)

## 📋 License
Distributed under the MIT License. See ```LICENSE``` for more information.
