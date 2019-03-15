import { Vue, Component, Prop } from 'vue-property-decorator';

const testData = [
  {
    item: {
      name: 'Tiedot',
    },
    route: {
      name: 'opsTiedot',
    },
    flatten: true,
    children: [
      {
        item: {
          name: 'Dokumentit',
        },
        route: {
          name: 'opsDokumentti',
        },
      }, {
        item: {
          name: 'Poistetut',
        },
        route: {
          name: 'opsPoistetut',
        },
      }, {
        item: {
          name: 'Käsitteet',
        },
        route: {
          name: 'opsKasitteet',
        },
      },
    ],
  },
  {
    item: {
      name: 'Oppiaineet',
    },
    children: [
      {
        item: {
          name: 'Matematiikka',
        },
        children: [
          {
            item: {
              name: 'Matematiikka lyhyt',
            },
            children: [
              {
                item: {
                  name: 'Opintojaksot',
                },
                children: [
                  {
                    item: {
                      name: 'Integraali-opintojakso',
                    },
                  },
                ],
              },
              {
                item: {
                  name: 'Modulit',
                },
                children: [
                  {
                    item: {
                      name: 'Integraali',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

@Component
export default class EpRecursiveNav extends Vue {
  @Prop({ default: () => testData })
  private value: any;

  private current: any;

  public beforeMount() {
    this.current = this.value;
  }

  public vaihdaValikkoa(item: any) {
    this.current = item;
  }
}
