import { boot } from 'quasar/wrappers';

const TEMPLATE_VERSION = __EXTEND_TEMPLATE_VERSION__;
const CLIENT_SDK_VERSION = __EXTEND_CLIENT_SDK_VERSION__;

export default boot(() => {
  const cyan = 'color: #06b6d4; font-weight: bold';
  const magenta = 'color: #d946ef; font-weight: bold';
  const dim = 'color: #9ca3af';
  const bold = 'color: #e5e7eb; font-weight: bold';
  const reset = '';

  console.log(
    '%c  eX%cTEND %c— Full-stack development framework for LivePerson Conversational Cloud',
    cyan, magenta, dim
  );
  console.log(
    '%c  Template  %c%s  %c  Client SDK  %c%s',
    dim, bold, `v${TEMPLATE_VERSION}`, dim, bold, `v${CLIENT_SDK_VERSION}`
  );
  console.log('');
});
