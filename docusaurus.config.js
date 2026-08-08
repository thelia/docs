module.exports = {
  title: 'Thelia Documentation',
  tagline: 'Open-source e-commerce platform',
  url: 'https://thelia.github.io',
  baseUrl: '/',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  onBrokenLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'thelia',
  projectName: 'docs',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  plugins: [
    'docusaurus-plugin-sass'
  ],
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true
    },
    algolia: {
      appId: 'AOX4BR07WS',
      apiKey: '89985cee3d1d322cb050cd172db4a161',
      indexName: 'thelia',
      contextualSearch: true
    },
    navbar: {
      title: '',
      logo: {
        alt: 'Thelia',
        src: 'img/logo.png',
        srcDark: 'img/logoDark.png',
      },
      items: [
        {
          to: '/',
          label: 'Docs',
          position: 'left',
        },
        {to: 'modules', label: 'Modules', position: 'left'},
        {
          type: 'docsVersionDropdown',
          position: 'right',
          dropdownActiveClassDisabled: true,
        },
        {
          href: 'https://github.com/thelia/thelia',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            { label: 'Discord', href: 'https://discord.gg/YgwpYEE3y3' },
            { label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/thelia' },
            { label: 'Forum', href: 'https://forum.thelia.net/' },
            { label: 'Twitter', href: 'https://twitter.com/theliaecommerce' },
          ],
        },
        {
          title: 'Github',
          items: [
            { label: 'Thelia', href: 'https://github.com/thelia/thelia' },
            { label: 'Thelia project', href: 'https://github.com/thelia/thelia-project' },
            { label: 'Modules', href: 'https://github.com/thelia-modules/' },
          ],
        }
      ],
    },
    prism: {
      additionalLanguages: ['bash', 'php', 'json', 'sql', 'yaml', 'ini', 'nginx', 'docker'],
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/thelia/docs/edit/main/',
          lastVersion: '3.0',
          versions: {
            current: {
              label: 'Next',
              path: 'next',
              banner: 'unreleased',
            },
            '3.0': {
              label: 'Thelia 3',
              path: '',
              banner: 'none',
            },
            '2.x': {
              label: 'Thelia 2',
              path: '2.x',
              banner: 'unmaintained',
            },
          },
        },
        blog: false,
        theme: {
          customCss: [require.resolve('./src/css/custom.scss')]
        },
      },
    ],
  ],
};
