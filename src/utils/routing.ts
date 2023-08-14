import { NavigationNodeDto } from '@shared/tyypit';
import { Location } from 'vue-router/types/router';
import * as _ from 'lodash';
import { ILinkkiHandler } from '@shared/components/EpContent/LinkkiHandler';

const ignoredRouteNames = [];

export function routeToNode(route: Location): NavigationNodeDto | null {
  if (!route || _.includes(ignoredRouteNames, route.name)) {
    return null;
  }

  switch (route.name) {
  case 'tekstikappale':
    return {
      type: 'viite',
      id: Number(route.params?.osaId!),
    };
  case 'opintojakso':
    return {
      type: 'opintojakso',
      id: Number(route.params?.opintojaksoId!),
    };
  case 'oppiaineet':
    return {
      type: 'oppiaineet',
    };
  case 'oppiaine':
    return {
      type: 'oppiaine',
      id: Number(route.params?.oppiaineId!),
    };
  case 'paikallinenOppiaine':
    return {
      type: 'poppiaine',
      id: Number(route.params?.paikallinenOppiaineId!),
    };
  case 'moduuli':
    return {
      type: 'moduuli',
      id: Number(route.params?.moduuliId!),
      meta: {
        oppiaine: route.params?.oppiaineId,
      } as any,
    };
  case 'vuosiluokkakokonaisuus':
    return {
      type: 'vuosiluokkakokonaisuus',
      id: Number(route.params?.vlkId!),
    };
  case 'perusopetusvalinnaiset':
    return {
      type: 'valinnaisetoppiaineet',
      id: Number(route.params?.vlkId!),
    };
  case 'koosteinen-oppiaine':
  case 'perusopetusoppiaine':
    return {
      type: 'perusopetusoppiaine',
      id: Number(route.params?.oppiaineId!),
      meta: {
        vlkId: route.params?.vlkId,
      } as any,
    };
  case 'perusopetuspaikallinenoppiaine':
    return {
      type: 'perusopetusoppiaine',
      id: Number(route.params?.oppiaineId!),
      meta: {
        vlkId: route.params?.vlkId,
        paikallinen: true,
      } as any,
    };
  default:
    break;
  }

  return null;
}

export function nodeToRoute(node: NavigationNodeDto): Location | null {
  if (!node) {
    return null;
  }

  switch (node.type) {
  case 'tiedot':
    return {
      name: 'opsTiedot',
    };
  case 'viite':
    return {
      name: 'tekstikappale',
      params: {
        osaId: _.toString(node.id),
      },
    };
  case 'oppiaineet':
    return {
      name: 'oppiaineet',
    };
  case 'opintojakso':
    return {
      name: 'opintojakso',
      params: {
        opintojaksoId: _.toString(node.id),
      },
    };
  case 'oppiaine':
    return {
      name: 'oppiaine',
      params: {
        oppiaineId: _.toString(node.id),
      },
    };
  case 'poppiaine':
    return {
      name: 'paikallinenOppiaine',
      params: {
        paikallinenOppiaineId: _.toString(node.id),
      },
    };
  case 'moduuli':
    return {
      name: 'moduuli',
      params: {
        moduuliId: _.toString(node.id),
        oppiaineId: _.toString(node.meta?.oppiaine),
      },
    };
  case 'vuosiluokkakokonaisuus':
    return {
      name: 'vuosiluokkakokonaisuus',
      params: {
        vlkId: _.toString(node.id),
      },
    };
  case 'valinnaisetoppiaineet':
    return {
      name: 'perusopetusvalinnaiset',
      params: {
        vlkId: _.toString(node.id),
      },
    };
  case 'perusopetusoppiaine':
    return {
      name: _.get(node, 'meta.paikallinen') === true ? 'perusopetuspaikallinenoppiaine' : 'perusopetusoppiaine',
      params: {
        oppiaineId: _.toString(node.id),
        vlkId: _.toString(node.meta?.vlkId),
      },
    };
  default:
    console.error('Unknown node', node.type);
    break;
  }
  return null;
};

export class LinkkiHandler implements ILinkkiHandler {
  nodeToRoute(node: NavigationNodeDto): Location | null {
    return nodeToRoute(node);
  }
}
