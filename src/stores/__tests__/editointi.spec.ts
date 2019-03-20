import { RevisionDto } from '@/tyypit';

import {
  editointi,
  EditointiKontrolli,
  EditointiKontrolliConfig,
} from '../editointi';

describe('Editointi', async () => {
  describe('Hooks', async () => {
    test('All hooks are called', async () => {
      let data = {
        field: 'foo',
      };

      const config: EditointiKontrolliConfig = {
        source: {
          async save(newData: any) {
            data = newData;
          },
          async load() {
            return data;
          },
          async cancel() {},
        },
        locks: {
          async acquire() {
            return true;
          },
          async release() {},
        },
        history: {
          async items() {
            return [];
          },
          async restore(rev: RevisionDto) { },
        },
        async start() {},
        async remove() {},
        async validate() {
          return true;
        },
      };

      const removeSpy = jest.spyOn(config, 'remove');
      const validateSpy = jest.spyOn(config, 'validate');
      const startSpy = jest.spyOn(config, 'start');
      const saveSpy = jest.spyOn(config.source, 'save');
      const loadSpy = jest.spyOn(config.source, 'load');
      const cancelSpy = jest.spyOn(config.source, 'cancel');

      // TODO
      const historySpy = jest.spyOn(config.history!, 'items');
      const historyReleaseSpy = jest.spyOn(config.history!, 'restore');
      const lockAcquire = jest.spyOn(config.locks!, 'acquire');
      const lockRelease = jest.spyOn(config.locks!, 'release');

      const editor = editointi(config);
      await editor.init();
      expect(loadSpy).toBeCalledTimes(1);
      expect(startSpy).toBeCalledTimes(0);
      expect(saveSpy).toBeCalledTimes(0);
      expect(cancelSpy).toBeCalledTimes(0);
      expect(removeSpy).toBeCalledTimes(0);
      expect(validateSpy).toBeCalledTimes(0);

      await editor.start();
      expect(loadSpy).toBeCalledTimes(2);
      expect(startSpy).toBeCalledTimes(1);
      expect(saveSpy).toBeCalledTimes(0);
      expect(cancelSpy).toBeCalledTimes(0);
      expect(removeSpy).toBeCalledTimes(0);
      expect(validateSpy).toBeCalledTimes(0);

      await editor.cancel();
      expect(loadSpy).toBeCalledTimes(2);
      expect(startSpy).toBeCalledTimes(1);
      expect(saveSpy).toBeCalledTimes(0);
      expect(cancelSpy).toBeCalledTimes(1);
      expect(removeSpy).toBeCalledTimes(0);
      expect(validateSpy).toBeCalledTimes(0);

      await editor.start();
      expect(loadSpy).toBeCalledTimes(3);
      expect(startSpy).toBeCalledTimes(2);
      expect(saveSpy).toBeCalledTimes(0);
      expect(cancelSpy).toBeCalledTimes(1);
      expect(removeSpy).toBeCalledTimes(0);
      expect(validateSpy).toBeCalledTimes(0);

      await editor.save();
      expect(loadSpy).toBeCalledTimes(3);
      expect(startSpy).toBeCalledTimes(2);
      expect(saveSpy).toBeCalledTimes(1);
      expect(cancelSpy).toBeCalledTimes(1);
      expect(removeSpy).toBeCalledTimes(0);
      expect(validateSpy).toBeCalledTimes(1);

      await editor.start();
      expect(loadSpy).toBeCalledTimes(4);
      expect(startSpy).toBeCalledTimes(3);
      expect(saveSpy).toBeCalledTimes(1);
      expect(cancelSpy).toBeCalledTimes(1);
      expect(removeSpy).toBeCalledTimes(0);
      expect(validateSpy).toBeCalledTimes(1);

      await editor.remove();
      expect(loadSpy).toBeCalledTimes(4);
      expect(startSpy).toBeCalledTimes(3);
      expect(saveSpy).toBeCalledTimes(1);
      expect(cancelSpy).toBeCalledTimes(1);
      expect(removeSpy).toBeCalledTimes(1);
      expect(validateSpy).toBeCalledTimes(1);

      const warnSpy = jest.spyOn(console, 'warn')
        .mockImplementationOnce(() => {});
      expect(warnSpy).not.toBeCalled();
    });
  });
});
