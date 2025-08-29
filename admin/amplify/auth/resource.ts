import { defineAuth } from '@aws-amplify/backend';
export { setupAuth } from './overrides';
/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
    loginWith: {
        email: true,
    },
    userAttributes: {
        email: {
            mutable: true,
            required: true,
        },
        phoneNumber: {
            mutable: true,
            required: false,
        },
        preferredUsername: {
            mutable: true,
            required: false,
        },
    },
});
