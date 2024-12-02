export const siteConfig = {
    name: "The Daily Posts",
    description: "Delivering thoughtful insights and compelling stories to our readers every day.",
    defaultLanguage: "en",
    siteUrl: "https://thedailyposts.com", // Replace with your actual domain
    author: {
        name: "The Daily Posts Team",
        email: "team@thedailyposts.com",
        url: "https://thedailyposts.com/about"
    },
    organization: {
        name: "The Daily Posts",
        logo: "/images/logo.svg",
        sameAs: [
            "https://twitter.com/thedailyposts",
            "https://facebook.com/thedailyposts",
            "https://linkedin.com/company/thedailyposts"
        ]
    },
    dateFormat: {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    } as const,
    navigation: [
        { name: "Home", href: "/" },
        { 
            name: "Categories",
            href: "/categories",
            items: [
                { name: "Technology", href: "/categories/technology" },
                { name: "Business", href: "/categories/business" },
                { name: "Science", href: "/categories/science" },
                { name: "Health", href: "/categories/health" }
            ]
        },
        { name: "About", href: "/about" }
    ],
    social: [
        { name: "LinkedIn", icon: "mdi:linkedin", href: "#" },
        { name: "Twitter", icon: "mdi:twitter", href: "#" },
        { name: "Facebook", icon: "mdi:facebook", href: "#" }
    ],
    footer: {
        links: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" }
        ]
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        siteName: "The Daily Posts"
    }
} as const;
