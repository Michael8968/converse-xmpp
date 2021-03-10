/* START: Removable components
 * --------------------
 * Any of the following components may be removed if they're not needed.
 */

import './plugins/bosh.js'; // XEP-0206 BOSH
import './plugins/chat/index.js'; // RFC-6121 Instant messaging
import './plugins/chatboxes.js';
import './plugins/muc/index.js'; // XEP-0045 Multi-user chat
import './plugins/ping.js'; // XEP-0199 XMPP Ping
import './plugins/roster.js'; // RFC-6121 Contacts Roster
import './plugins/status.js'; // XEP-0199 XMPP Ping
import './plugins/vcard.js'; // XEP-0054 VCard-temp
/* END: Removable components */

import { converse, api } from './core.js';

export { converse as default, api };
