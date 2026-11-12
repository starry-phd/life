export const ALLOWED_ACCOUNT_NAME = 'starry.phd@gmail.com';
export function assertDeploymentAccount(account) {
  if (!account || account.name !== ALLOWED_ACCOUNT_NAME) {
    throw new Error('部署已阻擋：僅允許 starry.phd@gmail.com，禁止在其他 Cloudflare 帳戶開發或部署。');
  }
}
