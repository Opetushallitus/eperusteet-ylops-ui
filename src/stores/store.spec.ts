import { Store, Getter, Mutation, Action, State } from './store';

interface SomeData {
  foo: string;
  bar?: number;
}

@Store
class SomeDataStore {
  @State()
  public data: SomeData = {
    foo: 'bar',
  };

  @Getter()
  public foobar() {
    return this.data.foo + this.data.bar || 42;
  }

  @Mutation()
  public dostuff(a: number, value: string) {
    this.data.bar = a;
    this.data.foo = value;
  }
}

describe('Store annotations', () => {
  const store = new SomeDataStore();

  it('initializes', async () => {
    expect(store.data).toEqual({
      foo: 'bar',
    });
  });

  it('has automatic setter mutation support', async () => {
    (store as any).store.commit('SOME_DATA_STORE_SET_DATA', { foo: 'x' });
    expect(store.data).toEqual({ foo: 'x' });
  });

  it('has automatic setter mutation support as setters', async () => {
    store.data = { foo: 'bar2' };
    expect(store.data).toEqual({ foo: 'bar2' });
  });

  it('has mutation support with custom functions', async () => {
    store.dostuff(42, 'foobar');
  });

  it('has mutation support', async () => {
    (store as any).store.commit('SOME_DATA_STORE_DOSTUFF', [43, 'z']);
    expect(store.data).toEqual({ bar: 43, foo: 'z' });
  });

  it('has getter support', async () => {
    store.data = {
      foo: 'a',
      bar: 10,
    };

    expect(store.foobar()).toEqual('a10');
  });

});
