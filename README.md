# WideQ

[![npm version](https://badge.fury.io/js/wideq.svg)](https://badge.fury.io/js/wideq)
[![Build Status](https://travis-ci.org/ssut/wideq-js.svg?branch=master)](https://travis-ci.org/ssut/wideq-js)

A Node.JS port of [wideq](https://github.com/sampsyo/wideq).

```bash
# To get started
$ npm install wideq
```

## Why WideQ.js

`wideq.js` is a pure javascript rewrite of the original `wideq` library (written in Python). It has a great support for working with SmartThinQ devices, but I wanted to connect it to [HomeBridge](https://github.com/nfarina/homebridge) without python processes, so this is why I've created `wideq.js`.

## Highlights

- All possible asynchronous functions return Promise.
- Better development experience with TypeScript typings.

## CLI Usage

```bash
$ wideq
Usage: WideQJS [options] [command]

Options:
  -V, --version            output the version number
  -C, --country <type>     Country code for account (default: "US")
  -l, --language <type>    Language code for account (default: "en-US")
  -S, --state-path <type>  State file path (default: "wideq-state.json")
  -h, --help               output usage information

Commands:
  auth                     Authenticate
  ls                       List devices
  monitor <deviceId>       Monitor any device, displaying generic information about its status.

$ wideq ls
00000000-0000-0000-0000-000000000000: 제습기 (DEHUMIDIFIER DHUM_056905_WW)

$ wideq monitor 00000000-0000-0000-0000-000000000000
polling...
no status
polling...
no status
polling...
- mode: @AP_MAIN_MID_OPMODE_SMART_DEHUM_W
- windStrength: @AP_MAIN_MID_WINDSTRENGTH_DHUM_HIGH_W
- isAirRemovalOn: true
- targetHumidity: 50
- currentHumidity: 50
- isOn: true
```

## Implementation Status

| *Device* | *Implementation* | *Control* | *Status* |
| --- | --- | --- | --- |
| Dehumidifier | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| AC | :heavy_check_mark: | :warning: needs testing | :warning: needs testing |
| Refrigerator | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| Dishwasher | :x: | :x: | :x: |
| Dryer | :x: | :x: | :x: |
| Washer | :x: | :x: | :x: |

## Credits

This is like a slightly modified(ported) version of [wideq](https://github.com/sampsyo/wideq). Some APIs could be very different.
