// WTF did not find any other way to detect sandbox environment
const CDK_CONTEXT_JSON = JSON.parse(process.env.CDK_CONTEXT_JSON || '{}');
const backendType = CDK_CONTEXT_JSON['amplify-backend-type'] ?? '';
if (!['sandbox', 'branch'].includes(backendType)) {
    throw new Error(`Unsupported backend type: ${backendType}`);
}
console.log('backendType', backendType);
export const isSandbox = backendType === 'sandbox';
