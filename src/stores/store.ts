import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);
const StoreConfigFieldName = '_storeconfig';


type StoreConstructor = new(...args: any[]) => {};

function vuexCase(val: string) {
  return _.toUpper(_.snakeCase(val));
}

export function Store<T extends StoreConstructor>(constructor: T) {
    return class extends constructor {
      public store: any;

      constructor(...args: any[]) {
        super();
        const ClassName = this.constructor.prototype.__proto__.constructor.name;
        const config = (this as any)._storeconfig;
        const vuexConfig = {
          namespaced: true,
          strict: process.env.NODE_ENV !== 'production',
          state: config.state,
          mutations: {
            ...config.stateSetters,
            ..._.mapValues(config.mutations, ({ value }) =>
              (state: any, payload: any) =>
                value.apply(state, payload)),
          },
          getters: {
            ..._.mapValues(config.getters, (fn) =>
              (state: any) => fn.call(state)),
          },
        };

        this.store = new Vuex.Store(_.cloneDeep(vuexConfig));
        // console.log(this.store._mutations);
        // console.log(_.mapValues(config.mutations, 'value'));
        // console.log(this.store._mutations);

        // Override states
        _.forEach(config.state, (v, k) => {
          const mutationName = vuexCase(ClassName) + '_SET_' + vuexCase(k);

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

        // Override getters
        _.forEach(config.getters, (fn, k) => {
          Object.defineProperty(this, k, {
            enumerable: true,
            value: () => this.store.getters[k],
          });
        });

        // Override mutations
        _.forEach(config.mutations, (v, k) => {
          Object.defineProperty(this, v.key, {
            enumerable: false,
            value: (...payload: any[]) => {
              this.store.commit(k, payload);
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
        stateSetters: {},
        mutations: {},
        getters: {},
        actions: {},
        plugins: [],
      },
    });
  }
  return (target as any)[StoreConfigFieldName];
}


export interface StateConfig {
  mutationName?: string;
}


export function State(config?: StateConfig) {
  return (target: object, key: string) => {
    const storeconfig = targetStoreConfig(target);
    const mutationName = (config && config.mutationName)
      || vuexCase(target.constructor.name) + '_SET_' + vuexCase(key);

    // Initial configuration property
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: false,

      // Only for initial configuration
      get() {
        return storeconfig.state[key];
      },
      set(newValue) {
        storeconfig.state[key] = newValue;
      },
    });

    // Add default mutation
    storeconfig.stateSetters[mutationName] =
      (state: any, value: any) => {
        state[key] = value;
      };
  };
}


export interface MutationConfig {
  name?: string;
}

export function Mutation(config?: MutationConfig) {
  return (target: any, key: string, descriptor: any) => {
    const fn = descriptor.value;

    if (!_.isFunction(fn)) {
      throw new Error(`Mutation method should be a function: ${key}`);
    }

    const mutationName = (config && config.name)
      || vuexCase(target.constructor.name) + '_' + vuexCase(key);
    targetStoreConfig(target).mutations[mutationName] = {
      key,
      value: fn,
    };
  };
}


export function Getter() {
  return (target: any, key: string, descriptor: any) => {
    const fn = descriptor.value;

    if (!_.isFunction(fn)) {
      throw new Error(`Getter should be a function: ${key}`);
    }

    if (fn.length > 0) {
      throw new Error(`Getter should have no parameters: ${key}`);
    }

    targetStoreConfig(target).getters[key] = fn;
  };
}


export function Action() {
  return (target: any, key: string, descriptor: any) => {
    if (!_.isFunction(descriptor.value)) {
      throw new Error(`Mutation method should be a function: ${key}`);
    }
  };
}
