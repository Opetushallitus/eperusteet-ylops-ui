<template>
<div>
  <editor-menu-bar :editor="editor"
                   :focused="true"
                    v-slot="data"
                    v-sticky="sticky"
                    :sticky-offset="{ top: 103 }"
                    :sticky-z-index="400">
    <div :class="{'editor-toolbar': !sticky, 'editor-toolbar-sticky': sticky, 'd-none': !alwaysVisible && !data.focused}">
      <div class="btn-toolbar" role="toolbar">
        <div class="btn-group mr-2" role="group" v-for="(group, idx) in groups" :key="idx">
          <b-button v-for="feature in group"
                  :key="feature.command"
                  v-b-tooltip
                  hover
                  :delay="100"
                  :title="$t('editor-' + feature.command)"
                  variant="primary"
                  :disabled="feature.disabled"
                  :class="{ 'active': !feature.disabled && data.isActive[feature.command] && data.isActive[feature.command]() }"
                  @click="feature.customClick ? feature.customClick(data) : data.commands[feature.command](feature.params)">
            <fas v-if="feature.icon" :icon="feature.icon" fixed-width />
            <span v-if="feature.text">{{ $t(feature.text) }}</span>
          </b-button>
        </div>
      </div>
      <b-popover target="huoh">
        <input type="text">
        <a href=""></a>
      </b-popover>
      <div class="btn-toolbar sub-bar" role="toolbar" v-if="data.isActive.table()">
        <div class="btn-group mr-2" role="group" v-for="(group, idx) in helperTable" :key="idx">
          <b-button v-for="feature in group"
                  :key="feature.command"
                  v-b-tooltip.hover
                  v-b-tooltip.delay="300"
                  :title="$t('editor-' + feature.command)"
                  variant="primary"
                  :disabled="feature.disabled"
                  :class="{ 'active': !feature.disabled && data.isActive[feature.command] && data.isActive[feature.command]() }"
                  @click="feature.customClick ? feature.customClick(data) : data.commands[feature.command](feature.params)">
            <fas v-if="feature.icon" :icon="feature.icon" fixed-width />
            <span v-if="feature.text">{{ $t(feature.text) }}</span>
          </b-button>
        </div>
      </div>
    </div>
  </editor-menu-bar>
</div>
</template>

<script lang="ts">
import { Vue, Component, Mixins, Prop, Watch } from 'vue-property-decorator';
import { Editor, EditorMenuBar } from 'tiptap';
import Sticky from 'vue-sticky-directive';

const Options = [];

@Component({
  components: {
    EditorMenuBar,
  },
  directives: {
    Sticky,
  },
})
export default class EpEditorMenuBar extends Vue {
  @Prop({ required: true })
  private editor!: any;

  @Prop({
    default: false,
    type: Boolean,
  })
  private sticky!: boolean;

  @Prop({ default: 'normal' })
  private layout!: string;

  @Prop({ default: true })
  private alwaysVisible!: boolean;

  get history() {
    return [{
      command: 'undo',
      icon: 'undo',
      disabled: true,
    }, {
      command: 'redo',
      icon: 'redo',
      disabled: true,
    }];
  }

  get textManipulation() {
    return [{
      command: 'bold',
      icon: 'bold',
    }, {
      command: 'italic',
      icon: 'italic',
    }, {
      command: 'strike',
      icon: 'strikethrough',
    }, {
      command: 'underline',
      icon: 'underline',
    }];
  }

  private editIcon = false;
  // private addingLink = false;
  // private link = '';

  get linking() {
    return [{
      icon: 'file-image',
      command: 'link',
      customClick: ({ commands, menu, getMarkAttrs }) => {
      },
    }];
    return [{
    //   icon: 'link',
    //   command: 'link',
    //   customClick: ({ commands, menu, getMarkAttrs }) => {
    //     this.addingLink = !this.addingLink;
    //     commands.link({
    //       href: 'http://example.com',
    //     })
    //   },
    // }];
  }

  get lists() {
    return [{
      command: 'bullet_list',
      icon: 'list-ul',
    }, {
      command: 'ordered_list',
      icon: 'list-ol',
    }];
  }

  get tables() {
    return [{
      command: 'createTable',
      params: {
        rowsCount: 3,
        colsCount: 3,
        withHeaderRow: false,
      },
      icon: 'table',
    }, {
      command: 'deleteTable',
      icon: 'times',
    }];
  }

  get helperToolbar() {
    return null;
  }

  get helperTable() {
    const tables = [{
      command: 'deleteTable',
      icon: 'times',
      text: 'poista-taulu',
    }];

    const columns = [{
      command: 'addColumnBefore',
      text: 'lisaa-sarake-ennen',
    }, {
      command: 'addColumnAfter',
      text: 'lisaa-sarake-jalkeen',
    }, {
      command: 'deleteColumn',
      text: 'poista-sarake',
    }];

    const rows = [{
      command: 'addRowBefore',
      text: 'lisaa-rivi-ennen',
    }, {
      command: 'addRowAfter',
      text: 'lisaa-rivi-jalkeen',
    }, {
      command: 'deleteRow',
      text: 'poista-rivi',
    }, {
      command: 'toggleCellMerge',
      text: 'yhdista-solut',
    }];

    return [
      columns,
      rows,
      tables,
    ];
  }

  get groups() {
    if (this.layout === 'normal') {
      return [
        this.history,
        this.textManipulation,
        this.linking,
        this.lists,
        this.tables,
      ];
    }
    else if (this.layout === 'simplified') {
      return [
        this.history,
        this.textManipulation,
      ];
    }
    else {
      return [
        this.history,
      ];
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.menu-placeholder {
  margin-bottom: 57px;
}

.editor-toolbar {
  background-color: #f1f1f1;
  border: 1px solid #d1d1d1;
  padding: 5px;
  border-radius: .25rem;
}

.sub-bar {
  margin-top: 12px;
}

.editor-toolbar-sticky {
  background-color: #fff;
  padding: 5px $content-padding;
  border-bottom: 1px solid #eee;
  position: relative;
  left: -$content-padding;
  width: calc(100% + #{ 2 * $content-padding })
}

</style>
