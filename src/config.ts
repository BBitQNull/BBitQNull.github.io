export const siteConfig: SiteConfig = {
    title: "Hi! bbitq",
    language: "zh",
    description: "bbitq's personal blog. Powered by Astro Blog Theme Blur.",
    keywords: "bbitq, blog, personal blog, Astro, Astro Blog Theme Blur",
    author: "bbitq",
    avatar: "/avatar.JPG",
    favicon: "/favicon.JPG",
    site: "https://BBitQNull.github.io",

    page_size: 10,
}

export const navBarConfig: NavBarConfig = {
    links: [
        {
            name: 'Projects',
            url: '/projects'
        },
        {
            name: 'Links',
            url: '/links'
        },
        {
            name: 'About',
            url: '/about'
        }
    ]
}

export const socialLinks: SocialLink[] = [
    // https://icon-sets.iconify.design/material-symbols/
    {
        label: 'GitHub',
        icon: 'mdi-github',
        url: 'https://github.com/BBitQNull'
    },
    {
        label: 'Email',
        icon: 'material-symbols:mail-rounded',
        url: 'mailto:bbitq2233@gmail.com'
    },
    {
        label: 'Kaggle',
        icon: 'CibKaggle',
        url: 'https://www.kaggle.com/bbitq2233'
    }
]

interface SiteConfig {
    title: string
    language: string
    description: string
    keywords: string
    author: string
    avatar: string
    favicon: string
    site: string

    page_size: number
    twikoo_uri?: string     // https://twikoo.js.org/
}

interface NavBarConfig {
    links: {
        name: string
        url: string
        target?: string
    }[]
}

interface SocialLink {
    label: string
    icon: string
    url: string
}
