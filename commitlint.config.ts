// https://commitlint.js.org/reference/configuration.html#typescript-configuration
import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
    extends: ['@commitlint/config-conventional'],
};

export default Configuration;
