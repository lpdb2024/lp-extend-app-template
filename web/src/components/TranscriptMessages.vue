<template>
  <div>
    <div v-for="(m) in messages"
    :key="m.seq"
    class="msg-int-msg"
    :class="m.sentBy"
    >
        <q-chat-message
        v-if="
        m.type === 'TEXT_PLAIN' &&
        m.sentBy !== 'CONTROLLER' &&
        m.audience !== MESSAGE_AUDIENCE.AGENTS_AND_MANAGERS
        "
        color="primary"
        :sent="m.sentBy === 'Consumer'"
        :name="m.sentBy === 'Consumer' ? 'you' : m.sentBy"
        :text="santisedMessages(([m.messageData.msg?.text || '']))"
        text-html
        stamp-html
        :stamp="moment(m.timeL).fromNow()"
        >
          <template v-slot:stamp>
            <span class="fr" style="height: 16px"
            v-if="!m.type.includes('secure')"
            >

              <div>
                {{moment(m.timeL).fromNow()}}
              </div>
            </span>
          </template>
        </q-chat-message>

        <q-item
        v-if="
        m.type === 'TEXT_PLAIN' &&
        m.audience === MESSAGE_AUDIENCE.AGENTS_AND_MANAGERS
        "
        >
          <q-item-section side class="bg-yellow-8 br-l-9 w-40">
            <q-icon
            class="m-a ml-8"
            color="black"
            name="sym_o_lock"
            ></q-icon>
          </q-item-section>
          <q-item-section class="bg-indigo-7 br-r-9 p-10">
            {{ sanitiseMessage(m.messageData.msg?.text || '') }}
          </q-item-section>
        </q-item>

    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment';
import { MESSAGE_AUDIENCE } from 'src/constants';
import type { MessageRecord } from 'src/interfaces';
import { sanitiseMessage } from 'src/utils/functions';

defineProps<{
  messages: MessageRecord[]
}>();

const santisedMessages = (msgs: string[]) => {
  return msgs.map(m => sanitiseMessage(m))
}

</script>

<style lang="scss">
.msg-int-msg {
  //
  .q-message {
    margin-bottom: 10px;

    // --agent-msg-bgColor
    .q-message-text.q-message-text--sent {
      background: #8915a3 !important;
      color: #ffffff;

      &::before {
        color: #8915a3;
      }

      .q-message-text-content * {
        color: #ffffff
      }
    }

    .q-message-text.q-message-text--received {
      background: #3f4c73 !important;
      color: #ffffff;

      &::before {
        color: #3f4c73 !important;
      }

      .q-message-text-content * {
        color: #ffffff;
      }
    }
  }
}
</style>
