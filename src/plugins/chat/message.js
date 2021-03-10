import ModelWithContact from './model-with-contact.js'
import log from '../../log.js'
import { /*_converse,*/ api, converse } from '../../core.js'

const u = converse.env.utils
const { Strophe } = converse.env

/**
 * Mixin which turns a `ModelWithContact` model into a non-MUC message. These can be either `chat` messages or `headline` messages.
 * @mixin
 * @namespace _converse.Message
 * @memberOf _converse
 * @example const msg = new _converse.Message({'message': 'hello world!'});
 */
const MessageMixin = {
  defaults() {
    return {
      msgid: u.getUniqueId(),
      time: new Date().toISOString(),
      is_ephemeral: false,
    }
  },

  async initialize() {
    if (!this.checkValidity()) {
      return
    }
    this.initialized = u.getResolveablePromise()
    if (this.get('type') === 'chat') {
      ModelWithContact.prototype.initialize.apply(this, arguments)
      this.setRosterContact(Strophe.getBareJidFromJid(this.get('from')))
    }
    /**
     * Triggered once a {@link _converse.Message} has been created and initialized.
     * @event _converse#messageInitialized
     * @type { _converse.Message}
     * @example _converse.api.listen.on('messageInitialized', model => { ... });
     */
    await api.trigger('messageInitialized', this, { Synchronous: true })
    this.initialized.resolve()
  },

  checkValidity() {
    if (Object.keys(this.attributes).length === 3) {
      // XXX: This is an empty message with only the 3 default values.
      // This seems to happen when saving a newly created message
      // fails for some reason.
      // TODO: This is likely fixable by setting `wait` when
      // creating messages. See the wait-for-messages branch.
      this.validationError = 'Empty message'
      this.safeDestroy()
      return false
    }
    return true
  },

  safeDestroy() {
    try {
      this.destroy()
    } catch (e) {
      log.error(e)
    }
  },

  isEphemeral() {
    return this.get('is_ephemeral')
  },

  getDisplayName() {
    if (this.get('type') === 'groupchat') {
      return this.get('nick')
    } else if (this.contact) {
      return this.contact.getDisplayName()
    } else if (this.vcard) {
      return this.vcard.getDisplayName()
    } else {
      return this.get('from')
    }
  },
}

export default MessageMixin
