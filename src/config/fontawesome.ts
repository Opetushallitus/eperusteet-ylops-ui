import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import * as solid from '@fortawesome/free-solid-svg-icons';

library.add(solid.faChevronDown);
library.add(solid.faChevronRight);
library.add(solid.faCog);
library.add(solid.faHome);

Vue.component('fas', FontAwesomeIcon);
