import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

@Component({})
export default class EditorContent extends Vue {

  @Prop({ default: null, type: Object })
  private editor;

  @Prop({ default: null, type: String })
  private editorClass;

  @Watch('editor', { immediate: true })
  private onEditorChange(editor) {
    if (this.editor && this.editor.element) {
      this.$nextTick(() => {
        const proseMirror = this.$el.appendChild(editor.element.firstChild);
        proseMirror.className = this.editorClass;
        this.editor.setParentComponent(this)
      })
    }
  }


  public render(createElement) {
    return createElement('div');
  }

  public beforeDestroy() {
    this.editor.element = this.$el;
  }

}
