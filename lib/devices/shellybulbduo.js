
/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';

function intToHex(number) {
  if (!number) number = 0;
  let hex = number.toString(16);
  hex = ('00' + hex).slice(-2).toUpperCase(); // 'a' -> '0A'
  return hex;
}

function hextoInt(hex) {
  if (!hex) hex = '00';
  return parseInt(hex, 16);
}

async function getRGBW(self) {
  let id = self.getDeviceName();
  let stateId;
  let state;
  stateId = id + '.lights.red';
  state = await self.adapter.getStateAsync(stateId);
  let valred = state ? state.val : 0;
  stateId = id + '.lights.green';
  state = await self.adapter.getStateAsync(stateId);
  let valgreen = state ? state.val : 0;
  stateId = id + '.lights.blue';
  state = await self.adapter.getStateAsync(stateId);
  let valblue = state ? state.val : 0;
  stateId = id + '.lights.white';
  state = await self.adapter.getStateAsync(stateId);
  let valwhite = state ? state.val : 0;
  return '#' + intToHex(valred) + intToHex(valgreen) + intToHex(valblue) + intToHex(valwhite);
}

async function getLightsObject(self) {
  let id = self.getDeviceName();
  let obj = {
    'ison': 'lights.Switch',
    'white': 'lights.white',
    'temp': 'lights.temp',
    'brightness': 'lights.brightness'
  };
  for (let i in obj) {
    let stateId = id + '.' + obj[i];
    let state = await self.adapter.getStateAsync(stateId);
    obj[i] = state ? state.val : undefined;
  }
  return obj;
}

/**
 * get the value of the key, Example: getCoapValue(112, value.G) 
 * @param {integer} key - like 112
 * @param {array} array - [[0,111,0],[0,112,1]]
 */
function getCoapValue(key, array) {
  if (array) {
    for (let k in array) {
      if (array[k][1] === key) return array[k][2];
    }
  }
  return undefined;
}

/**
 * Shelly Bulb Duo
 */
let shellybulbduo = {
  'lights.Switch': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].ison === true : undefined },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/ShellyBulbDuo-<deviceid>/light/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/ShellyBulbDuo-<deviceid>/light/0/command',
      mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
    },
    common: {
      'name': 'Switch',
      'type': 'boolean',
      'role': 'switch',
      'read': true,
      'write': true,
      'def': false
    }
  },
  'lights.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    common: {
      'name': 'Auto Timer Off',
      'type': 'number',
      'role': 'level.timer',
      'def': 0,
      'unit': 's',
      'read': true,
      'write': true
    }
  },
  'lights.AutoTimerOn': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
      http_cmd: '/settings/light/0',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    common: {
      'name': 'Auto Timer Off',
      'type': 'number',
      'role': 'level.timer',
      'def': 0,
      'unit': 's',
      'read': true,
      'write': true
    }
  },
  'lights.white': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].white : undefined },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return { white: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/ShellyBulbDuo-<deviceid>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).white : undefined; },
      mqtt_cmd: 'shellies/ShellyBulbDuo-<deviceid>/light/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'White',
      'type': 'number',
      'role': 'level.color.white',
      'read': true,
      'write': true
    }
  },
  'lights.temp': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].temp : undefined },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return { temp: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/ShellyBulbDuo-<deviceid>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).temp : undefined; },
      mqtt_cmd: 'shellies/ShellyBulbDuo-<deviceid>/light/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Temperature',
      'type': 'number',
      'role': 'level.temperature',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100
    }
  },
  'lights.brightness': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].brightness : undefined },
      http_cmd: '/light/0',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/ShellyBulbDuo-<deviceid>/light/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/ShellyBulbDuo-<deviceid>/light/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Brightness',
      'type': 'number',
      'role': 'level.brightness',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100
    }
  }
};

module.exports = {
  shellybulbduo: shellybulbduo
};
