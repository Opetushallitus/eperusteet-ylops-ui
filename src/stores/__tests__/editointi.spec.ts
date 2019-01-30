import { editointi, EditointiKontrolli } from '../editointi';

describe('Editointi', async () => {
  describe('Tyhjä config', async () => {
    test('Start', async () => {
      const editor = editointi();
      expect(editor.isEditing).toBe(false);
      await editor.start();
      expect(editor.isEditing).toBe(true);
    });

    test('Cancel', async () => {
      const editor = editointi();
      expect(editor.isEditing).toBe(false);
      await editor.start();
      await editor.cancel();
      expect(editor.isEditing).toBe(false);
    });

    test('Save', async () => {
      const editor = editointi();
      expect(editor.isEditing).toBe(false);
      await editor.start();
      await editor.save();
      expect(editor.isEditing).toBe(false);
    });

    test('Validation', async () => {
      const editor = editointi();
      expect(editor.isEditing).toBe(false);
      expect(await editor.validate()).toBe(true);
      expect(editor.isEditing).toBe(false);
    });

    test('Poisto', async () => {
      const editor = editointi();
      await editor.start();
      await editor.remove();
      expect(editor.isEditing).toBe(false);
      const warnSpy = jest.spyOn(console, 'warn')
        .mockImplementationOnce(() => {});
      await editor.start();
      expect(warnSpy).toBeCalled();
      expect(editor.isEditing).toBe(false);
    });

    describe('Validointi', () => {
      test('Epäonnistunut validointi', async () => {
        const editor = editointi({
          validate: async () => false,
        });

        await editor.start();
        await editor.save();
        expect(editor.isEditing).toBe(true);
      });
    });

    describe('Hooks', async () => {
      beforeEach(() => {

      });

      test('All hooks are called', async () => {
        const config = {
          start: async () => {},
          save: async () => {},
          cancel: async () => {},
          remove: async () => {},
          validate: async () => true,
        };

        const startSpy = jest.spyOn(config, 'start');
        const saveSpy = jest.spyOn(config, 'save');
        const cancelSpy = jest.spyOn(config, 'cancel');
        const removeSpy = jest.spyOn(config, 'remove');
        const validateSpy = jest.spyOn(config, 'validate');

        const editor = editointi(config);
        expect(startSpy).toBeCalledTimes(0);
        expect(saveSpy).toBeCalledTimes(0);
        expect(cancelSpy).toBeCalledTimes(0);
        expect(removeSpy).toBeCalledTimes(0);
        expect(validateSpy).toBeCalledTimes(0);

        await editor.start();
        expect(startSpy).toBeCalledTimes(1);
        expect(saveSpy).toBeCalledTimes(0);
        expect(cancelSpy).toBeCalledTimes(0);
        expect(removeSpy).toBeCalledTimes(0);
        expect(validateSpy).toBeCalledTimes(0);

        await editor.cancel();
        expect(startSpy).toBeCalledTimes(1);
        expect(saveSpy).toBeCalledTimes(0);
        expect(cancelSpy).toBeCalledTimes(1);
        expect(removeSpy).toBeCalledTimes(0);
        expect(validateSpy).toBeCalledTimes(0);

        await editor.start();
        expect(startSpy).toBeCalledTimes(2);
        expect(saveSpy).toBeCalledTimes(0);
        expect(cancelSpy).toBeCalledTimes(1);
        expect(removeSpy).toBeCalledTimes(0);
        expect(validateSpy).toBeCalledTimes(0);

        await editor.save();
        expect(startSpy).toBeCalledTimes(2);
        expect(saveSpy).toBeCalledTimes(1);
        expect(cancelSpy).toBeCalledTimes(1);
        expect(removeSpy).toBeCalledTimes(0);
        expect(validateSpy).toBeCalledTimes(1);

        await editor.start();
        expect(startSpy).toBeCalledTimes(3);
        expect(saveSpy).toBeCalledTimes(1);
        expect(cancelSpy).toBeCalledTimes(1);
        expect(removeSpy).toBeCalledTimes(0);
        expect(validateSpy).toBeCalledTimes(1);

        await editor.remove();
        expect(startSpy).toBeCalledTimes(3);
        expect(saveSpy).toBeCalledTimes(1);
        expect(cancelSpy).toBeCalledTimes(1);
        expect(removeSpy).toBeCalledTimes(1);
        expect(validateSpy).toBeCalledTimes(1);

        const warnSpy = jest.spyOn(console, 'warn')
          .mockImplementationOnce(() => {});
        expect(warnSpy).toBeCalled();
        expect(startSpy).toBeCalledTimes(3);
        expect(saveSpy).toBeCalledTimes(1);
        expect(cancelSpy).toBeCalledTimes(1);
        expect(removeSpy).toBeCalledTimes(1);
        expect(validateSpy).toBeCalledTimes(1);

      });
    });

  });

});
