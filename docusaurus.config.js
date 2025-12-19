module.exports = {
  title: 'Thelia documentation',
  tagline: 'Your OpenSource E-commerce tool',
  url: 'https://thelia.github.io',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  favicon: 'img/favicon.png',
  organizationName: 'thelia', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.
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
          href: 'http://doc.thelia.net/',
          className: 'header-link',
          'aria-label': 'Legacy doc',
          label: 'Legacy doc',
          position: 'right',
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
      additionalLanguages: ['bash', 'php', 'smarty', 'sql'],
    }
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/thelia/docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: [require.resolve('./src/css/custom.scss')]
        },
      },
    ],
  ],
};
