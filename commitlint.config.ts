import { RuleConfigSeverity, type UserConfig } from '@commitlint/types';

const englishOnly = /^[A-Za-z0-9\s!@#$%^&*(),.?":{}|<>_-]+$/;

// * Reference: https://commitlint.js.org/reference/configuration.html#typescript-configuration
const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        // * Reference: https://commitlint.js.org/reference/plugins.html#working-with-plugins
        // commit subject는 영어만 포함
        'subject-english-only': ({ subject }) => {
          if (!subject) return [true, ''];
          const valid = englishOnly.test(subject);
          return [valid, 'Commit subject must contain only English characters'];
        },
      },
    },
  ],
  rules: {
    // * Reference: https://commitlint.js.org/reference/rules.html
    // 1. commit type은 반드시 있어야 함
    'type-empty': [RuleConfigSeverity.Error, 'never'],
    // 2. commit subject는 반드시 있어야 함
    'subject-empty': [RuleConfigSeverity.Error, 'never'],
    // 3. commit subject는 최대 50자
    'subject-max-length': [RuleConfigSeverity.Error, 'always', 50],
    // 4. commit scope는 최대 20자
    'scope-max-length': [RuleConfigSeverity.Error, 'always', 20],
    // 5. commit subject는 영어만 포함
    'subject-english-only': [RuleConfigSeverity.Error, 'always'],
  },

  prompt: {
    settings: {},
    messages: {},
    questions: {},
  },
};

export default Configuration;
