import Vue from 'vue';

import dropdown from 'bootstrap-vue/es/components/dropdown/dropdown';
import dropdownItem from 'bootstrap-vue/es/components/dropdown/dropdown-item';
import dropdownItemButton from 'bootstrap-vue/es/components/dropdown/dropdown-item-button';
import navbar from 'bootstrap-vue/es/components/navbar/navbar';
import navbarNav from 'bootstrap-vue/es/components/navbar/navbar-nav';
import navItemDropdown from 'bootstrap-vue/es/components/nav/nav-item-dropdown';
import navbarToggle from 'bootstrap-vue/es/components/navbar/navbar-toggle';

Vue.component('b-dropdown' , dropdown);
Vue.component('b-dropdown-item' , dropdownItem);
Vue.component('b-dropdown-item-button' , dropdownItemButton);
Vue.component('b-navbar' , navbar);
Vue.component('b-navbar-nav' , navbarNav);
Vue.component('b-navbar-toggle' , navbarToggle);
Vue.component('b-nav-item-dropdown' , navItemDropdown);
