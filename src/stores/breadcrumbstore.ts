import Vue from 'vue';


import { Store, State } from './store';


@Store
class BreadcrumbStore {
  @State()
  private crumbs = {};

  // setKey(avain: string, arvo: object) {
  // }
}


export const Breadcrumbs = new BreadcrumbStore();
