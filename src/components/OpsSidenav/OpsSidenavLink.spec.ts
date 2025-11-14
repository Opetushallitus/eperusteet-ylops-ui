import { mount } from '@vue/test-utils';
import OpsSidenavLink from './OpsSidenavLink.vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { globalStubs } from '@shared/utils/__tests__/stubs';
import { nextTick } from 'vue';

describe('OpsSidenav component', () => {
  it('shows a element with currect href', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{
        path: '/fi/:id/tiedot',
        name: 'opsTiedot',
        component: { template: '<div>Test</div>' },
      }],
    });

    await router.push({ name: 'opsTiedot', params: { id: '1' } });

    const wrapper = mount(OpsSidenavLink, {
      global: {
        ...globalStubs,
        plugins: [
          ...(globalStubs.plugins || []),
          router,
        ],
      },
      slots: {
        default: 'Linkki',
      },
      props: {
        to: {
          name: 'opsTiedot',
        },
      },
    });

    await nextTick();

    // Check that the router-link stub contains the correct "to" prop
    const routerLink = wrapper.findComponent({ name: 'RouterLinkStub' });
    expect(routerLink.exists()).toBe(true);
    expect(routerLink.props('to').name).toBe('opsTiedot');
  });
});
