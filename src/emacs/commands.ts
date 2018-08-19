import * as monaco from 'monaco-editor';
import * as Actions from './actions';
import { EmacsExtension } from './';

export type EditorCommand = {
  action?: string | string[],
  description?: string,
  run?: (editor: monaco.editor.IStandaloneCodeEditor, extension: EmacsExtension, repeat: number) => void,
};

export interface ICommandMapping {
  [key: string]: EditorCommand;
};

export const prefixPreservingKeys = {
  "M-g": true,
  "C-x": true,
  "C-q": true,
  "C-u": true,
};

const setMarkAction = new Actions.SetMark();
const undoAction = new Actions.UndoAction();
const moveCursorDown = new Actions.MoveCursorDown();
const moveCursorUp = new Actions.MoveCursorUp();
const moveCursorRight = new Actions.MoveCursorRight();
const moveCursorLeft = new Actions.MoveCursorLeft();

export const COMMANDS: ICommandMapping = {
  'M-/': {
    description: '',
    action: 'editor.action.triggerSuggest',
  },
  'M-;': {
    description: '',
    action: 'editor.action.commentLine',
  },
  'C-t': {
    description: '',
    action: 'editor.action.transpose',
  },
  'C-x C-p': {
    description: '',
    action: 'selectAll',
  },
  'Tab': {
    description: '',
    action: 'editor.action.formatDocument',
  },
  'C-Backspace': {
    description: '',
    action: 'deleteWordLeft',
  },
  'M-Backspace': {
    description: '',
    action: 'deleteWordLeft',
  },
  'M-Delete': {
    description: '',
    action: 'deleteWordLeft',
  },
  'C-x C-u': {
    description: '',
    action: 'editor.action.transformToUppercase',
  },
  'C-x C-l': {
    description: '',
    action: 'editor.action.transformToLowercase',
  },
  'C-SPC': setMarkAction,
  'S-C-2': setMarkAction,
  'C-/': undoAction,
  'S-C--': undoAction,
  'C-z': undoAction,
  'C-x u': undoAction,
  'C-n': moveCursorDown,
  'C-p': moveCursorUp,
  'C-f': moveCursorRight,
  // Overriding these keys also overrides the navigation when
  // autocomplete is triggered. so let it be default for now
  // 'Left': moveCursorLeft,
  // 'Down': moveCursorDown,
  // 'Up': moveCursorUp,
  // 'Right': moveCursorRight,
  'C-b': moveCursorLeft,
  'M-f': new Actions.MoveCursorWordRight(),
  'M-b': new Actions.MoveCursorWordLeft(),
  'C-k': new Actions.KillLines(),
  'C-m': new Actions.InsertLineAfter(),
  'C-w': new Actions.KillSelection(),
  'C-o': new Actions.InsertLineBelow(),
  'C-g': new Actions.KeyBoardQuit(),
  'C-e': new Actions.MoveCursorToLineEnd(),
  'C-a': new Actions.MoveCursorToLineStart(),
  'C-y': new Actions.Yank(),
  'M-w': new Actions.YankSelectionToRing(),
  'M-y': new Actions.YankRotate(),
  'C-l': new Actions.RevealToCenterAction(),
  // This needs to be dynamic so that the character after C-q is inserted
  // instead of hardcoded Tab key
  'C-q Tab': new Actions.InsertTabs(),
  'M-r': new Actions.RotateCursorOnScreen(),
  'M-g M-g': new Actions.GotoLine(),
  'C-x C-x': new Actions.InvertSelection(),
  'S-M-.': new Actions.EndOfFile(),
  'S-M-,': new Actions.TopOfFile(),
};

export function executeCommand(ext: EmacsExtension, command: EditorCommand, inputBuffer: string) {
  const editor = ext.getEditor();
  const repeat = parseInt(inputBuffer) || 1;
  if (command.run) {
    command.run(editor, ext, repeat);
    return;
  }

  if (typeof command.action === 'string') {
    for (let i = 0; i < repeat; i++) {
      editor.trigger(Actions.SOURCE, command.action, null);
    }
  } else if (Array.isArray(command.action)) {
    for (let i = 0; i < repeat; i++) {
      command.action.forEach((cmd) => {
        editor.trigger(Actions.SOURCE, cmd, null);
      });
    }
  }
}

export function registerGlobalCommand(key: string, command: EditorCommand) {
  COMMANDS[key] = command;
}

export function getAllMappings(): {[key: string]: string} {
  const result: {[key: string]: string} = {};
  Object.keys(COMMANDS).forEach(key => {
    result[key] = COMMANDS[key].description;
  });
  return result;
}
