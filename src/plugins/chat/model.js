import ModelWithContact from './model-with-contact.js'
import log from '../../log.js'
import { _converse, api, converse } from '../../core.js'

const u = converse.env.utils

/**
 * Represents an open/ongoing chat conversation.
 *
 * @class
 * @namespace _converse.ChatBox
 * @memberOf _converse
 */
const ChatBox = ModelWithContact.extend({
  defaults() {
    return {
      bookmarked: false,
      chat_state: undefined,
      hidden: _converse.isUniView() && !api.settings.get('singleton'),
      message_type: 'chat',
      nickname: undefined,
      num_unread: 0,
      time_sent: new Date(0).toISOString(),
      time_opened: this.get('time_opened') || new Date().getTime(),
      type: _converse.PRIVATE_CHAT_TYPE,
      url: '',
    }
  },

  async initialize() {
    this.initialized = u.getResolveablePromise()
    ModelWithContact.prototype.initialize.apply(this, arguments)

    const jid = this.get('jid')
    if (!jid) {
      // XXX: The `validate` method will prevent this model
      // from being persisted if there's no jid, but that gets
      // called after model instantiation, so we have to deal
      // with invalid models here also.
      // This happens when the controlbox is in browser storage,
      // but we're in embedded mode.
      return
    }
    this.set({ box_id: `box-${jid}` })

    this.initMessages()

    if (this.get('type') === _converse.PRIVATE_CHAT_TYPE) {
      this.presence =
        _converse.presences.findWhere({ jid: jid }) ||
        _converse.presences.create({ jid: jid })
      await this.setRosterContact(jid)
    }
    /**
     * Triggered once a {@link _converse.ChatBox} has been created and initialized.
     * @event _converse#chatBoxInitialized
     * @type { _converse.ChatBox}
     * @example _converse.api.listen.on('chatBoxInitialized', model => { ... });
     */
    await api.trigger('chatBoxInitialized', this, { Synchronous: true })
    this.initialized.resolve()
  },

  getMessagesCollection() {
    return new _converse.Messages()
  },

  getMessagesCacheKey() {
    return `converse.messages-${this.get('jid')}-${_converse.bare_jid}`
  },

  initMessages() {
    this.messages = this.getMessagesCollection()
    this.messages.fetched = u.getResolveablePromise()
    this.messages.fetched.then(() => {
      /**
       * Triggered whenever a `_converse.ChatBox` instance has fetched its messages from
       * `sessionStorage` but **NOT** from the server.
       * @event _converse#afterMessagesFetched
       * @type {_converse.ChatBoxView | _converse.ChatRoomView}
       * @example _converse.api.listen.on('afterMessagesFetched', view => { ... });
       */
      api.trigger('afterMessagesFetched', this)
    })
    this.messages.chatbox = this
    this.messages.browserStorage = _converse.createStore(
      this.getMessagesCacheKey()
    )
  },

  /**
   * Queue an incoming `chat` message stanza for processing.
   * @async
   * @private
   * @method _converse.ChatRoom#queueMessage
   * @param { Promise<MessageAttributes> } attrs - A promise which resolves to the message attributes
   */
  queueMessage(attrs) {
    return this.msg_chain
  },

  async clearMessages() {
    try {
      await this.messages.clearStore()
    } catch (e) {
      this.messages.trigger('reset')
      log.error(e)
    } finally {
      delete this.msg_chain
      delete this.messages.fetched_flag
      this.messages.fetched = u.getResolveablePromise()
    }
  },

  async close() {
    try {
      await new Promise((success, reject) => {
        return this.destroy({ success, error: (m, e) => reject(e) })
      })
    } catch (e) {
      log.error(e)
    } finally {
      if (api.settings.get('clear_messages_on_reconnection')) {
        await this.clearMessages()
      }
    }
  },

  announceReconnection() {
    /**
     * Triggered whenever a `_converse.ChatBox` instance has reconnected after an outage
     * @event _converse#onChatReconnected
     * @type {_converse.ChatBox | _converse.ChatRoom}
     * @example _converse.api.listen.on('onChatReconnected', chatbox => { ... });
     */
    api.trigger('chatReconnected', this)
  },

  async onReconnection() {
    if (api.settings.get('clear_messages_on_reconnection')) {
      await this.clearMessages()
    }
    this.announceReconnection()
  },

  /**
   * Queue the creation of a message, to make sure that we don't run
   * into a race condition whereby we're creating a new message
   * before the collection has been fetched.
   * @async
   * @private
   * @method _converse.ChatRoom#queueMessageCreation
   * @param { Object } attrs
   */
  async createMessage(attrs, options) {
    attrs.time = attrs.time || new Date().toISOString()
    await this.messages.fetched
    const p = this.messages.create(
      attrs,
      Object.assign({ wait: true, promise: true }, options)
    )
    return p
  },

  maybeShow(force) {},
})

export default ChatBox
