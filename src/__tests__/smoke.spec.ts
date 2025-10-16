import {
  Api,
} from '@shared/api/ylops';

// FIXME: fix test
describe.skip('tests', () => {
  it('should fail on all unmocked requests', async () => {
    let errormsg = '';
    const spy = jest.spyOn(console, 'error')
      .mockImplementationOnce(() => {});
    try {
      // console.log(Api.defaults);
      await Api.get('/helloworld');
    }
    catch (err: any) {
      errormsg = err.message;
    }

    expect(spy).toBeCalled();
    expect(errormsg).toEqual('No mock defined for config [GET] /eperusteet-ylops-service/api/helloworld\n');
  });
});
