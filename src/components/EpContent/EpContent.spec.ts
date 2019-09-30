import { createLocalVue, mount } from '@vue/test-utils';
import EpContent from './EpContent.vue';
import EpEditorMenuBar from './EpEditorMenuBar.vue';
import { i18n, Kielet } from '@/stores/kieli';
import { Editor } from 'tiptap';
// import { rootConfig } from '@/mainvue';
import '@/config/bootstrap';
import '@/config/fontawesome';

import {
  Blockquote,
  Bold,
  Underline,
  Strike,
  Italic,
  Code,
  CodeBlock,
  HardBreak,
  History,
  BulletList,
  ListItem,
  OrderedList,
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from 'tiptap-extensions';

function createWrapper(localVue, config: any = {}) {
  const editor = new Editor({
    content: '',
    editable: config.isEditable,
    extensions: [
      new HardBreak(),
      new History(),
      new Blockquote(),
      new Bold(),
      new Italic(),
      new Strike(),
      new Underline(),
      new BulletList(),
      new OrderedList(),
      new ListItem(),
      // new Image(),
      new Table({ resizable: true }),
      new TableHeader(),
      new TableCell(),
      new TableRow(),
    ],
  });

  const wrapper = mount(EpEditorMenuBar, {
    localVue,
    attachToDocument: true,
    i18n,
    propsData: {
      help: '',
      layout: 'simplified',
      sticky: false,
      isEditable: false,
      editor: editor,
      ...config,
    },
  });
  return wrapper;
}


describe('EpContentMenu component', () => {
  const localVue = createLocalVue();

  it('Hide menu when read only', async () => {
    const wrapper = createWrapper(localVue, {
      isEditable: false,
    });
    expect(wrapper.html()).toBeFalsy();
  });

  it('Check that menu is rendered when edit is enabled', async () => {
    const wrapper = createWrapper(localVue, {
      isEditable: true,
    });
    expect(wrapper.find('button[title="Lihavoi"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Kursivoi"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Redo"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Undo"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Yliviivaus"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Lisää taulukko"]').exists()).toBe(false);
    expect(wrapper.find('button[title="Lisää kuva"]').exists()).toBe(false);
  });

  it('Check minimal editor mode', async () => {
    const wrapper = createWrapper(localVue, {
      isEditable: true,
      layout: 'minimal',
    });
    expect(wrapper.find('button[title="Redo"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Undo"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Lihavoi"]').exists()).toBe(false);
    expect(wrapper.find('button[title="Kursivoi"]').exists()).toBe(false);
    expect(wrapper.find('button[title="Yliviivaus"]').exists()).toBe(false);
    expect(wrapper.find('button[title="Lisää taulukko"]').exists()).toBe(false);
  });

  it('Check normal editor mode', async () => {
    const wrapper = createWrapper(localVue, {
      isEditable: true,
      layout: 'normal',
    });
    expect(wrapper.find('button[title="Lihavoi"]').exists()).toBe(true);
    expect(wrapper.find('button[class="question"]').exists()).toBe(false);
    expect(wrapper.find('button[title="Kursivoi"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Redo"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Undo"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Yliviivaus"]').exists()).toBe(true);
    expect(wrapper.find('button[title="Lisää taulukko"]').exists()).toBe(true);
  });

});
