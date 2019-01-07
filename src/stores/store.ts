import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);
const StoreConfigFieldName = '_storeconfig';


type StoreConstructor = new(...args: any[]) => {};

export function Store<T extends StoreConstructor>(constructor: T) {
    return class extends constructor {
      public store: any;

      constructor(...args: any[]) {
        super();
        const ClassName = this.constructor.prototype.__proto__.constructor.name;
        const config = (this as any)._storeconfig;
        this.store = new Vuex.Store({
          ..._.cloneDeep(config),
          strict: process.env.NODE_ENV !== 'production',
        });

        // Override states
        _.forEach(config.state, (v, k) => {
          const mutationName = _.toUpper(ClassName) + '_SET_' + _.toUpper(k);

          Object.defineProperty(this, k, {
            enumerable: true,
            configurable: false,
            // Only for initial configuration
            get() {
              return this.store.state[k];
            },
            set(newValue) {
              this.store.commit(mutationName, newValue);
            },
          });
        });

      }
    };
}


function targetStoreConfig(target: object): any {
  if (!(target as any)[StoreConfigFieldName]) {
    Object.defineProperty(target, StoreConfigFieldName, {
      enumerable: false,
      writable: false,
      configurable: false,
      value: {
        state: {},
        mutations: {},
        getters: {},
        actions: {},
        plugins: [],
      },
    });
  }
  return (target as any)[StoreConfigFieldName];
}


export function State() {
  return (target: object, key: string) => {
    const storeconfig = targetStoreConfig(target);
    const className = target.constructor.name;
    const capitalKey = _.capitalize(key);
    const setterName = 'set' + capitalKey;
    const getterName = 'get' + capitalKey;
    const mutationName = _.toUpper(className) + '_SET_' + _.toUpper(key);

    // Initial configuration property
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: false,

      // Only for initial configuration
      get() {
        return storeconfig.state.tiedot;
      },
      set(newValue) {
        storeconfig.state.tiedot = newValue;
      },
    });

    // Add default mutation
    storeconfig.mutations[mutationName] = (state: any, value: any) => {
      state[key] = value;
    };
  };
}


export function Mutation() {
  return (target: any, key: string, descriptor: any) => {
    if (!_.isFunction(descriptor.value)) {
      throw new Error(`Mutation method should be a function: ${key}`);
    }
    if (descriptor.value.length !== 1) {
      throw new Error(`Mutation method should have one parameter: ${key}`);
    }
  };
}


export function Action() {
  return (target: any, key: string, descriptor: any) => {
    if (!_.isFunction(descriptor.value)) {
      throw new Error(`Mutation method should be a function: ${key}`);
    }
  };
}
