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

async function getMode(self) {
  let id = self.getDeviceName();
  let stateId = id + '.mode';
  let state = await self.adapter.getStateAsync(stateId);
  return state ? state.val : undefined;
}

async function getRGBW(self) {
  let id = self.getDeviceName();
  let stateId;
  let state;
  stateId = id + '.color.red';
  state = await self.adapter.getStateAsync(stateId);
  let valred = state ? state.val : 0;
  stateId = id + '.color.green';
  state = await self.adapter.getStateAsync(stateId);
  let valgreen = state ? state.val : 0;
  stateId = id + '.color.blue';
  state = await self.adapter.getStateAsync(stateId);
  let valblue = state ? state.val : 0;
  stateId = id + '.color.white';
  state = await self.adapter.getStateAsync(stateId);
  let valwhite = state ? state.val : 0;
  return '#' + intToHex(valred) + intToHex(valgreen) + intToHex(valblue) + intToHex(valwhite);
}

function getColorsFromRGBW(value) {
  value = value || '#00000000';
  let obj = {
    red: hextoInt(value.substr(1, 2)),
    green: hextoInt(value.substr(3, 2)),
    blue: hextoInt(value.substr(5, 2)),
    white: hextoInt(value.substr(7, 2))
  };
  return obj;
}

async function getLightsObject(self) {
  let id = self.getDeviceName();
  let obj = {
    'red': 'color.red',
    'green': 'color.green',
    'blue': 'color.blue',
    'white': 'color.white',
    'gain': 'color.gain',
    'effect': 'color.effect'
  };
  for (let i in obj) {
    let stateId = id + '.' + obj[i];
    let state = await self.adapter.getStateAsync(stateId);
    obj[i] = state ? state.val : undefined;
  }
  return obj;
}

/**
 * Shelly RGBW2
 */
let shellyrgbw2 = {
  'color.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'color') return value.G[5][2] === 1 ? true : false; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0',
      mqtt_publish_funct: (value) => { return value === 'on'; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/command',
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
  'color.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
      http_cmd: '/settings/color/0',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_off : undefined; },
      http_cmd: '/settings/color/0',
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
  'color.AutoTimerOn': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
      http_cmd: '/settings/color/0',
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).lights[0].auto_on : undefined; },
      http_cmd: '/settings/color/0',
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
  'color.red': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'color') return value.G[0][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { red: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).red : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Red',
      'type': 'number',
      'role': 'level.color.red',
      'read': true,
      'write': true,
      'min': 0,
      'max': 255
    }
  },
  'color.green': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'color') return value.G[1][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { green: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).green : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Green',
      'type': 'number',
      'role': 'level.color.green',
      'read': true,
      'write': true,
      'min': 0,
      'max': 255
    }
  },
  'color.blue': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'color') return value.G[2][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { blue: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).blue : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Blue',
      'type': 'number',
      'role': 'level.color.blue',
      'read': true,
      'write': true,
      'min': 0,
      'max': 255
    }
  },
  'color.white': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'color') return value.G[3][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { white: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).white : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'White',
      'type': 'number',
      'role': 'level.color.white',
      'read': true,
      'write': true,
      'min': 0,
      'max': 255
    }
  },
  'color.gain': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'color') return value.G[4][2]; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { gain: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).gain : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Gain',
      'type': 'number',
      'role': 'level.brightness',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100
    }
  },
  'color.effect': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: (value) => { return { effect: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).effect : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(await getLightsObject(self)); }
    },
    common: {
      'name': 'Effect',
      'type': 'number',
      'role': 'state',
      'read': true,
      'write': true,
      'min': 0,
      'max': 100,
      'states': '0:Off;1:Meteor Shower;2:Gradual Change;3:Breath;4:Flash;5:On/Off Gradual;6:Red/Green Change'
    }
  },
  'color.rgbw': {
    coap: {
      http_publish: '/color/0',
      http_publish_funct: async (value, self) => { return await getRGBW(self) || undefined; },
      http_cmd: '/color/0',
      http_cmd_funct: async (value, self) => { return getColorsFromRGBW(value); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/color/0/status',
      mqtt_publish_funct: async (value, self) => { return await getRGBW(self) || undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/color/0/set',
      mqtt_cmd_funct: async (value, self) => { return JSON.stringify(getColorsFromRGBW(value)); }
    },
    common: {
      'name': 'Color RGBW',
      'type': 'string',
      'role': 'level.color.rgb',
      'read': false,
      'write': true
    }
  },
  'white0.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'white') return value.G[4][2] === 1 ? true : false; },
      http_cmd: '/white/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/0/status',
      mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/0/set',
      mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
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
  'white0.brightness': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'white') return value.G[0][2]; },
      http_cmd: '/white/0',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/0/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/0/set',
      mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
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
  },
  'white1.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'white') return value.G[5][2] === 1 ? true : false; },
      http_cmd: '/white/1',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/1/status',
      mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/1/set',
      mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
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
  'white1.brightness': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'white') return value.G[1][2]; },
      http_cmd: '/white/1',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/1/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/1/set',
      mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
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
  },
  'white2.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'white') return value.G[6][2] === 1 ? true : false; },
      http_cmd: '/white/2',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/2/status',
      mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/2/set',
      mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
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
  'white2.brightness': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'white') return value.G[2][2]; },
      http_cmd: '/white/2',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/2/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/2/set',
      mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
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
  },
  'white3.Switch': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'white') return value.G[7][2] === 1 ? true : false; },
      http_cmd: '/white/3',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/3/status',
      mqtt_publish_funct: (value) => { return value && JSON.parse(value).ison === true; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/3/set',
      mqtt_cmd_funct: (value) => { return JSON.stringify({ turn: value === true ? 'on' : 'off' }); }
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
  'white3.brightness': {
    coap: {
      coap_publish_funct: async (value, self) => { if ((await getMode(self)) === 'white') return value.G[3][2]; },
      http_cmd: '/white/3',
      http_cmd_funct: (value) => { return { brightness: value }; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/white/3/status',
      mqtt_publish_funct: (value) => { return value ? JSON.parse(value).brightness : undefined; },
      mqtt_cmd: 'shellies/shellyrgbw2-<deviceid>/white/3/set',
      mqtt_cmd_funct: async (value) => { return JSON.stringify({ brightness: value }); }
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
  },
  'input': {
    coap: {
      no_display: true
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyrgbw2-<deviceid>/input/0',
      mqtt_publish_funct: (value) => { return value == 1 ? true : false; },
    },
    common: {
      'name': 'Input / Detach',
      'type': 'boolean',
      'role': 'state',
      'read': true,
      'write': false,
      'def': false
    }
  },
  'mode': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).mode : undefined; },
      http_cmd: '/settings',
      http_cmd_funct: (value) => { return { mode: value }; }
    },
    common: {
      'name': 'Modus',
      'type': 'string',
      'role': 'state',
      'read': true,
      'write': true,
      'states': 'color:color;white:white'
    }
  }
};

module.exports = {
  shellyrgbw2: shellyrgbw2
};
