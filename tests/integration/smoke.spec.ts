import {
  Api,
} from '@/api';


describe('tests', () => {

  it('should fail on all unmocked requests', async () => {
    let errormsg = '';
    try {
      await Api.get('/helloworld');
    } catch (err) {
      errormsg = err.message;
    }
    expect(errormsg).toEqual('No mock defined for config [GET] /eperusteet-ylops-service/api/helloworld\n');
  });

});
