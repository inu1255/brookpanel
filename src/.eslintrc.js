module.exports = {
    "env": {
        "es6": true,
        "browser": true,
        "node": true,
    },
    "parser": "babel-eslint",
    "globals": {
        "Vue": true,
        "wx": true,
        "fabric": true,
        "hotkeys": true,
        "VueColor": true,
    },
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 8,
    },
    "globals": {
        "Vuetify": true,
        "wx": true
    },
    "plugins": [],
    "rules": {
        "semi": "warn", //["error", "never"],
        "no-unused-vars": ["warn", { "vars": "all", "args": "none", "ignoreRestSiblings": true }],
        "no-undef": "error",
        "vue/require-v-for-key": "off",
        // "indent": ["error", "tab"],
        // "quotes": ["warn", "double", { "allowTemplateLiterals": true }]
    }
}
