const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const gClipboardHelper = Cc['@mozilla.org/widget/clipboardhelper;1']
      .getService(Ci.nsIClipboardHelper);
const {Preferences} = Cu.import('resource://gre/modules/Preferences.jsm', {});

const FIREFOX_PREFS = {
  'browser.startup.page': 3,
  'browser.tabs.animate': false,
  'browser.search.suggest.enabled': true,
  'browser.urlbar.suggest.searches': true,
  'browser.urlbar.maxRichResults': 20,
  'browser.tabs.remote.force-enable': true,
  'dom.ipc.processCount': 4
};

const VIMFX_PREFS = {
  'prevent_autofocus': true
};

const MAPPINGS = {
  'go_home': '',
  'stop': '<c-escape>',
  'stop_all': 'a<c-escape>',

  'history_back': 'H',
  'history_forward': 'L',

  'scroll_left': '',
  'scroll_right': '',
  'scroll_half_page_down': '<c-d>',
  'scroll_half_page_up': '<c-u>',
  'mark_scroll_position': 'mm',
  'scroll_to_mark': 'gm',

  'tab_new': 'T',
  'tab_new_after_current': 't',
  'tab_close': 'd',
  'tab_restore': 'u',
  'tab_restore_list': 'U',
  'tab_select_previous': 'h',
  'tab_select_next': 'l',
  'tab_select_first_non_pinned': '^',
  'tab_select_last': '$',

  'enter_mode_ignore': 'I',
  'quote': 'i',

  'custom.mode.normal.copy_selection_or_url': 'yy',
  'custom.mode.normal.copy_as_markdown': 'ym',
  'custom.mode.normal.copy_as_hatena': 'yh',
  'custom.mode.normal.click_toolbar_pocket': 'mp'
};

const {commands} = vimfx.modes.normal;

const CUSTOM_COMMANDS = [
  [
    {
      name: 'copy_as_hatena',
      description: 'Copy title and url as Markdown',
      category: 'location',
      order: commands.copy_current_url.order + 3
    }, ({vim}) => {
      let url = vim.window.gBrowser.selectedBrowser.currentURI.spec;
      let title = vim.window.gBrowser.selectedBrowser.contentTitle;
      let s = `[${url}:title=${title}]`;
      gClipboardHelper.copyString(s);
      vim.notify(`Copied to clipboard: ${s}`);
    }
  ],
  [
    {
      name: 'copy_as_markdown',
      description: 'Copy title and url as Markdown',
      category: 'location',
      order: commands.copy_current_url.order + 2
    }, ({vim}) => {
      let url = vim.window.gBrowser.selectedBrowser.currentURI.spec;
      let title = vim.window.gBrowser.selectedBrowser.contentTitle;
      let s = `[${title}](${url})`;
      gClipboardHelper.copyString(s);
      vim.notify(`Copied to clipboard: ${s}`);
    }
  ],
  [
    {
      name: 'copy_selection_or_url',
      description: 'Copy the selection or current url',
      category: 'location',
      order: commands.copy_current_url.order + 1
    }, ({vim}) => {
      vimfx.send(vim, 'getSelection', true, selection => {
        if (selection == '') {
          selection = vim.window.gBrowser.selectedBrowser.currentURI.spec;
        }
        gClipboardHelper.copyString(selection);
        vim.notify(`Copied to clipboard: ${selection}`);
      });
    }
  ]
];

Object.entries(VIMFX_PREFS).forEach(([name, value]) => {
  vimfx.set(name, value);
});

CUSTOM_COMMANDS.forEach(([options, fn]) => {
  vimfx.addCommand(options, fn);
});

Object.entries(MAPPINGS).forEach(([cmd, key]) => {
  if (!cmd.includes('.')) {
    cmd = `mode.normal.${cmd}`;
  }
  vimfx.set(cmd, key);
});

// for gmail
vimfx.addKeyOverrides(
  [ location => location.hostname === 'mail.google.com',
    ['j', 'k', 'o', 'u', 'e', 'g', 'i', '/', '?']
  ]
)

// for trello
vimfx.addKeyOverrides(
  [ location => location.hostname === 'trello.com',
    ['q']
  ]
)

Preferences.set(FIREFOX_PREFS);

