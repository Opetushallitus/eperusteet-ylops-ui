<template>
<div v-if="isEditable">
  <editor-menu-bar :editor="editor"
                   :focused="true"
                    v-slot="data"
                    v-sticky="sticky"
                    :sticky-offset="{ top: 103 }"
                    :sticky-z-index="400">
    <div :class="{ 'editor-toolbar': !sticky, 'editor-toolbar-sticky': sticky, 'd-none': !alwaysVisible && !data.focused}">
      <div class="btn-toolbar" role="toolbar">
        <div class="btn-group mr-2" role="group" v-for="(group, idx) in groups" :key="idx">
          <b-button v-for="feature in group"
                  :key="feature.command"
                  :delay="100"
                  :title="$t('editor-' + feature.command)"
                  :variant="sticky ? 'primary' : 'outline'"
                  :disabled="feature.disabled"
                  :class="{ 'active': !feature.disabled && data.isActive[feature.command] && data.isActive[feature.command]() }"
                  @click="feature.customClick ? feature.customClick(data) : data.commands[feature.command](feature.params)">
            <fas v-if="feature.icon" :icon="feature.icon" fixed-width />
            <span v-if="feature.text">{{ $t(feature.text) }}</span>
          </b-button>
        </div>
        <div class="btn-group mr-2" role="group" v-if="help">
          <b-button class="ohje" variant="outline" :id="'ohje-' + id">
            <fas icon="question" fixed-width />
          </b-button>
            <b-popover :target="'ohje-' + id">
              <template v-slot:title>{{ $t('ohje') }}</template>
              {{ $t(help) }}
          </b-popover>
        </div>
      </div>
      <div class="btn-toolbar sub-bar" role="toolbar" v-if="layout === 'normal' && data.isActive.table()">
        <div class="btn-group mr-2" role="group" v-for="(group, idx) in helperTable" :key="idx">
          <b-button v-for="feature in group"
                  :key="feature.command"
                  :title="$t('editor-' + feature.command)"
                  :variant="sticky ? 'primary' : 'outline'"
                  :disabled="feature.disabled"
                  :class="{ 'active': !feature.disabled && data.isActive[feature.command] && data.isActive[feature.command]() }"
                  @click="feature.customClick ? feature.customClick(data) : data.commands[feature.command](feature.params)">
            <fal v-if="feature.icon" class="fa-fw">
              <fas :icon="feature.icon" fixed-width />
              <fas v-if="feature.uppericon" transform="up-4 left-6" :icon="feature.uppericon" :style="{ color: feature.color || 'black' }" />
              <fas v-if="feature.subicon" class="fa-inverse" transform="down-4 left-6" :icon="feature.subicon" :style="{ color: feature.color || 'black' }" />
            </fal>
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

  @Prop({ required: true })
  private isEditable!: boolean;

  @Prop({ required: true })
  private layout!: string;

  @Prop({ required: true })
  private help!: string;

  @Prop({
    required: true,
    type: Boolean,
  })
  private sticky!: boolean;

  @Prop({ default: true })
  private alwaysVisible!: boolean;

  get id() {
    return (this as any)._uid;
  }

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
      icon: 'paperclip',
      command: 'termi',
    }, {
      icon: 'file-image',
      command: 'image',
    }];
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
    }];
  }

  get helperToolbar() {
    return null;
  }

  get helperTable() {
    const RemoveColor = '#e44e4e';
    const AddColor = '#5BCA13';
    const MergeColor = '#ffd024';

    const tables = [{
      color: RemoveColor,
      command: 'deleteTable',
      icon: 'table',
      subicon: 'times',
      text: 'poista-taulu',
    }];

    const columns = [{
      color: AddColor,
      command: 'addColumnBefore',
      icon: 'columns',
      text: 'lisaa-sarake-ennen',
      uppericon: 'plus',
    }, {
      color: AddColor,
      command: 'addColumnAfter',
      icon: 'columns',
      subicon: 'plus',
      text: 'lisaa-sarake-jalkeen',
    }, {
      color: RemoveColor,
      command: 'deleteColumn',
      icon: 'columns',
      subicon: 'times',
      text: 'poista-sarake',
    }];

    const rows = [{
      command: 'addRowBefore',
      color: AddColor,
      icon: 'list',
      uppericon: 'plus',
      text: 'lisaa-rivi-ennen',
    }, {
      command: 'addRowAfter',
      color: AddColor,
      icon: 'list',
      subicon: 'plus',
      text: 'lisaa-rivi-jalkeen',
    }, {
      command: 'deleteRow',
      color: RemoveColor,
      icon: 'list',
      subicon: 'times',
      text: 'poista-rivi',
    }, {
      command: 'toggleCellMerge',
      color: MergeColor,
      icon: 'list',
      subicon: 'object-group',
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

.sub-bar {
  margin-top: 0px;
}

/deep/ .active {
  background: #c1c1c1 !important;
  border-radius: 0;
}

.editor-toolbar {
  background-color: #f1f1f1;
  border: 1px solid #d1d1d1;
  border-bottom: none;
  padding: 0px;
  border-top-left-radius: .25rem;
  border-top-right-radius: .25rem;
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
