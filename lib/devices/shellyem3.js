/* jshint -W097 */
/* jshint -W030 */
/* jshint strict:true */
/* jslint node: true */
/* jslint esversion: 6 */
'use strict';


/**
 * get the value of the key
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

async function getTotalSumm(self) {
  let calctotal = 0.00;
  let TotalPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Total');
  let TotalPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Total');
  let TotalPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Total');
  calctotal = (TotalPhase1.val + TotalPhase2.val + TotalPhase3.val);
  calctotal = Math.round(calctotal * 100) / 100;
  return calctotal;
}

async function getCurrentSumm(self) {
  let calccurrent = 0.00;
  let CurrentPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Current');
  let CurrentPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Current');
  let CurrentPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Current');
  calccurrent = (CurrentPhase1.val + CurrentPhase2.val + CurrentPhase3.val);
  calccurrent = Math.round(calccurrent * 100) / 100;
  return calccurrent;
}

async function getPowerSumm(self) {
  let calcPower= 0.00;
  let PowerPhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Power');
  let PowerPhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Power');
  let PowerPhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Power');
  calcPower = (PowerPhase1.val + PowerPhase2.val + PowerPhase3.val);
  calcPower = Math.round(calcPower * 100) / 100;
  return calcPower;
}

async function getVoltageCalc(self, vtype) {
  let calcVoltage= 0.00;
  let VoltagePhase1 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter0.Voltage');
  let VoltagePhase2 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter1.Voltage');
  let VoltagePhase3 = await self.adapter.getStateAsync(self.getDeviceName() + '.Emeter2.Voltage');
  if(vtype == 'mean'){
    calcVoltage = ((VoltagePhase1.val + VoltagePhase2.val + VoltagePhase3.val) / 3);
  }else{
    calcVoltage = ((VoltagePhase1.val + VoltagePhase2.val + VoltagePhase3.val) / Math.sqrt(3));
  }
  
  calcVoltage = Math.round(calcVoltage * 100) / 100;
  return calcVoltage;
}

let shellyem3 = {
  'Relay0.Switch': {
    coap: {
      // coap_publish_funct: (value) => { return value.G[0][2] === 1 ? true : false; },
      coap_publish_funct: (value) => { return getCoapValue(112, value.G) == 1 ? true : false; },
      http_cmd: '/relay/0',
      http_cmd_funct: (value) => { return value === true ? { turn: 'on' } : { turn: 'off' }; },
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/relay/0',
      mqtt_cmd: 'shellies/shellyem3-<deviceid>/relay/0/command',
      mqtt_cmd_funct: (value) => { return value === true ? 'on' : 'off'; },
      mqtt_publish_funct: (value) => { return value === 'on'; }
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
  'Relay0.AutoTimerOff': {
    coap: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
      http_cmd: '/settings/relay/0',
      http_cmd_funct: (value) => { return { auto_off: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_off : undefined; },
      http_cmd: '/settings/relay/0',
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
  'Relay0.AutoTimerOn': {
    coap: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
      http_cmd_funct: (value) => { return { auto_on: value }; }
    },
    mqtt: {
      http_publish: '/settings',
      http_cmd: '/settings/relay/0',
      http_publish_funct: (value) => { return value ? JSON.parse(value).relays[0].auto_on : undefined; },
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
  'Emeter0.Power': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      coap_publish_funct: (value) => { return (Math.round(getCoapValue(111, value.G) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Power',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'W'
    }
  },
  'Emeter0.Total': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).emeters[0].total / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/total'
    },
    common: {
      'name': 'Total',
      'type': 'number',
      'role': 'value.total',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter0.Total_Returned': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round((JSON.parse(value).emeters[0].total_returned / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/total_returned'
    },
    common: {
      'name': 'Total_Returned',
      'type': 'number',
      'role': 'value.total_returned',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter0.PowerFactor': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].pf * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/pf',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Power Factor',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false,
      'def': 0
    }
  },
  'Emeter0.Voltage': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].voltage * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/0/voltage',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Voltage',
      'type': 'number',
      'role': 'value.voltage',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  },
  'Emeter0.Current': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].current * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[0].current * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Current',
      'type': 'number',
      'role': 'value.current',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'A'
    }
  },
  'Emeter1.Power': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      coap_publish_funct: (value) => { return (Math.round(getCoapValue(121, value.G) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Power',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'W'
    }
  },
  'Emeter1.Total': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? ((Math.round(JSON.parse(value).emeters[1].total / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/total'
    },
    common: {
      'name': 'Total',
      'type': 'number',
      'role': 'value.total',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter1.Total_Returned': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? ((Math.round(JSON.parse(value).emeters[1].total_returned / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/total_returned'
    },
    common: {
      'name': 'Total_Returned',
      'type': 'number',
      'role': 'value.total_returned',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter1.PowerFactor': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].pf * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/pf',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Power Factor',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false,
      'def': 0
    }
  },
  'Emeter1.Voltage': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].voltage * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/1/voltage',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Voltage',
      'type': 'number',
      'role': 'value.voltage',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  },
  'Emeter1.Current': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].current * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[1].current * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Current',
      'type': 'number',
      'role': 'value.current',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'A'
    }
  },
  'Emeter2.Power': {
    coap: {
      // coap_publish_funct: (value) => {  return (Math.round(value.G[2][2] * 100) / 100); }
      coap_publish_funct: (value) => { return (Math.round(getCoapValue(131, value.G) * 100) / 100); }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/power',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Power',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'W'
    }
  },
  'Emeter2.Total': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? ((Math.round(JSON.parse(value).emeters[2].total / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/total'
    },
    common: {
      'name': 'Total',
      'type': 'number',
      'role': 'value.total',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter2.Total_Returned': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? ((Math.round(JSON.parse(value).emeters[2].total_returned / 1000) * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/total_returned'
    },
    common: {
      'name': 'Total_Returned',
      'type': 'number',
      'role': 'value.total_returned',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Emeter2.PowerFactor': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].pf * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/pf',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Power Factor',
      'type': 'number',
      'role': 'value',
      'read': true,
      'write': false,
      'def': 0
    }
  },
  'Emeter2.Voltage': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].voltage * 100) / 100) : undefined; }
    },
    mqtt: {
      mqtt_publish: 'shellies/shellyem3-<deviceid>/emeter/2/voltage',
      mqtt_publish_funct: (value) => { return (Math.round(value * 100) / 100); }
    },
    common: {
      'name': 'Voltage',
      'type': 'number',
      'role': 'value.voltage',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  },
  'Emeter2.Current': {
    coap: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].current * 100) / 100) : undefined; }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: (value) => { return value ? (Math.round(JSON.parse(value).emeters[2].current * 100) / 100) : undefined; }
    },
    common: {
      'name': 'Current',
      'type': 'number',
      'role': 'value.current',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'A'
    }
  },
   'Total.ConsumedPower': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getTotalSumm(self); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getTotalSumm(self); }
    },
    common: {
      'name': 'Total consumed energy',
      'type': 'number',
      'role': 'value.totalconsumed',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'kWh'
    }
  },
  'Total.Current': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getCurrentSumm(self); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getCurrentSumm(self); }
    },
    common: {
      'name': 'Total Current',
      'type': 'number',
      'role': 'value.current',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'A'
    }
  },
  'Total.InstantPower': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getPowerSumm(self); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getPowerSumm(self); }
    },
    common: {
      'name': 'Total Instantaneous power',
      'type': 'number',
      'role': 'value.power',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'W'
    }
  },
  'Total.VoltageMean': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getVoltageCalc(self, 'mean'); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getVoltageCalc(self, 'mean'); }
    },
    common: {
      'name': 'Voltage Mean',
      'type': 'number',
      'role': 'value.voltagemean',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  },
  'Total.Voltage': {
    coap: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getVoltageCalc(self, 'total'); }
    },
    mqtt: {
      http_publish: '/status',
      http_publish_funct: async (value, self) => { return getVoltageCalc(self, 'total'); }
    },
    common: {
      'name': 'Voltage Total',
      'type': 'number',
      'role': 'value.voltage',
      'read': true,
      'write': false,
      'def': 0,
      'unit': 'V'
    }
  }
};

module.exports = {
  shellyem3: shellyem3
};