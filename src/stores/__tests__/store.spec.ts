import { Store, Getter, Mutation, Action, State } from '../store';

interface SomeData {
  foo: string;
  bar?: number;
}

@Store
class SomeDataStore {
  @State({
    mutationName: 'CustomSetterMutationName',
  })
  public name = 'abc';

  @State()
  public data: SomeData = {
    foo: 'bar',
  };

  public getStore() {
    return (SomeDataStore as any).store;
  }

  @Getter()
  public foobar() {
    return this.data.foo + this.data.bar || 42;
  }

  @Mutation({
    name: 'CustomMutation',
  })
  public customMutation(name: string) {
    this.name = name;
  }

  @Mutation()
  public dostuff(a: number, value: string) {
    this.data.bar = a;
    this.data.foo = value;
  }
}

const store = new SomeDataStore();

describe('Store annotations', () => {
  beforeEach(() => {
    store.data = {
      foo: 'bar',
    };
  });

  test('initializes', async () => {
    expect(store.data).toEqual({
      foo: 'bar',
    });
  });

  test('Multiple instances share same vuex', async () => {
    const a = new SomeDataStore();
    const b = new SomeDataStore();
    const c = new SomeDataStore();

    expect(a.data).toEqual({ foo: 'bar' });

    store.data = {
      foo: 'foo',
    };

    expect(store.data).toEqual({ foo: 'foo' });
    expect(a.data).toEqual({ foo: 'foo' });
    expect(b.data).toEqual({ foo: 'foo' });
    expect(c.data).toEqual({ foo: 'foo' });
  });

  test('has automatic setter mutation support', async () => {
    (SomeDataStore as any).store.commit('SOME_DATA_STORE_SET_DATA', { foo: 'x' });
    expect(store.data).toEqual({ foo: 'x' });
  });

  test('has automatic setter mutation support as setters', async () => {
    store.data = { foo: 'bar2' };
    expect(store.data).toEqual({ foo: 'bar2' });
  });

  test('has mutation support with custom functions', async () => {
    (SomeDataStore as any).store.commit('CustomMutation', ['zxc']);
    expect(store.name).toEqual('zxc');
    store.customMutation('1');
    expect(store.name).toEqual('1');
  });

  test('has mutation support', async () => {
    (SomeDataStore as any).store.commit('SOME_DATA_STORE_DOSTUFF', [43, 'z']);
    expect(store.data).toEqual({ bar: 43, foo: 'z' });
    (SomeDataStore as any).store.commit('CustomSetterMutationName', 'qwe');
    expect(store.name).toEqual('qwe');
  });

  test('has getter support', async () => {
    store.data = {
      foo: 'a',
      bar: 10,
    };

    expect(store.foobar()).toEqual('a10');
  });

  test('mutations should be functions', () => {
    expect(() => Mutation()({}, 'value', {
      value: 'some string',
    })).toThrowError(/should be a function/);
  });

  test('actions should be functions', () => {
    expect(() => Action()({}, 'value', {
      value: 'some string',
    })).toThrowError(/should be a function/);
  });

  test('actions', () => {
    expect(() => Action()({}, 'value', {
      value: () => 5,
    })).not.toThrow();
  });

  test('getters should be functions', () => {
    expect(() => Getter()({}, 'value', {
      value: 'some string',
    })).toThrowError(/should be a function/);
  });

  test('getters should have no parameters', () => {
    expect(() => Getter()({}, 'value', {
      value: (x: any) => 5,
    })).toThrowError(/should have no parameters/);
  });
});
