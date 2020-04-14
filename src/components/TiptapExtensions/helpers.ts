import _ from 'lodash';

export function domAttrsGetter(...fields: string[]) {
  return (dom: any) => _.reduce(fields, (acc: any, field: string) => {
    return ({
      ...acc,
      [field]: dom.getAttribute(field),
    });
  }, {});
}

export function mapNodeAttrs(...fields: string[]) {
  return _.reduce(fields, (acc: any, field: string) => ({
    ...acc,
    [field]: {
      get() {
        return (this as any).node.attrs[field];
      },
      set(value: any) {
        (this as any).updateAttrs({
          [field]: value,
        });
      },
    },
  }), {});
}
