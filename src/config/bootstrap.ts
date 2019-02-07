import Vue from 'vue';

import button from 'bootstrap-vue/es/components/button/button';
import dropdown from 'bootstrap-vue/es/components/dropdown/dropdown';
import dropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
import dropdownItemButton from 'bootstrap-vue/es/components/dropdown/dropdown-item-button';
import navItem from 'bootstrap-vue/es/components/nav/nav-item';
import navItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
import navbar from 'bootstrap-vue/es/components/navbar/navbar';
import navbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import navbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';
import table from 'bootstrap-vue/es/components/table/table';

// Layout
import col from 'bootstrap-vue/es/components/layout/col';
import container from 'bootstrap-vue/es/components/layout/container';
import formRow from 'bootstrap-vue/es/components/layout/form-row';
import row from 'bootstrap-vue/es/components/layout/row';

Vue.component('b-col', col);
Vue.component('b-container', container);
Vue.component('b-formRow', formRow);
Vue.component('b-row', row);

Vue.component('b-button' , button);
Vue.component('b-dropdown' , dropdown);
Vue.component('b-dropdown-item' , dropdownItem);
Vue.component('b-dropdown-item-button' , dropdownItemButton);
Vue.component('b-nav-item' , navItem);
Vue.component('b-nav-item-dropdown' , navItemDropdown);
Vue.component('b-navbar' , navbar);
Vue.component('b-navbar-nav' , navbarNav);
Vue.component('b-navbar-toggle' , navbarToggle);
Vue.component('b-table' , table);
