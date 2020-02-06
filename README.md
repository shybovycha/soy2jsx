# soy2jsx converter

![Build status](https://github.com/shybovycha/soy2jsx/workflows/Build/badge.svg)

## Overview

The goal of this small utility is to automatically convert SOY (Google Closure Template) files to JSX files.

By now it only supports parsing SOY syntax in most of its features.

## Usage

Compile parser: `npm run-script compile-grammar`

Run parser against single file: `node index.js FILENAME.SOY`

Run parser against a directory: `node index.js DIRECTORY`

## TODO

1. complete the tests
2. fix optimizer
