# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.12](https://github.com/Melchyore/adoscopejs/compare/v0.4.11...v0.4.12) (2019-05-28)



### [0.4.11](https://github.com/Melchyore/adoscopejs/compare/v0.4.10...v0.4.11) (2019-05-27)



### [0.4.10](https://github.com/Melchyore/adoscopejs/compare/v0.4.9...v0.4.10) (2019-05-27)


### Bug Fixes

* **readme:** fix badge url ([23b5742](https://github.com/Melchyore/adoscopejs/commit/23b5742))



### [0.4.9](https://github.com/Melchyore/adoscopejs/compare/v0.4.8...v0.4.9) (2019-05-27)


### Bug Fixes

* **watchers:** fix ModelWatcher namespace for models ([f5d2af8](https://github.com/Melchyore/adoscopejs/commit/f5d2af8))



### [0.4.8](https://github.com/Melchyore/adoscopejs/compare/v0.4.7...v0.4.8) (2019-05-27)



### [0.4.7](https://github.com/Melchyore/adoscopejs/compare/v0.4.6...v0.4.7) (2019-05-27)



### [0.4.6](https://github.com/Melchyore/adoscopejs/compare/v0.4.5...v0.4.6) (2019-05-27)



### [0.4.5](https://github.com/Melchyore/adoscopejs/compare/v0.4.4...v0.4.5) (2019-05-27)



### [0.4.4](https://github.com/Melchyore/adoscopejs/compare/v0.4.3...v0.4.4) (2019-05-27)



### [0.4.3](https://github.com/Melchyore/adoscopejs/compare/v0.4.2...v0.4.3) (2019-05-27)



### [0.4.2](https://github.com/Melchyore/adoscopejs/compare/v0.4.1...v0.4.2) (2019-05-27)



### [0.4.1](https://github.com/Melchyore/adoscopejs/compare/v0.4.0...v0.4.1) (2019-05-27)



## [0.4.0](https://github.com/Melchyore/adoscope/compare/v0.3.0...v0.4.0) (2019-05-27)


### Features

* **contracts:** add Logger types ([1139b8a](https://github.com/Melchyore/adoscope/commit/1139b8a))


### Tests

* add test for LogWatcher ([4886a76](https://github.com/Melchyore/adoscope/commit/4886a76))



## [0.3.0](https://github.com/Melchyore/adoscope/compare/v0.2.1...v0.3.0) (2019-05-25)


### Features

* **adoscope:** recording can now be paused ([87eead1](https://github.com/Melchyore/adoscope/commit/87eead1))
* **app:** add .ts files for controllers ([e3e8b9c](https://github.com/Melchyore/adoscope/commit/e3e8b9c))
* **config:** add new watchers to config ([f6cb67a](https://github.com/Melchyore/adoscope/commit/f6cb67a))
* **exceptions:** add more exceptions and refactor older ones ([433284d](https://github.com/Melchyore/adoscope/commit/433284d))
* **provider:** monkey patch Adonis/Server and refactor some code ([f8c0619](https://github.com/Melchyore/adoscope/commit/f8c0619))
* **services:** make use of WebSocket controller to send data ([87c0b24](https://github.com/Melchyore/adoscope/commit/87c0b24))
* **utils:** add new methods for parsing exceptions and logs watchers ([361a487](https://github.com/Melchyore/adoscope/commit/361a487))
* **watchers:** add exceptions and log watchers ([1475241](https://github.com/Melchyore/adoscope/commit/1475241))
* **watchers:** watchers base class is now abstract ([16e9a65](https://github.com/Melchyore/adoscope/commit/16e9a65))


### Tests

* add new watchers tests ([c18054c](https://github.com/Melchyore/adoscope/commit/c18054c))


### BREAKING CHANGES

* **config:** Config file must be updated



### [0.2.1](https://github.com/Melchyore/adoscope/compare/v0.2.0...v0.2.1) (2019-05-20)



## [0.2.0](https://github.com/Melchyore/adoscope/compare/v0.1.0...v0.2.0) (2019-05-17)


### Bug Fixes

* **watchers:** handle not found/invalid models ([e49d117](https://github.com/Melchyore/adoscope/commit/e49d117))
* **watchers:** initialize _statements property in QueryWatcher ([f7c69d8](https://github.com/Melchyore/adoscope/commit/f7c69d8))


### Features

* **adoscope:** watchers can be enabled/disabled via config file ([c806e27](https://github.com/Melchyore/adoscope/commit/c806e27))
* **exceptions:** add new exceptions ([ae447f0](https://github.com/Melchyore/adoscope/commit/ae447f0))
* **exceptions:** add new exceptions for ModelWatcher ([a17edb3](https://github.com/Melchyore/adoscope/commit/a17edb3))
* **types:** add new types ([8395988](https://github.com/Melchyore/adoscope/commit/8395988))
* **watchers:** add type getter and ignore adoscope's model by default ([08d5559](https://github.com/Melchyore/adoscope/commit/08d5559))


### Tests

* **watchers:** update tests to suit new features ([f35559f](https://github.com/Melchyore/adoscope/commit/f35559f))


### BREAKING CHANGES

* **adoscope:** Config file must be updated since keys has been updated or run instructions file



## [0.1.0](https://github.com/Melchyore/adoscope/compare/v0.0.15...v0.1.0) (2019-05-16)


### Features

* **contracts:** add more types to Contracts.ts ([9d00fc3](https://github.com/Melchyore/adoscope/commit/9d00fc3))
* **entryservice.ts:** add more methods ([c045734](https://github.com/Melchyore/adoscope/commit/c045734))
* **entrytype.ts:** add more entries types ([c70699a](https://github.com/Melchyore/adoscope/commit/c70699a))
* **exceptions:** add exceptions ([146c37b](https://github.com/Melchyore/adoscope/commit/146c37b))
* **models:** add Jsonify trait ([3c043db](https://github.com/Melchyore/adoscope/commit/3c043db))
* **providers:** add monkey patches ([4741364](https://github.com/Melchyore/adoscope/commit/4741364))
* **watcher.ts:** add more methods, refactoring ([9f64789](https://github.com/Melchyore/adoscope/commit/9f64789))
* **watchers:** add Model/Schedule/View watchers ([94236ef](https://github.com/Melchyore/adoscope/commit/94236ef))


### Tests

* **app:** add remaining watchers tests ([4001160](https://github.com/Melchyore/adoscope/commit/4001160))
