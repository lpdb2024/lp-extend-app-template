<template>
  <div ref="editorContainer" class="monaco-editor-container" :style="containerStyle"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';

type MonacoEditor = Monaco.editor.IStandaloneCodeEditor;
type MonacoInstance = typeof Monaco;

interface Props {
  modelValue?: string;
  language?: 'typescript' | 'javascript' | 'html' | 'css' | 'json' | 'plaintext';
  theme?: 'vs' | 'vs-dark' | 'hc-black';
  readOnly?: boolean;
  height?: string;
  width?: string;
  minimap?: boolean;
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  fontSize?: number;
  tabSize?: number;
  automaticLayout?: boolean;
  scrollBeyondLastLine?: boolean;
  folding?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'json',
  theme: 'vs-dark',
  readOnly: false,
  height: '400px',
  width: '100%',
  minimap: false,
  lineNumbers: 'on',
  wordWrap: 'on',
  fontSize: 13,
  tabSize: 2,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  folding: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
  'ready': [editor: MonacoEditor];
}>();

const editorContainer = ref<HTMLElement | null>(null);
let editor: MonacoEditor | null = null;
let monaco: MonacoInstance | null = null;

const containerStyle = computed(() => ({
  height: props.height,
  width: props.width,
}));

const getEditorOptions = (): Monaco.editor.IStandaloneEditorConstructionOptions => ({
  value: props.modelValue,
  language: props.language,
  theme: props.theme,
  readOnly: props.readOnly,
  minimap: { enabled: props.minimap },
  lineNumbers: props.lineNumbers,
  wordWrap: props.wordWrap,
  fontSize: props.fontSize,
  tabSize: props.tabSize,
  automaticLayout: props.automaticLayout,
  scrollBeyondLastLine: props.scrollBeyondLastLine,
  folding: props.folding,
  formatOnPaste: true,
  formatOnType: true,
  renderLineHighlight: 'line',
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
  padding: { top: 8, bottom: 8 },
});

const initEditor = async () => {
  if (!editorContainer.value) return;

  const monacoInstance = await loader.init();
  monaco = monacoInstance;

  // Configure TypeScript/JavaScript defaults if available
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const languages = monacoInstance.languages as Record<string, any>;
  if (languages.typescript?.typescriptDefaults) {
    languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
  }

  if (languages.typescript?.javascriptDefaults) {
    languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
  }

  const editorInstance = monacoInstance.editor.create(editorContainer.value, getEditorOptions());
  editor = editorInstance;

  // Listen for content changes
  editorInstance.onDidChangeModelContent(() => {
    const value = editorInstance.getValue();
    emit('update:modelValue', value);
    emit('change', value);
  });

  emit('ready', editorInstance);
};

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue);
  }
});

// Watch for language changes
watch(() => props.language, (newLanguage) => {
  if (editor && monaco) {
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, newLanguage);
    }
  }
});

// Watch for theme changes
watch(() => props.theme, (newTheme) => {
  if (monaco) {
    monaco.editor.setTheme(newTheme);
  }
});

// Watch for readOnly changes
watch(() => props.readOnly, (newReadOnly) => {
  if (editor) {
    editor.updateOptions({ readOnly: newReadOnly });
  }
});

onMounted(() => {
  void initEditor();
});

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
    editor = null;
  }
});

// Expose methods for parent components
defineExpose({
  getEditor: () => editor,
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value),
  formatDocument: () => {
    if (editor) {
      void editor.getAction('editor.action.formatDocument')?.run();
    }
  },
  focus: () => editor?.focus(),
});
</script>

<style scoped>
.monaco-editor-container {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}
</style>
