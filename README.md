# soy2jsx converter

## Overview

The goal of this small utility is to automatically convert SOY (Google Closure Template) files to JSX files.
By now it only supports parsing SOY syntax in most of its features (so far I've reached 194 / 284 successful conversions over JSDS codebase).

## Usage

Compile parser: `npm run-script compile-grammar`
Run parser against single file: `node index.js FILENAME.SOY`
Run parser agains a directory (this command will ignore files in `sdmakehome` and `target/classes/*` directories on any level; this was made to simplify JSDS codebase testing): `node index.js DIRECTORY`

## TODO

1. support inline `if` statements for tag attributes
2. support string interpolation: `<a href="moo {$foo}"></a>`

